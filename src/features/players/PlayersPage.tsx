import { ReactNode, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Search } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { GameBadge, StatusDot } from "@/shared/components/ui/GameBadge";
import { useWorkspace } from "@/shared/lib/workspace";
import { GAMES } from "@/shared/data/games";
import type { GameId, Player, PlayerStatus } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { toast } from "sonner";

export default function PlayersPage() {
  const { players, teams, updatePlayer, removePlayer } = useWorkspace();
  const [filter, setFilter] = useState<GameId | "all">("all");
  const [q, setQ] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    nick: "",
    role: "",
    image: "",
    game: "valorant" as GameId,
    status: "ativo" as PlayerStatus,
    teamId: "",
  });

  const filtered = useMemo(
    () =>
      players.filter(
        (p) =>
          (filter === "all" || p.game === filter) &&
          p.nick.toLowerCase().includes(q.toLowerCase())
      ),
    [players, filter, q]
  );

  const openEdit = (player: Player) => {
    setEditForm({
      nick: player.nick,
      role: player.role,
      image: player.image,
      game: player.game,
      status: player.status,
      teamId: player.teamId ?? "",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedPlayer) return;
    if (!editForm.nick || !editForm.role) return toast.error("Preencha nick e função");
    try {
      await updatePlayer(selectedPlayer.id, {
        nick: editForm.nick,
        role: editForm.role,
        image: editForm.image || undefined,
        game: editForm.game,
        status: editForm.status,
        teamId: editForm.teamId || undefined,
      });
      toast.success("Jogador atualizado");
      setEditOpen(false);
      setSelectedPlayer((prev) =>
        prev ? { ...prev, nick: editForm.nick, role: editForm.role, image: editForm.image || prev.image, game: editForm.game, status: editForm.status, teamId: editForm.teamId || undefined } : null
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o jogador");
    }
  };

  const handleRemove = async (player: Player) => {
    try {
      await removePlayer(player.id);
      toast.success(`${player.nick} removido do time`);
      setSelectedPlayer(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover");
    }
  };

  const selectedTeam = useMemo(
    () => (selectedPlayer ? teams.find((t) => t.id === selectedPlayer.teamId) : undefined),
    [teams, selectedPlayer]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Elenco"
        title="Jogadores"
        description="Gerencie atletas, funções e disponibilidade da organização."
      />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Buscar por nick..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>Todos</Chip>
          {GAMES.map((g) => <Chip key={g.id} active={filter === g.id} onClick={() => setFilter(g.id)}>{g.short}</Chip>)}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => {
            const team = teams.find((t) => t.id === p.teamId);
            return (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass glass-hover rounded-2xl overflow-hidden group relative cursor-pointer"
                onClick={() => setSelectedPlayer(p)}
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={p.image} alt={p.nick} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[11px]">
                    <StatusDot status={p.status} /> {p.status}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-display text-lg leading-none">{p.nick}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.role}{team ? ` · ${team.name}` : ""}
                  </p>
                  <div className="mt-3"><GameBadge game={p.game} /></div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Modal de detalhe do jogador */}
      <Dialog open={!!selectedPlayer && !editOpen} onOpenChange={(open) => { if (!open) setSelectedPlayer(null); }}>
        {selectedPlayer && (
          <DialogContent className="glass max-w-sm">
            <DialogHeader>
              <DialogTitle>{selectedPlayer.nick}</DialogTitle>
            </DialogHeader>

            <div className="flex gap-4 items-center">
              <img
                src={selectedPlayer.image}
                alt={selectedPlayer.nick}
                className="size-20 rounded-2xl object-cover ring-2 ring-border"
              />
              <div className="space-y-1">
                {selectedPlayer.fullName && (
                  <p className="font-medium">{selectedPlayer.fullName}</p>
                )}
                <p className="text-sm text-muted-foreground">{selectedPlayer.role}</p>
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <StatusDot status={selectedPlayer.status} />
                  {selectedPlayer.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-secondary/40 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5">Time</p>
                <p className="font-medium truncate">{selectedTeam?.name ?? "Sem time"}</p>
              </div>
              <div className="rounded-xl bg-secondary/40 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5">Entrou em</p>
                <p className="font-medium">
                  {new Date(selectedPlayer.joinedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div><GameBadge game={selectedPlayer.game} /></div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(selectedPlayer)}
              >
                <Pencil className="size-3.5 mr-1.5" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Remover do time</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover {selectedPlayer.nick}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O jogador será removido do roster. A conta dele não será excluída.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleRemove(selectedPlayer)}
                    >
                      Sim, remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal de edição */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditOpen(false); }}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Editar jogador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <ImageUpload
              value={editForm.image}
              onChange={(url) => setEditForm({ ...editForm, image: url })}
              bucket="avatars"
              placeholder="Foto do jogador"
              className="h-28 w-full"
            />
            <Input
              placeholder="Nick"
              value={editForm.nick}
              onChange={(e) => setEditForm({ ...editForm, nick: e.target.value })}
            />
            <Input
              placeholder="Função (ex: Duelista, IGL)"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            />
            <Select value={editForm.game} onValueChange={(v) => setEditForm({ ...editForm, game: v as GameId })}>
              <SelectTrigger><SelectValue placeholder="Jogo" /></SelectTrigger>
              <SelectContent>{GAMES.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as PlayerStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="reserva">Reserva</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={editForm.teamId} onValueChange={(v) => setEditForm({ ...editForm, teamId: v })}>
              <SelectTrigger><SelectValue placeholder="Time (opcional)" /></SelectTrigger>
              <SelectContent>
                {teams.filter((t) => t.game === editForm.game).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={submitEdit} className="bg-gradient-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({
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
      className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
        active
          ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
          : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
