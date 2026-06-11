import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Plus, CalendarRange, Target, Video, Brain, Crosshair } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { GameBadge } from "@/shared/components/ui/GameBadge";
import { useWorkspace } from "@/shared/lib/workspace";
import type { GameId, Training, TrainingType } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const typeMeta: Record<TrainingType, { label: string; icon: any; color: string }> = {
  scrim: { label: "Scrim", icon: Crosshair, color: "text-primary-glow" },
  "vod-review": { label: "VOD Review", icon: Video, color: "text-warning" },
  tatica: { label: "Tática", icon: Brain, color: "text-success" },
  individual: { label: "Individual", icon: Target, color: "text-accent" },
};

const EMPTY_FORM = {
  title: "",
  date: new Date().toISOString().slice(0, 10),
  time: "20:00",
  game: "valorant" as GameId,
  objective: "",
  type: "scrim" as TrainingType,
  teamId: "",
  participants: [] as string[],
};

export default function TrainingsPage() {
  const { trainings, teams, players, addTraining, updateTraining, removeTraining } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState<Training | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const sorted = useMemo(
    () => [...trainings].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [trainings]
  );

  const selectedParticipants = useMemo(
    () => (selected ? players.filter((p) => selected.participants.includes(p.userId)) : []),
    [players, selected]
  );

  const teamPlayers = useMemo(
    () => (form.teamId ? players.filter((p) => p.teamId === form.teamId) : []),
    [players, form.teamId]
  );
  const allSelected =
    teamPlayers.length > 0 && teamPlayers.every((p) => form.participants.includes(p.userId));

  const editTeamPlayers = useMemo(
    () => (editForm.teamId ? players.filter((p) => p.teamId === editForm.teamId) : []),
    [players, editForm.teamId]
  );
  const editAllSelected =
    editTeamPlayers.length > 0 && editTeamPlayers.every((p) => editForm.participants.includes(p.userId));

  const handleTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    setForm((f) => ({ ...f, teamId, game: team?.game ?? f.game, participants: [] }));
  };

  const handleEditTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    setEditForm((f) => ({ ...f, teamId, game: team?.game ?? f.game, participants: [] }));
  };

  const toggleParticipant = (userId: string) => {
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(userId)
        ? f.participants.filter((id) => id !== userId)
        : [...f.participants, userId],
    }));
  };

  const toggleEditParticipant = (userId: string) => {
    setEditForm((f) => ({
      ...f,
      participants: f.participants.includes(userId)
        ? f.participants.filter((id) => id !== userId)
        : [...f.participants, userId],
    }));
  };

  const toggleAll = () => {
    setForm((f) => ({
      ...f,
      participants: allSelected ? [] : teamPlayers.map((p) => p.userId),
    }));
  };

  const toggleEditAll = () => {
    setEditForm((f) => ({
      ...f,
      participants: editAllSelected ? [] : editTeamPlayers.map((p) => p.userId),
    }));
  };

  const submit = async () => {
    if (!form.title || !form.objective) return toast.error("Preencha título e objetivo");
    try {
      await addTraining(form);
      toast.success("Treino agendado");
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível agendar o treino");
    }
  };

  const openEdit = (training: Training) => {
    setEditForm({
      title: training.title,
      date: training.date,
      time: training.time,
      game: training.game,
      objective: training.objective,
      type: training.type,
      teamId: training.teamId ?? "",
      participants: training.participants,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selected) return;
    if (!editForm.title || !editForm.objective) return toast.error("Preencha título e objetivo");
    try {
      await updateTraining(selected.id, {
        title: editForm.title,
        date: editForm.date,
        time: editForm.time,
        objective: editForm.objective,
        type: editForm.type,
        participants: editForm.participants,
      });
      toast.success("Treino atualizado");
      setEditOpen(false);
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              title: editForm.title,
              date: editForm.date,
              time: editForm.time,
              objective: editForm.objective,
              type: editForm.type,
              participants: editForm.participants,
            }
          : null
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o treino");
    }
  };

  const handleDelete = async (training: Training) => {
    try {
      await removeTraining(training.id);
      toast.success("Treino removido");
      setSelected(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover o treino");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Treinos"
        description="Scrims, VOD reviews e sessões táticas em uma timeline única."
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Plus className="size-4 mr-1" /> Novo treino
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Agendar treino</DialogTitle>
              </DialogHeader>
              <TrainingForm
                form={form}
                setForm={setForm}
                teams={teams}
                teamPlayers={teamPlayers}
                allSelected={allSelected}
                onTeamChange={handleTeamChange}
                onToggleParticipant={toggleParticipant}
                onToggleAll={toggleAll}
              />
              <DialogFooter>
                <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">
                  Agendar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary-glow/40 via-border to-transparent" />
        <ul className="space-y-4">
          {sorted.map((t, i) => {
            const meta = typeMeta[t.type];
            const Icon = meta.icon;
            const team = teams.find((x) => x.id === t.teamId);
            return (
              <motion.li
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-12 cursor-pointer"
                onClick={() => setSelected(t)}
              >
                <span className="absolute left-0 top-3 grid size-9 place-items-center rounded-full bg-card border border-border shadow-glow">
                  <Icon className={`size-4 ${meta.color}`} />
                </span>
                <div className="glass glass-hover rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs uppercase tracking-widest text-primary-glow">{meta.label}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <CalendarRange className="size-3" />
                        {new Date(t.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} · {t.time}
                      </span>
                    </div>
                    <p className="font-display text-lg">{t.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{t.objective}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <GameBadge game={t.game} />
                    {team && <span className="text-xs text-muted-foreground">{team.name}</span>}
                    <span className="text-xs text-muted-foreground">{t.participants.length} participantes</span>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Modal de detalhe do treino */}
      <Dialog open={!!selected && !editOpen} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (() => {
          const meta = typeMeta[selected.type];
          const Icon = meta.icon;
          const team = teams.find((x) => x.id === selected.teamId);
          return (
            <DialogContent className="glass max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon className={`size-5 ${meta.color}`} />
                  {selected.title}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-secondary/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Tipo</p>
                  <p className="font-medium">{meta.label}</p>
                </div>
                <div className="rounded-xl bg-secondary/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Data</p>
                  <p className="font-medium">
                    {new Date(selected.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <div className="rounded-xl bg-secondary/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Horário</p>
                  <p className="font-medium">{selected.time}</p>
                </div>
              </div>

              {team && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{team.name}</span>
                  <GameBadge game={selected.game} />
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1">Objetivo</p>
                <p className="text-sm">{selected.objective}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Participantes ({selected.participants.length > 0 ? selected.participants.length : "aberto ao time"})
                </p>
                {selectedParticipants.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedParticipants.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1"
                      >
                        <img src={p.image} alt={p.nick} className="size-5 rounded-full object-cover" />
                        <span className="text-xs">{p.nick}</span>
                      </div>
                    ))}
                  </div>
                ) : selected.participants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aberto a todos do time.</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {selected.participants.length} participante(s) — visível apenas para gestores do time.
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(selected)}
                >
                  <Pencil className="size-3.5 mr-1.5" />
                  Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Excluir treino</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir "{selected.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O treino e todos os registros de participação serão removidos permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(selected)}
                      >
                        Sim, excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* Modal de edição de treino */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditOpen(false); }}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Editar treino</DialogTitle>
          </DialogHeader>
          <TrainingForm
            form={editForm}
            setForm={setEditForm}
            teams={teams}
            teamPlayers={editTeamPlayers}
            allSelected={editAllSelected}
            onTeamChange={handleEditTeamChange}
            onToggleParticipant={toggleEditParticipant}
            onToggleAll={toggleEditAll}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={submitEdit} className="bg-gradient-primary text-primary-foreground">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Formulário reutilizável de treino ────────────────────────────────────────

type TrainingFormData = {
  title: string;
  date: string;
  time: string;
  game: string;
  objective: string;
  type: TrainingType;
  teamId: string;
  participants: string[];
};

function TrainingForm({
  form,
  setForm,
  teams,
  teamPlayers,
  allSelected,
  onTeamChange,
  onToggleParticipant,
  onToggleAll,
}: {
  form: TrainingFormData;
  setForm: (f: TrainingFormData) => void;
  teams: { id: string; name: string }[];
  teamPlayers: { id: string; userId: string; nick: string }[];
  allSelected: boolean;
  onTeamChange: (teamId: string) => void;
  onToggleParticipant: (userId: string) => void;
  onToggleAll: () => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as TrainingType })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="scrim">Scrim</SelectItem>
          <SelectItem value="vod-review">VOD Review</SelectItem>
          <SelectItem value="tatica">Tática</SelectItem>
          <SelectItem value="individual">Individual</SelectItem>
        </SelectContent>
      </Select>
      <Select value={form.teamId} onValueChange={onTeamChange}>
        <SelectTrigger><SelectValue placeholder="Selecionar time" /></SelectTrigger>
        <SelectContent>
          {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {teamPlayers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Participantes</p>
            <button
              type="button"
              onClick={onToggleAll}
              className="text-xs text-primary-glow hover:underline"
            >
              {allSelected ? "Desmarcar todos" : "Selecionar todos"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {teamPlayers.map((p) => {
              const sel = form.participants.includes(p.userId);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onToggleParticipant(p.userId)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    sel
                      ? "border-transparent bg-gradient-primary text-primary-foreground shadow-glow"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.nick}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <Textarea
        placeholder="Objetivo"
        value={form.objective}
        onChange={(e) => setForm({ ...form, objective: e.target.value })}
      />
    </div>
  );
}
