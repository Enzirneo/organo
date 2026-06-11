import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { GameId, Training, TrainingType } from "@/shared/types";

const fromDbType = (type?: string | null): TrainingType => {
  if (type === "vod_review") return "vod-review";
  if (type === "tactical") return "tatica";
  if (type === "individual" || type === "scrim") return type;
  return "tatica";
};

export function useTrainingSessions(teamId?: string) {
  return useQuery({
    queryKey: ["training_sessions", teamId ?? "all"],
    queryFn: async (): Promise<Training[]> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return [];

      let query = supabase
        .from("training_sessions")
        .select(`
          id, team_id, title, objective, description, type, starts_at,
          training_participants(user_id),
          teams(game_id)
        `)
        .order("starts_at", { ascending: true });

      if (teamId) query = query.eq("team_id", teamId);

      const { data, error } = await query;

      if (error) throw error;

      return (data ?? []).map((t): Training => {
        const startsAt = new Date(t.starts_at as string);
        const team = t.teams as { game_id: string } | null;

        return {
          id: t.id as string,
          title: t.title as string,
          date: startsAt.toISOString().slice(0, 10),
          time: startsAt.toTimeString().slice(0, 5),
          game: (team?.game_id ?? "valorant") as GameId,
          objective: (t.objective as string | null) ?? (t.description as string | null) ?? "",
          type: fromDbType(t.type as string | null),
          participants: ((t.training_participants as { user_id: string }[]) ?? []).map(
            (p) => p.user_id
          ),
          teamId: t.team_id as string,
        };
      });
    },
  });
}
