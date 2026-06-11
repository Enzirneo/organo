import { ReactNode, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, Pencil, Plus, Search, Trash2, Users, CalendarRange } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { GameBadge, StatusDot } from "@/shared/components/ui/GameBadge";
import { supabase } from "@/shared/lib/supabase";
import { useWorkspace } from "@/shared/lib/workspace";
import { GAMES } from "@/shared/data/games";
import type { GameId, Team, TeamRole, TeamStatus } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { toast } from "sonner";
import {
  useTeamInvites,
  useCreateInvite,
  useRevokeInvite,
} from "@/features/teams/hooks/useTeamInvites";
import {
  useTeamMembers,
  useUpdateMemberRole,
  useRemoveMember,
  type TeamMember,
} from "@/features/teams/hooks/useTeamMembers";

const MANAGER_ROLES: TeamRole[] = ["owner", "leader", "coach"];

const ROLE_LABELS: Record<TeamRole, string> = {
  owner: "Dono",
  leader: "Líder",
  coach: "Coach",
  analyst: "Analista",
  player: "Jogador",
};

export default function TeamsPage() {
  const { teams, players, trainings, addTeam, updateTeam, removeTeam } = useWorkspace();

  const [filter, setFilter] = useState<GameId | "all">("all");
  const [q, setQ] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    game: "valorant" as GameId,
    status: "ativo" as TeamStatus,
    logoUrl: "",
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });
  }, []);

  const [form, setForm] = useState({
    name: "",
    description: "",
    game: "valorant" as GameId,
    status: "ativo" as TeamStatus,
    logoUrl: "",
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "player" as TeamRole,
  });

  const filtered = useMemo(
    () =>
      teams.filter(
        (t) =>
          (filter === "all" || t.game === filter) &&
          t.name.toLowerCase().includes(q.toLowerCase())
      ),
    [teams, filter, q]
  );

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome do time");
      return;
    }
    try {
      await addTeam({ ...form, name: form.name.trim(), description: form.description.trim() });
      toast.success("Time criado");
      setCreateOpen(false);
      setForm({ name: "", description: "", game: "valorant", status: "ativo", logoUrl: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o time");
    }
  };

  const handleDelete = async (team: Team) => {
    try {
      await removeTeam(team.id);
      toast.success("Time removido");
      setSelectedTeam(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover o time");
    }
  };

  const openEdit = (team: Team) => {
    setEditForm({
      name: team.name,
      description: team.description,
      game: team.game,
      status: team.status,
      logoUrl: team.logoUrl ?? "",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedTeam) return;
    if (!editForm.name.trim()) {
      toast.error("Informe o nome do time");
      return;
    }
    try {
      await updateTeam(selectedTeam.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        game: editForm.game,
        status: editForm.status,
        logoUrl: editForm.logoUrl || undefined,
      });
      toast.success("Time atualizado");
      setEditOpen(false);
      setSelectedTeam((prev) =>
        prev ? { ...prev, ...editForm, logoUrl: editForm.logoUrl || prev.logoUrl } : null
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o time");
    }
  };

  const selectedTrainings = useMemo(
    () => (selectedTeam ? trainings.filter((t) => t.teamId === selectedTeam.id) : []),
    [trainings, selectedTeam]
  );

  const canManage = selectedTeam?.myRole ? MANAGER_ROLES.includes(selectedTeam.myRole) : false;

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Times"
        description="Gerencie lineups, status e modalidade competitiva."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Plus className="mr-1 size-4" />
                Novo time
              </Button>
            </DialogTrigger>

            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Criar time</DialogTitle>
                <DialogDescription>
                  Cadastre uma lineup vinculada a um jogo competitivo.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <ImageUpload
                  value={form.logoUrl}
                  onChange={(url) => setForm({ ...form, logoUrl: url })}
                  bucket="team-logos"
                  placeholder="Logo do time"
                  className="h-28 w-full"
                />
                <Input
                  placeholder="Nome do time"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Textarea
                  placeholder="Descrição"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <Select value={form.game} onValueChange={(v) => setForm({ ...form, game: v as GameId })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GAMES.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as TeamStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="em-construcao">Em construção</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar time..."
            className="pl-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Todos</FilterChip>
          {GAMES.map((g) => (
            <FilterChip key={g.id} active={filter === g.id} onClick={() => setFilter(g.id)}>
              {g.short}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => {
            const teamPlayers = players.filter((p) => p.teamId === t.id).slice(0, 5);
            return (
              <motion.article
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass glass-hover group relative cursor-pointer rounded-2xl overflow-hidden"
                onClick={() => setSelectedTeam(t)}
              >
                <div className="relative h-32 overflow-hidden">
                  {t.logoUrl ? (
                    <img
                      src={t.logoUrl}
                      alt={t.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-primary/20 via-card to-card" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                </div>

                <div className="p-5 -mt-2">
                  <p className="font-display flex items-center gap-2 text-lg leading-tight">
                    <StatusDot status={t.status} />
                    {t.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {teamPlayers.map((p) => (
                        <img
                          key={p.id}
                          src={p.image}
                          alt={p.nick}
                          className="size-8 rounded-full border-2 border-background object-cover"
                        />
                      ))}
                      {teamPlayers.length === 0 && (
                        <span className="text-xs text-muted-foreground">Sem jogadores</span>
                      )}
                    </div>
                    <GameBadge game={t.game} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal de detalhe do time */}
      <Dialog open={!!selectedTeam} onOpenChange={(open) => { if (!open) setSelectedTeam(null); }}>
        {selectedTeam && (
          <DialogContent className="glass max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {selectedTeam.logoUrl && (
                  <img
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                    className="size-12 rounded-xl object-cover"
                  />
                )}
                <div>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <StatusDot status={selectedTeam.status} />
                    {selectedTeam.name}
                  </DialogTitle>
                  <div className="mt-1 flex items-center gap-2">
                    <GameBadge game={selectedTeam.game} />
                    {selectedTeam.myRole && (
                      <Badge variant="secondary" className="text-xs">
                        {ROLE_LABELS[selectedTeam.myRole]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            {selectedTeam.description && (
              <p className="text-sm text-muted-foreground">{selectedTeam.description}</p>
            )}

            {/* Membros */}
            <MembersSection
              teamId={selectedTeam.id}
              myRole={selectedTeam.myRole}
              currentUserId={currentUserId}
              onInvite={() => setInviteOpen(true)}
            />

            {/* Convites pendentes (visível só para managers) */}
            {canManage && (
              <PendingInvites teamId={selectedTeam.id} />
            )}

            {/* Treinos do time */}
            {selectedTrainings.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <CalendarRange className="size-4 text-muted-foreground" />
                  Treinos ({selectedTrainings.length})
                </h3>
                <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedTrainings.map((tr) => (
                    <li
                      key={tr.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-1.5 text-sm"
                    >
                      <span className="truncate">{tr.title}</span>
                      <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                        {new Date(tr.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {tr.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className="gap-2">
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(selectedTeam)}
                >
                  <Pencil className="size-3.5 mr-1.5" />
                  Editar
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Excluir time</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir "{selectedTeam.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação remove o time, todos os seus membros e treinos permanentemente. Não é possível desfazer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(selectedTeam)}
                    >
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal de edição do time */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditOpen(false); }}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Editar time</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <ImageUpload
              value={editForm.logoUrl}
              onChange={(url) => setEditForm({ ...editForm, logoUrl: url })}
              bucket="team-logos"
              placeholder="Logo do time"
              className="h-28 w-full"
            />
            <Input
              placeholder="Nome do time"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <Textarea
              placeholder="Descrição"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <Select value={editForm.game} onValueChange={(v) => setEditForm({ ...editForm, game: v as GameId })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GAMES.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as TeamStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="em-construcao">Em construção</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={submitEdit} className="bg-gradient-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de convite */}
      {selectedTeam && (
        <InviteModal
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          inviteForm={inviteForm}
          setInviteForm={setInviteForm}
        />
      )}
    </div>
  );
}

// ── Membros do time ─────────────────────────────────────────────────────────

const AVAILABLE_ROLES_BY_ROLE: Record<string, TeamRole[]> = {
  owner: ["owner", "leader", "coach", "analyst", "player"],
  leader: ["leader", "coach", "analyst", "player"],
  coach: ["leader", "coach", "analyst", "player"],
};

function MembersSection({
  teamId,
  myRole,
  currentUserId,
  onInvite,
}: {
  teamId: string;
  myRole: TeamRole | undefined;
  currentUserId: string | null;
  onInvite: () => void;
}) {
  const { data: members = [], isLoading } = useTeamMembers(teamId);
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const canManage = myRole ? MANAGER_ROLES.includes(myRole) : false;
  const isOwner = myRole === "owner";
  const availableRoles: TeamRole[] = AVAILABLE_ROLES_BY_ROLE[myRole ?? ""] ?? [];

  const canChangeRole = (member: TeamMember) => {
    if (!canManage) return false;
    if (member.userId === currentUserId) return false;
    if (member.role === "owner" && !isOwner) return false;
    return true;
  };

  const canRemoveMember = (member: TeamMember) => {
    if (!canManage) return false;
    if (member.userId === currentUserId) return false;
    if (member.role === "owner" && !isOwner) return false;
    return true;
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Users className="size-4 text-muted-foreground" />
          Membros ({isLoading ? "…" : members.length})
        </h3>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 rounded-full text-xs"
            onClick={onInvite}
          >
            <Mail className="size-3" />
            Convidar
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum membro ainda.</p>
      ) : (
        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {members.map((member) => {
            const statusLabel = member.status === "active" ? "Ativo" : member.status === "invited" ? "Convidado" : "Inativo";
            const dotStatus = member.status === "active" ? "ativo" : "afastado";

            return (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2"
              >
                <img
                  src={member.avatar}
                  alt={member.nick}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.nick}</p>
                  {canChangeRole(member) ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          disabled={updateRole.isPending}
                        >
                          {ROLE_LABELS[member.role]}
                          <ChevronDown className="size-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {availableRoles.map((r) => (
                          <DropdownMenuItem
                            key={r}
                            onSelect={() =>
                              updateRole.mutate(
                                { memberId: member.id, teamId, role: r },
                                { onError: () => toast.error("Não foi possível alterar o cargo.") }
                              )
                            }
                          >
                            {ROLE_LABELS[r]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[member.role]}</p>
                  )}
                </div>

                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <StatusDot status={dotStatus as "ativo" | "afastado"} />
                  {statusLabel}
                </span>

                {canRemoveMember(member) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover {member.nick}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {member.nick} perderá acesso ao time. É possível re-convidar posteriormente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() =>
                            removeMember.mutate(
                              { memberId: member.id, teamId },
                              { onError: () => toast.error("Não foi possível remover o membro.") }
                            )
                          }
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Convites pendentes ──────────────────────────────────────────────────────

function PendingInvites({ teamId }: { teamId: string }) {
  const { data: invites = [], isLoading } = useTeamInvites(teamId);
  const revokeInvite = useRevokeInvite();

  if (isLoading || invites.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Mail className="size-4 text-muted-foreground" />
        Convites pendentes ({invites.length})
      </h3>
      <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {invites.map((inv) => (
          <li
            key={inv.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{inv.invitedEmail}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[inv.role]}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revogar convite?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O link enviado para {inv.invitedEmail} deixará de funcionar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      revokeInvite.mutate(
                        { inviteId: inv.id, teamId },
                        { onError: () => toast.error("Não foi possível revogar o convite.") }
                      )
                    }
                  >
                    Revogar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Modal de convite ────────────────────────────────────────────────────────

function InviteModal({
  open,
  onOpenChange,
  teamId,
  teamName,
  inviteForm,
  setInviteForm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  teamId: string;
  teamName: string;
  inviteForm: { email: string; role: TeamRole };
  setInviteForm: (f: { email: string; role: TeamRole }) => void;
}) {
  const createInvite = useCreateInvite();

  const submit = async () => {
    if (!inviteForm.email.trim()) {
      toast.error("Informe o e-mail do convidado.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteForm.email.trim())) {
      toast.error("E-mail inválido.");
      return;
    }
    createInvite.mutate(
      { teamId, email: inviteForm.email, role: inviteForm.role },
      {
        onSuccess: () => {
          toast.success(`Convite enviado para ${inviteForm.email}`);
          setInviteForm({ email: "", role: "player" });
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Não foi possível enviar o convite.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-sm">
        <DialogHeader>
          <DialogTitle>Convidar para {teamName}</DialogTitle>
          <DialogDescription>
            O convidado receberá um link por e-mail para entrar no time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          <Select
            value={inviteForm.role}
            onValueChange={(v) => setInviteForm({ ...inviteForm, role: v as TeamRole })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="player">Jogador</SelectItem>
              <SelectItem value="analyst">Analista</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="leader">Líder</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            onClick={submit}
            disabled={createInvite.isPending}
            className="bg-gradient-primary text-primary-foreground"
          >
            {createInvite.isPending ? "Enviando…" : "Enviar convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── FilterChip ──────────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
        active
          ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow"
          : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
