import { getGame } from "@/shared/data/games";
import type { GameId } from "@/shared/types";
import { cn } from "@/lib/utils";

export function GameBadge({ game, className }: { game: GameId; className?: string }) {
  const g = getGame(game);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground/90",
        className
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: g.accent }} />
      {g.name}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    ativo: "bg-success",
    reserva: "bg-warning",
    afastado: "bg-muted-foreground",
    "em-construcao": "bg-warning",
    encerrado: "bg-destructive",
  };
  return <span className={cn("inline-block size-2 rounded-full", map[status] ?? "bg-muted-foreground")} />;
}