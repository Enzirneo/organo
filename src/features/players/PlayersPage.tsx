import { ReactNode, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { GameBadge, StatusDot } from "@/shared/components/ui/GameBadge";
import { useWorkspace } from "@/shared/lib/workspace";
import { GAMES } from "@/shared/data/games";
import type { GameId, PlayerStatus } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PlayersPage() {
  const { players, teams, addPlayer, removePlayer } = useWorkspace();
  const [filter, setFilter] = useState<GameId | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nick: "", role: "", image: "", game: "valorant" as GameId, status: "ativo" as PlayerStatus, teamId: "" });

  const filtered = useMemo(() => players.filter(p =>
    (filter === "all" || p.game === filter) && p.nick.toLowerCase().includes(q.toLowerCase())
  ), [players, filter, q]);

  const submit = async () => {
    if (!form.nick || !form.role) return toast.error("Preencha nick e função");
    try {
      await addPlayer({ ...form, image: form.image || `https://i.pravatar.cc/200?u=${form.nick}`, teamId: form.teamId || undefined });
      toast.success("Jogador criado");
      setOpen(false);
      setForm({ nick: "", role: "", image: "", game: "valorant", status: "ativo", teamId: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o jogador");
    }
  };

  return (
    <div>
        <PageHeader
          eyebrow="Elenco"
          title="Jogadores"
          description="Gerencie atletas, funções e disponibilidade da organização."
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                  <Plus className="size-4 mr-1" /> Novo jogador
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader><DialogTitle>Cadastrar jogador</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nick" value={form.nick} onChange={(e) => setForm({ ...form, nick: e.target.value })} />
                  <Input placeholder="Função (ex: Duelista, IGL)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                  <Input placeholder="URL da imagem (opcional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <Select value={form.game} onValueChange={(v) => setForm({ ...form, game: v as GameId })}>
                    <SelectTrigger><SelectValue placeholder="Jogo" /></SelectTrigger>
                    <SelectContent>{GAMES.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PlayerStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="reserva">Reserva</SelectItem>
                      <SelectItem value="afastado">Afastado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={form.teamId} onValueChange={(v) => setForm({ ...form, teamId: v })}>
                    <SelectTrigger><SelectValue placeholder="Time (opcional)" /></SelectTrigger>
                    <SelectContent>
                      {teams.filter(t => t.game === form.game).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button onClick={submit} className="bg-gradient-primary text-primary-foreground">Criar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Buscar por nick..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>Todos</Chip>
            {GAMES.map(g => <Chip key={g.id} active={filter === g.id} onClick={() => setFilter(g.id)}>{g.short}</Chip>)}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const team = teams.find(t => t.id === p.teamId);
              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass glass-hover rounded-2xl overflow-hidden group relative"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={p.image} alt={p.nick} className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-2 py-0.5 text-[11px]">
                      <StatusDot status={p.status} /> {p.status}
                    </span>
                    <button onClick={() => removePlayer(p.id)} className="absolute top-3 right-3 grid place-items-center size-7 rounded-full bg-background/70 backdrop-blur text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="font-display text-lg leading-none">{p.nick}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.role}{team ? ` · ${team.name}` : ""}</p>
                    <div className="mt-3"><GameBadge game={p.game} /></div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${active ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow" : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"}`}>{children}</button>
  );
}