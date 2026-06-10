import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Users, Calendar, Gamepad2 } from "lucide-react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { GAMES } from "@/shared/data/games";

const metrics = [
  { label: "Jogadores ativos", value: "128", icon: Users },
  { label: "Modalidades", value: "7", icon: Gamepad2 },
  { label: "Treinos / mês", value: "342", icon: Calendar },
  { label: "Títulos", value: "14", icon: Trophy },
];

export default function Landing() {
  return (
    <AppShell>
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="container relative py-20 md:py-32 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-glow/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary-glow"
            >
              <span className="size-1.5 rounded-full bg-primary-glow animate-pulse-glow" />
              eSports OS · v2.0
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight"
            >
              Organize <span className="text-gradient">elencos, treinos</span> e funções com cara de produto real.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              Uma plataforma única para sua organização gerenciar lineups, scrims, VOD reviews e funções táticas em todos os principais títulos competitivos.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/app/times" className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90">
                Entrar na plataforma
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/app/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 backdrop-blur px-6 py-3 text-sm font-medium hover:border-primary-glow/40 transition-colors">
                Ver workspace
              </Link>
            </motion.div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Modalidades</span>
              <div className="flex flex-wrap gap-2">
                {GAMES.map((g) => (
                  <span key={g.id} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-xs">
                    <span className="size-1.5 rounded-full" style={{ background: g.accent }} /> {g.short}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 shadow-elegant"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Workspace</p>
                <p className="font-display text-lg">Organização Apex</p>
              </div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">ao vivo</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border/60 bg-secondary/40 p-4">
                  <Icon className="size-4 text-primary-glow mb-3" />
                  <p className="font-display text-2xl">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-border/60 bg-secondary/30 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Próximo treino</span>
                <span className="text-primary-glow">hoje · 20:00</span>
              </div>
              <p className="mt-1 font-medium">Scrim oficial vs Loud Academy</p>
              <p className="text-xs text-muted-foreground mt-1">Phantom Squad · Valorant</p>
            </div>
          </motion.aside>
        </div>
      </section>
    </AppShell>
  );
}