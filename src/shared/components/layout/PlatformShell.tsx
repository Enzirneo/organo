import { ElementType, ReactNode } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarRange,
  CheckCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Sparkles,
  UserCircle2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { signOut } from "@/shared/lib/auth";
import { useWorkspace } from "@/shared/lib/workspace";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type AppNotification,
} from "@/shared/hooks/useNotifications";

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
            <TeamSelector />
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground sm:inline-block">
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

function TeamSelector() {
  const { teams, activeTeam, setActiveTeamId } = useWorkspace();

  if (!activeTeam) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Workspace</p>
        <h1 className="font-display text-lg font-semibold">Organo Platform</h1>
      </div>
    );
  }

  if (teams.length <= 1) {
    return (
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Time ativo</p>
        <h1 className="font-display text-lg font-semibold">{activeTeam.name}</h1>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-left outline-none group">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-glow">Time ativo</p>
            <p className="font-display text-lg font-semibold flex items-center gap-1">
              {activeTeam.name}
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => setActiveTeamId(team.id)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              team.id === activeTeam.id && "font-medium text-primary"
            )}
          >
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="size-5 rounded object-cover" />
            ) : (
              <span className="size-5 rounded bg-primary/20" />
            )}
            {team.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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

// ── Sino de notificações ─────────────────────────────────────────────────────

function NotificationBell() {
  const { data: notifications = [], unreadCount } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    if (n.type === "team_invite" && n.data.invite_token) {
      navigate(`/invite/${n.data.invite_token as string}`);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[340px] border-border bg-background p-0 flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
          <SheetTitle className="text-base">Notificações</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="size-3.5" />
              Marcar todas como lidas
            </Button>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Bell className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação ainda.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 px-5 py-4 transition-colors hover:bg-secondary/40",
                    !n.readAt && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-secondary">
                    <Mail className="size-4 text-primary-glow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.readAt && "font-medium")}>{n.title}</p>
                    {n.body && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!n.readAt && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
