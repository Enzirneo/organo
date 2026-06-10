import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/shared/lib/supabase";
import type { GameId, Player, PlayerStatus, Team, TeamStatus, Training, TrainingType } from "@/shared/types";

interface WorkspaceCtx {
  teams: Team[];
  players: Player[];
  trainings: Training[];
  loading: boolean;
  refresh: () => Promise<void>;
  addTeam: (t: Omit<Team, "id" | "createdAt" | "members"> & { members?: string[] }) => Promise<void>;
  addPlayer: (p: Omit<Player, "id" | "joinedAt">) => Promise<void>;
  addTraining: (t: Omit<Training, "id">) => Promise<void>;
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

const fromDbTeamStatus = (status?: string | null): TeamStatus => {
  if (status === "building") return "em-construcao";
  if (status === "archived") return "encerrado";
  return "ativo";
};

const toDbTrainingType = (type: TrainingType) => {
  if (type === "vod-review") return "vod_review";
  if (type === "tatica") return "tactical";
  return type;
};

const fromDbTrainingType = (type?: string | null): TrainingType => {
  if (type === "vod_review") return "vod-review";
  if (type === "tactical") return "tatica";
  if (type === "individual" || type === "scrim") return type;
  return "tatica";
};

const getStartsAt = (date: string, time: string) => new Date(`${date}T${time || "00:00"}:00`).toISOString();

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Usuário não autenticado.");
  return data.user.id;
}

async function ensureDefaultOrganization(organizationName?: string) {
  const userId = await getCurrentUserId();

  const { data: existingMembership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (membershipError) throw membershipError;

  if (existingMembership?.organization_id) {
    return existingMembership.organization_id as string;
  }

  const { data: existingOrg, error: existingOrgError } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingOrgError) throw existingOrgError;

  if (existingOrg?.id) {
    const { error: memberError } = await supabase
      .from("organization_members")
      .upsert(
        {
          organization_id: existingOrg.id,
          user_id: userId,
          role: "owner",
          status: "active",
        },
        { onConflict: "organization_id,user_id" }
      );

    if (memberError) throw memberError;

    return existingOrg.id as string;
  }

  const { data: userData } = await supabase.auth.getUser();
  const meta = userData.user?.user_metadata ?? {};
  const name = organizationName || meta.organization_name || "Minha organização";

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ owner_id: userId, name })
    .select("id")
    .single();

  if (orgError) throw orgError;

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
      status: "active",
    });

  if (memberError) throw memberError;

  return org.id as string;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      setTeams([]);
      setPlayers([]);
      setTrainings([]);
      return;
    }

    setLoading(true);

    try {
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id, name, description, game_id, status, logo_url, created_at")
        .order("created_at", { ascending: false });

      if (teamsError) throw teamsError;

      const mappedTeams: Team[] = (teamsData ?? []).map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description ?? "",
        game: team.game_id as GameId,
        status: fromDbTeamStatus(team.status),
        members: [],
        createdAt: String(team.created_at).slice(0, 10),
        logoUrl: team.logo_url ?? undefined,
      }));

      const { data: accountsData, error: accountsError } = await supabase
        .from("game_accounts")
        .select("id, user_id, game_id, nickname, rank, avatar_url, created_at")
        .order("created_at", { ascending: false });

      if (accountsError) throw accountsError;

      const { data: memberData } = await supabase
        .from("team_members")
        .select("team_id, user_id, position, status, joined_at");

      const teamByUser = new Map<string, { teamId?: string; position?: string; status?: string; joinedAt?: string }>();
      (memberData ?? []).forEach((member) => {
        if (!teamByUser.has(member.user_id)) {
          teamByUser.set(member.user_id, {
            teamId: member.team_id,
            position: member.position ?? undefined,
            status: member.status ?? undefined,
            joinedAt: member.joined_at ?? undefined,
          });
        }
      });

      const mappedPlayers: Player[] = (accountsData ?? []).map((account) => {
        const member = teamByUser.get(account.user_id);
        return {
          id: account.id,
          userId: account.user_id,
          nick: account.nickname,
          fullName: undefined,
          role: member?.position || account.rank || "Player",
          image: account.avatar_url || `https://i.pravatar.cc/200?u=${account.id}`,
          game: account.game_id as GameId,
          teamId: member?.teamId,
          status: member?.status === "inactive" ? "afastado" : "ativo",
          joinedAt: String(member?.joinedAt ?? account.created_at).slice(0, 10),
        };
      });

      const { data: trainingsData, error: trainingsError } = await supabase
        .from("training_sessions")
        .select("id, team_id, title, objective, description, type, starts_at")
        .order("starts_at", { ascending: true });

      if (trainingsError) throw trainingsError;

      const mappedTrainings: Training[] = (trainingsData ?? []).map((training) => {
        const startsAt = new Date(training.starts_at);
        const team = mappedTeams.find((t) => t.id === training.team_id);
        return {
          id: training.id,
          title: training.title,
          date: startsAt.toISOString().slice(0, 10),
          time: startsAt.toTimeString().slice(0, 5),
          game: team?.game ?? "valorant",
          objective: training.objective ?? training.description ?? "",
          type: fromDbTrainingType(training.type),
          participants: [],
          teamId: training.team_id,
        };
      });

      setTeams(mappedTeams);
      setPlayers(mappedPlayers);
      setTrainings(mappedTrainings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const runRefresh = () => {
      if (!cancelled) void refresh().catch(console.error);
    };

    runRefresh();

    const { data } = supabase.auth.onAuthStateChange(() => {
      // Não chama getSession/getUser diretamente dentro do callback do Auth.
      // Isso evita o loading infinito em alguns fluxos do Supabase.
      window.setTimeout(runRefresh, 0);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [refresh]);

  const value = useMemo<WorkspaceCtx>(() => ({
    teams,
    players,
    trainings,
    loading,
    refresh,
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
        await supabase.from("teams").update({ logo_url: team.logoUrl }).eq("id", createdTeamId);
      }

      await refresh();
    },
    addPlayer: async (player) => {
      const userId = await getCurrentUserId();

      const { error } = await supabase.from("game_accounts").insert({
        user_id: userId,
        game_id: player.game,
        nickname: player.nick,
        rank: player.role,
        avatar_url: player.image || null,
      });

      if (error) throw error;

      if (player.teamId) {
        await supabase.from("team_members").upsert({
          team_id: player.teamId,
          user_id: userId,
          role: "player",
          status: player.status === "afastado" ? "inactive" : "active",
          position: player.role,
        }, { onConflict: "team_id,user_id" });
      }

      await refresh();
    },
    addTraining: async (training) => {
      const userId = await getCurrentUserId();
      const teamId = training.teamId || teams.find((team) => team.game === training.game)?.id;

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
        const { error: participantsError } = await supabase.from("training_participants").insert(
          training.participants.map((userId) => ({ training_id: data.id, user_id: userId }))
        );
        if (participantsError) throw participantsError;
      }

      await refresh();
    },
    removeTeam: async (id) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    removePlayer: async (id) => {
      const { error } = await supabase.from("game_accounts").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
    removeTraining: async (id) => {
      const { error } = await supabase.from("training_sessions").delete().eq("id", id);
      if (error) throw error;
      await refresh();
    },
  }), [teams, players, trainings, loading, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useWorkspace = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
