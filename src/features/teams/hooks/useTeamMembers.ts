import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { TeamRole } from "@/shared/types";

export interface TeamMember {
  id: string;
  userId: string;
  nick: string;
  fullName?: string;
  avatar: string;
  role: TeamRole;
  status: "active" | "inactive" | "invited";
  joinedAt: string;
}

export function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ["team_members", teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id, user_id, role, status, joined_at,
          profiles(display_name, nickname, full_name, avatar_url)
        `)
        .eq("team_id", teamId!)
        .neq("status", "removed")
        .order("joined_at", { ascending: true });

      if (error) throw error;

      return (data ?? []).flatMap((m): TeamMember[] => {
        const profile = m.profiles as {
          display_name: string;
          nickname: string | null;
          full_name: string | null;
          avatar_url: string | null;
        } | null;

        if (!profile) return [];

        return [
          {
            id: m.id as string,
            userId: m.user_id as string,
            nick: profile.nickname ?? profile.display_name ?? "Membro",
            fullName: (profile.full_name ?? profile.display_name) ?? undefined,
            avatar:
              profile.avatar_url ??
              `https://i.pravatar.cc/200?u=${m.user_id}`,
            role: m.role as TeamRole,
            status: m.status as TeamMember["status"],
            joinedAt: String(m.joined_at).slice(0, 10),
          },
        ];
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      teamId: string;
      role: TeamRole;
    }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team_members", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId }: { memberId: string; teamId: string }) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team_members", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
