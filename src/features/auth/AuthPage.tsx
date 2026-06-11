import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signInWithEmail, signUpWithEmail } from "@/shared/lib/auth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/app/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { error } = await signUpWithEmail({
          email,
          password,
          name,
          organizationName: organizationName || undefined,
        });

        if (error) throw error;

        toast.success("Conta criada! Confira seu e-mail para confirmar o acesso.");
        setMode("login");
        setPassword("");
        return;
      }

      const { data, error } = await signInWithEmail(email, password);

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast.info("Confirme seu e-mail antes de entrar no Organo.");
        return;
      }

      toast.success("Login realizado com sucesso");
      navigate(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível concluir a autenticação.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <p className="font-display text-lg">Organo<span className="text-primary-glow">.</span></p>
        </Link>
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.18em] text-primary-glow mb-3">eSports Operating System</p>
          <h2 className="font-display text-4xl leading-tight">Toda a operação da sua organização. <span className="text-gradient">Em um só lugar.</span></h2>
          <p className="mt-4 text-muted-foreground max-w-md">Agende scrims, gerencie elencos, atribua funções e acompanhe métricas em todos os títulos competitivos.</p>
        </div>
        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} Organo Reborn</p>
      </aside>

      <section className="flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="inline-flex rounded-full border border-border/60 bg-card/40 p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${mode === m ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"}`}>
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>
          <h1 className="font-display text-3xl mb-2">{mode === "login" ? "Bem-vindo de volta" : "Vamos começar"}</h1>
          <p className="text-sm text-muted-foreground mb-8">{mode === "login" ? "Acesse seu workspace competitivo." : "Crie sua conta e confirme o e-mail para liberar o acesso."}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input placeholder="Nome da organização" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
              </>
            )}
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              {isSubmitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {mode === "login" ? "Entrar" : "Criar conta"} <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>
          <p className="mt-6 text-xs text-muted-foreground text-center">
            {mode === "signup" ? "Depois do cadastro, o Supabase enviará um link de confirmação para seu e-mail." : "Use o e-mail já confirmado para entrar."}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
