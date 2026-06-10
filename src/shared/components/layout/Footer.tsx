import { Github, Twitter, Twitch, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30 backdrop-blur-xl">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary"><Sparkles className="size-4 text-primary-foreground" /></span>
            <p className="font-display text-lg">Organo Reborn</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            A plataforma para organizações de eSports gerenciarem elencos, treinos e estratégia em um só lugar.
          </p>
        </div>
        {[
          { title: "Produto", items: ["Workspace", "Times", "Jogadores", "Treinos"] },
          { title: "Recursos", items: ["Documentação", "Roadmap", "Changelog", "Status"] },
          { title: "Empresa", items: ["Sobre", "Carreiras", "Contato", "Imprensa"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">{col.title}</p>
            <ul className="space-y-2 text-sm">
              {col.items.map((i) => (
                <li key={i}><a href="#" className="text-foreground/80 hover:text-primary-glow transition-colors">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Organo Reborn. Feito para times competitivos.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary-glow"><Github className="size-4" /></a>
            <a href="#" className="hover:text-primary-glow"><Twitter className="size-4" /></a>
            <a href="#" className="hover:text-primary-glow"><Twitch className="size-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}