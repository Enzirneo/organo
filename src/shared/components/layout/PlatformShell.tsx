import { ElementType, ReactNode } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  CalendarRange,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOut } from "@/shared/lib/auth";

const platformLinks = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/times", label: "Times", icon: Users },
  { to: "/app/jogadores", label: "Jogadores", icon: UserCircle2 },
  { to: "/app/treinos", label: "Treinos", icon: CalendarRange },
];

export function PlatformShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border/60 bg-card/40 backdrop-blur-xl lg:flex lg:flex-col">
        <PlatformBrand />
        <nav className="flex-1 space-y-1 px-4 py-4">
          {platformLinks.map((item) => (
            <PlatformNavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="border-t border-border/60 p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sair da plataforma
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[290px] border-border bg-background p-0">
                <PlatformBrand />
                <nav className="space-y-1 px-4 py-4">
                  {platformLinks.map((item) => (
                    <PlatformNavItem key={item.to} {...item} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Workspace</p>
              <h1 className="font-display text-lg font-semibold">Organo Platform</h1>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              Operação ativa
            </span>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[calc(100vh-4rem)] px-4 py-8 lg:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}

function PlatformBrand() {
  return (
    <Link to="/app/dashboard" className="flex h-16 items-center gap-2.5 border-b border-border/60 px-5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
        <Sparkles className="size-4 text-primary-foreground" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-lg font-semibold tracking-tight">
          Organo<span className="text-primary-glow">.</span>
        </p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">eSports OS</p>
      </div>
    </Link>
  );
}

function PlatformNavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: ElementType;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-gradient-primary text-primary-foreground shadow-glow"
            : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
        )
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  );
}
