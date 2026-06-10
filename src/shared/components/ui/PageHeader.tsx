import { motion } from "framer-motion";
import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8"
    >
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.18em] text-primary-glow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-gradient">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}