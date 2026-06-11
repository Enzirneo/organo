import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/lib/supabase";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { usePlayers } from "@/features/players/hooks/usePlayers";
import { useTrainingSessions } from "@/features/training/hooks/useTrainingSessions";
import type { GameId, Player, PlayerStatus, Team, TeamStatus, Training, TrainingType } from "@/shared/types";

const STORAGE_KEY = "organo:activeTeamId";

interface WorkspaceCtx {
  teams: Team[];
  players: Player[];
  trainings: Training[];
  loading: boolean;
  activeTeam: Team | null;
  setActiveTeamId: (id: string) => void;
  refresh: () => void;
  addTeam: (t: Omit<Team, "id" | "createdAt" | "members"> & { members?: string[] }) => Promise<void>;
  updateTeam: (id: string, t: Partial<Pick<Team, "name" | "description" | "game" | "status" | "logoUrl">>) => Promise<void>;
  addPlayer: (p: Omit<Player, "id" | "joinedAt">) => Promise<void>;
  addTraining: (t: Omit<Training, "id">) => Promise<void>;
  updatePlayer: (id: string, p: Partial<Pick<Player, "nick" | "role" | "image" | "status" | "teamId" | "game">>) => Promise<void>;
  updateTraining: (id: string, t: Partial<Omit<Training, "id">>) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  removeTraining: (id: string) => Promise<void>;
}

const Ctx = createContext<WorkspaceCtx | null>(null);

const toDbTeamStatus = (status: TeamStatus) => {
  if (status === "em-construcao") return "building";
  if (status === "encerrado") return "archived";
  return "active";
};

const toDbTrainingType = (type: TrainingType) => {
  if (type === "vod-review") return "vod_review";
  if (type === "tatica") return "tactical";
  return type;
};

const getStartsAt = (date: string, time: string) =>
  new Date(`${date}T${time || "00:00"}:00`).toISOString();

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Usuário não autenticado.");
  return data.user.id;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const { data: teams = [], isFetching: teamsFetching } = useTeams();
  const { data: players = [], isFetching: playersFetching } = usePlayers(activeTeamId ?? undefined);
  const { data: trainings = [], isFetching: trainingsFetching } = useTrainingSessions(activeTeamId ?? undefined);

  // When teams load, validate/initialise activeTeamId
  useEffect(() => {
    if (teams.length === 0) return;
    const valid = teams.find((t) => t.id === activeTeamId);
    if (!valid) {
      const fallback = teams[0].id;
      setActiveTeamIdState(fallback);
      localStorage.setItem(STORAGE_KEY, fallback);
    }
  }, [teams, activeTeamId]);

  const setActiveTeamId = useCallback((id: string) => {
    setActiveTeamIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const activeTeam = useMemo(
    () => teams.find((t) => t.id === activeTeamId) ?? teams[0] ?? null,
    [teams, activeTeamId]
  );

  const loading = teamsFetching || playersFetching || trainingsFetching;

  // Invalida todo o cache ao mudar estado de autenticação (login/logout).
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const value = useMemo<WorkspaceCtx>(
    () => ({
      teams,
      players,
      trainings,
      loading,
      activeTeam,
      setActiveTeamId,
      refresh,

      updateTeam: async (id, team) => {
        const updates: Record<string, unknown> = {};
        if (team.name !== undefined) updates.name = team.name;
        if (team.description !== undefined) updates.description = team.description;
        if (team.game !== undefined) updates.game_id = team.game;
        if (team.status !== undefined) updates.status = toDbTeamStatus(team.status);
        if (team.logoUrl !== undefined) updates.logo_url = team.logoUrl;

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.from("teams").update(updates).eq("id", id);
          if (error) throw error;
        }

        queryClient.invalidateQueries({ queryKey: ["teams"] });
      },

      addTeam: async (team) => {
        const { data, error } = await supabase.rpc("create_team_workspace", {
          p_team_name: team.name,
          p_game_id: team.game,
          p_description: team.description || null,
          p_organization_name: `${team.name} Workspace`,
        });

        if (error) throw error;

        const createdTeamId = Array.isArray(data) ? data[0]?.team_id : data?.team_id;

        if (createdTeamId && team.logoUrl) {
          const { error: logoError } = await supabase
            .from("teams")
            .update({ logo_url: team.logoUrl })
            .eq("id", createdTeamId);
          if (logoError) throw logoError;
        }

        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["players"] });

        // Switch to the newly created team
        if (createdTeamId) setActiveTeamId(createdTeamId);
      },

      addPlayer: async (player) => {
        const userId = await getCurrentUserId();

        const { error } = await supabase.from("game_accounts").insert({
          user_id: userId,
          game_id: player.game,
          nickname: player.nick,
          rank: player.role,
        });

        if (error) throw error;

        if (player.teamId) {
          const { error: memberError } = await supabase
            .from("team_members")
            .upsert(
              {
                team_id: player.teamId,
                user_id: userId,
                role: "player",
                status: player.status === "afastado" ? "inactive" : "active",
                position: player.role,
              },
              { onConflict: "team_id,user_id" }
            );
          if (memberError) throw memberError;
        }

        queryClient.invalidateQueries({ queryKey: ["players"] });
      },

      updatePlayer: async (id, player) => {
        if (player.nick !== undefined || player.role !== undefined || player.image !== undefined || player.game !== undefined) {
          const { data: member, error: memberError } = await supabase
            .from("team_members")
            .select("user_id")
            .eq("id", id)
            .single();
          if (memberError) throw memberError;

          const accountUpdates: Record<string, unknown> = {};
          if (player.nick !== undefined) accountUpdates.nickname = player.nick;
          if (player.role !== undefined) accountUpdates.rank = player.role;
          if (player.game !== undefined) accountUpdates.game_id = player.game;

          if (Object.keys(accountUpdates).length > 0) {
            const { error } = await supabase
              .from("game_accounts")
              .update(accountUpdates)
              .eq("user_id", member.user_id)
              .eq("game_id", player.game ?? undefined);
            if (error) throw error;
          }

          if (player.image !== undefined) {
            const { error: profileError } = await supabase
              .from("profiles")
              .update({ avatar_url: player.image })
              .eq("id", member.user_id);
            if (profileError) throw profileError;
          }
        }

        const memberUpdates: Record<string, unknown> = {};
        if (player.status !== undefined)
          memberUpdates.status = player.status === "afastado" ? "inactive" : "active";
        if (player.role !== undefined) memberUpdates.position = player.role;
        if (player.teamId !== undefined) memberUpdates.team_id = player.teamId;

        if (Object.keys(memberUpdates).length > 0) {
          const { error } = await supabase
            .from("team_members")
            .update(memberUpdates)
            .eq("id", id);
          if (error) throw error;
        }

        queryClient.invalidateQueries({ queryKey: ["players"] });
      },

      updateTraining: async (id, training) => {
        const updates: Record<string, unknown> = {};
        if (training.title !== undefined) updates.title = training.title;
        if (training.objective !== undefined) updates.objective = training.objective;
        if (training.type !== undefined) updates.type = toDbTrainingType(training.type);
        if (training.date !== undefined || training.time !== undefined) {
          const existing = (await supabase.from("training_sessions").select("starts_at").eq("id", id).single()).data;
          const existingIso = existing?.starts_at ?? "";
          const date = training.date ?? existingIso.slice(0, 10);
          const time = training.time ?? existingIso.slice(11, 16);
          updates.starts_at = getStartsAt(date, time);
        }
        if (training.participants !== undefined) {
          updates.visibility = training.participants.length > 0 ? "selected" : "team";
        }

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.from("training_sessions").update(updates).eq("id", id);
          if (error) throw error;
        }

        if (training.participants !== undefined) {
          await supabase.from("training_participants").delete().eq("training_id", id);
          if (training.participants.length > 0) {
            const { error } = await supabase
              .from("training_participants")
              .insert(training.participants.map((uid) => ({ training_id: id, user_id: uid })));
            if (error) throw error;
          }
        }

        queryClient.invalidateQueries({ queryKey: ["training_sessions"] });
      },

      addTraining: async (training) => {
        const userId = await getCurrentUserId();
        const teamId = training.teamId ?? activeTeam?.id;

        if (!teamId) throw new Error("Crie ou selecione um time antes de agendar o treino.");

        const { data, error } = await supabase
          .from("training_sessions")
          .insert({
            team_id: teamId,
            created_by: userId,
            title: training.title,
            objective: training.objective,
            type: toDbTrainingType(training.type),
            visibility: training.participants.length > 0 ? "selected" : "team",
            starts_at: getStartsAt(training.date, training.time),
          })
          .select("id")
          .single();

        if (error) throw error;

        if (training.participants.length > 0) {
          const { error: participantsError } = await supabase
            .from("training_participants")
            .insert(training.participants.map((uid) => ({ training_id: data.id, user_id: uid })));
          if (participantsError) throw participantsError;
        }

        queryClient.invalidateQueries({ queryKey: ["training_sessions"] });
      },

      removeTeam: async (id) => {
        const { error } = await supabase.from("teams").delete().eq("id", id);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["training_sessions"] });
      },

      // Remove o membro do time (team_members.id).
      // Não destrói a game_account do usuário, apenas o remove do roster.
      removePlayer: async (id) => {
        const { error } = await supabase.from("team_members").delete().eq("id", id);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["players"] });
      },

      removeTraining: async (id) => {
        const { error } = await supabase.from("training_sessions").delete().eq("id", id);
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ["training_sessions"] });
      },
    }),
    [teams, players, trainings, loading, activeTeam, setActiveTeamId, refresh, queryClient]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useWorkspace = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
