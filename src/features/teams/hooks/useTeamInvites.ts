import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import type { TeamRole } from "@/shared/types";

export interface TeamInvite {
  id: string;
  teamId: string;
  invitedEmail: string;
  role: TeamRole;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export function useTeamInvites(teamId: string | null) {
  return useQuery({
    queryKey: ["team_invites", teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamInvite[]> => {
      const { data, error } = await supabase
        .from("team_invites")
        .select("id, team_id, invited_email, role, token, expires_at, created_at")
        .eq("team_id", teamId!)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row) => ({
        id: row.id as string,
        teamId: row.team_id as string,
        invitedEmail: row.invited_email as string,
        role: row.role as TeamRole,
        token: row.token as string,
        expiresAt: row.expires_at as string,
        createdAt: row.created_at as string,
      }));
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      email,
      role,
    }: {
      teamId: string;
      email: string;
      role: TeamRole;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Usuário não autenticado.");

      const { error } = await supabase.from("team_invites").insert({
        team_id: teamId,
        invited_email: email.trim().toLowerCase(),
        invited_by: session.user.id,
        role,
      });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team_invites", variables.teamId] });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId, teamId }: { inviteId: string; teamId: string }) => {
      const { error } = await supabase.from("team_invites").delete().eq("id", inviteId);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team_invites", variables.teamId] });
    },
  });
}
