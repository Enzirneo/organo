import { motion } from "framer-motion";
import { Users, UserCircle2, CalendarRange, Trophy, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { GameBadge, StatusDot } from "@/shared/components/ui/GameBadge";
import { useWorkspace } from "@/shared/lib/workspace";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

export default function DashboardPage() {
  const { teams, players, trainings } = useWorkspace();

  const metrics = [
    { label: "Times ativos", value: teams.filter((t) => t.status === "ativo").length, icon: Users },
    { label: "Jogadores", value: players.length, icon: UserCircle2 },
    { label: "Treinos agendados", value: trainings.length, icon: CalendarRange },
    { label: "Modalidades", value: new Set(teams.map((t) => t.game)).size, icon: Trophy },
  ];

  const upcoming = [...trainings].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const recentTeams = [...teams].slice(0, 4);

  if (teams.length === 0) {
    return (
      <div className="container py-12">
        <PageHeader
          eyebrow="Primeiro acesso"
          title="Crie seu primeiro time"
          description="Sua conta já foi criada. Agora você pode abrir seu primeiro time ou aguardar um convite para entrar como jogador."
          actions={
            <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/app/times">Criar time</Link>
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl">Quero liderar</h2>
            <p className="mt-2 text-sm text-muted-foreground">Crie um time. O Organo cria a organização interna automaticamente e você entra como líder.</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-xl">Sou jogador</h2>
            <p className="mt-2 text-sm text-muted-foreground">Quando alguém te convidar, seus times aparecerão aqui sem precisar criar uma organização.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <PageHeader
        eyebrow="Workspace"
        title="Visão geral da organização"
        description="Acompanhe o que está acontecendo com seus elencos, agenda e operação competitiva."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass glass-hover rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <m.icon className="size-5 text-primary-glow" />
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-6 font-display text-3xl">{m.value}</p>
            <p className="text-sm text-muted-foreground">{m.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl">Próximos treinos</h2>
              <p className="text-sm text-muted-foreground">Agenda dos próximos dias</p>
            </div>
            <Link to="/treinos" className="text-xs text-primary-glow hover:underline">Ver todos</Link>
          </div>
          <ul className="divide-y divide-border/60">
            {upcoming.map((t) => (
              <li key={t.id} className="py-3 flex items-center gap-4">
                <div className="grid place-items-center rounded-lg bg-secondary/60 px-3 py-2 min-w-[64px] text-center">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{fmtDate(t.date)}</p>
                  <p className="font-display text-sm">{t.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.objective}</p>
                </div>
                <GameBadge game={t.game} />
              </li>
            ))}
          </ul>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-xl">Times recentes</h2>
              <p className="text-sm text-muted-foreground">Lineups em atividade</p>
            </div>
            <Link to="/app/times" className="text-xs text-primary-glow hover:underline">Ver todos</Link>
          </div>
          <ul className="space-y-3">
            {recentTeams.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium truncate flex items-center gap-2"><StatusDot status={t.status} /> {t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.members.length} membros</p>
                </div>
                <GameBadge game={t.game} />
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}