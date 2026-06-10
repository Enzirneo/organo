import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold tracking-tight">Organo<span className="text-primary-glow">.</span></p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Reborn · eSports OS</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors">Entrar</Link>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
          >
            Abrir plataforma
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}