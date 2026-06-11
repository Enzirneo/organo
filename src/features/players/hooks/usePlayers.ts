import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { GameId, Player, PlayerStatus } from "@/shared/types";

export function usePlayers(teamId?: string) {
  return useQuery({
    queryKey: ["players", teamId ?? "all"],
    queryFn: async (): Promise<Player[]> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return [];

      let query = supabase
        .from("team_members")
        .select(`
          id, team_id, user_id, role, position, status, joined_at,
          profiles(display_name, nickname, full_name, avatar_url),
          teams(game_id)
        `)
        .eq("status", "active");

      if (teamId) query = query.eq("team_id", teamId);

      const { data, error } = await query;

      if (error) throw error;

      return (data ?? []).flatMap((m): Player[] => {
        const profile = m.profiles as {
          display_name: string;
          nickname: string | null;
          full_name: string | null;
          avatar_url: string | null;
        } | null;
        const team = m.teams as { game_id: string } | null;

        if (!profile || !team) return [];

        const nick = profile.nickname ?? profile.display_name ?? "Jogador";
        const memberStatus: PlayerStatus = m.status === "inactive" ? "afastado" : "ativo";

        return [
          {
            id: m.id as string,
            userId: m.user_id as string,
            nick,
            fullName: profile.full_name ?? profile.display_name ?? undefined,
            role: (m.position as string | null) ?? (m.role as string),
            image: profile.avatar_url ?? `https://i.pravatar.cc/200?u=${m.user_id}`,
            game: team.game_id as GameId,
            teamId: m.team_id as string,
            status: memberStatus,
            joinedAt: String(m.joined_at).slice(0, 10),
          },
        ];
      });
    },
  });
}
