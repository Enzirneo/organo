import { ReactNode, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { GameBadge, StatusDot } from "@/shared/components/ui/GameBadge";
import { useWorkspace } from "@/shared/lib/workspace";
import { GAMES } from "@/shared/data/games";
import type { GameId, TeamStatus } from "@/shared/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { toast } from "sonner";

export default function TeamsPage() {
  const { teams, addTeam, removeTeam, players } = useWorkspace();

  const [filter, setFilter] = useState<GameId | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    game: "valorant" as GameId,
    status: "ativo" as TeamStatus,
    logoUrl: "",
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
      console.log("[TeamsPage] form antes de criar:", form);

      await addTeam({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
      });

      toast.success("Time criado");
      setOpen(false);
      setForm({
        name: "",
        description: "",
        game: "valorant",
        status: "ativo",
        logoUrl: "",
      });
    } catch (error) {
      console.error("[TeamsPage] erro ao criar time:", error);

      if (error && typeof error === "object") {
        console.error("[TeamsPage] erro detalhado:", {
          message: "message" in error ? error.message : undefined,
          details: "details" in error ? error.details : undefined,
          hint: "hint" in error ? error.hint : undefined,
          code: "code" in error ? error.code : undefined,
        });
      }

      toast.error(
        error instanceof Error ? error.message : "Não foi possível criar o time"
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Times"
        description="Gerencie lineups, status e modalidade competitiva."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
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
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />

                <Textarea
                  placeholder="Descrição"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <Select
                  value={form.game}
                  onValueChange={(v) =>
                    setForm({ ...form, game: v as GameId })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GAMES.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v as TeamStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="em-construcao">Em construção</SelectItem>
                    <SelectItem value="encerrado">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  onClick={submit}
                  className="bg-gradient-primary text-primary-foreground"
                >
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
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            Todos
          </FilterChip>

          {GAMES.map((g) => (
            <FilterChip
              key={g.id}
              active={filter === g.id}
              onClick={() => setFilter(g.id)}
            >
              {g.short}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => {
            const teamPlayers = players
              .filter((p) => p.teamId === t.id)
              .slice(0, 5);

            return (
              <motion.article
                key={t.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass glass-hover group relative rounded-2xl overflow-hidden"
              >
                {/* Header: logo ou fundo padrão */}
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

                  <button
                    onClick={() => removeTeam(t.id)}
                    className="absolute top-3 right-3 grid place-items-center size-7 rounded-full bg-background/70 backdrop-blur text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="p-5 -mt-2">
                  <p className="font-display flex items-center gap-2 text-lg leading-tight">
                    <StatusDot status={t.status} />
                    {t.name}
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {t.description}
                  </p>

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
                        <span className="text-xs text-muted-foreground">
                          Sem jogadores
                        </span>
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
    </div>
  );
}

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