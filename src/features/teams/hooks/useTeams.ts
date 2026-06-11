import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { GameId, Team, TeamRole, TeamStatus } from "@/shared/types";

const fromDbStatus = (s?: string | null): TeamStatus => {
  if (s === "building") return "em-construcao";
  if (s === "archived") return "encerrado";
  return "ativo";
};

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async (): Promise<Team[]> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return [];

      const myId = session.user.id;

      const { data, error } = await supabase
        .from("teams")
        .select("id, name, description, game_id, status, logo_url, created_at, team_members(user_id, role, status)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((team) => {
        const members = (team.team_members as { user_id: string; role: string; status: string }[]) ?? [];
        const myMembership = members.find((m) => m.user_id === myId);
        return {
          id: team.id as string,
          name: team.name as string,
          description: (team.description as string | null) ?? "",
          game: team.game_id as GameId,
          status: fromDbStatus(team.status as string | null),
          members: members.filter((m) => m.status === "active").map((m) => m.user_id),
          createdAt: String(team.created_at).slice(0, 10),
          logoUrl: (team.logo_url as string | null) ?? undefined,
          myRole: (myMembership?.role as TeamRole) ?? undefined,
        };
      });
    },
  });
}
