import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/components/ui/button";

type PageState = "loading" | "success" | "error" | "unauthenticated";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Link de convite inválido.");
      return;
    }

    let mounted = true;

    const accept = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session) {
        setState("unauthenticated");
        return;
      }

      const { error } = await supabase.rpc("accept_team_invite", { p_token: token });

      if (!mounted) return;

      if (error) {
        setState("error");
        setErrorMessage(error.message);
        return;
      }

      setState("success");
      setTimeout(() => navigate("/app/times", { replace: true }), 2000);
    };

    accept();
    return () => { mounted = false; };
  }, [token, navigate]);

  return (
    <main className="min-h-screen grid place-items-center bg-background px-6">
      <section className="glass max-w-md w-full rounded-3xl p-8 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          {state === "loading" && <Loader2 className="size-6 animate-spin" />}
          {state === "success" && <CheckCircle2 className="size-6" />}
          {(state === "error" || state === "unauthenticated") && <XCircle className="size-6" />}
        </div>

        {state === "loading" && (
          <>
            <h1 className="font-display text-2xl mb-2">Aceitando convite…</h1>
            <p className="text-sm text-muted-foreground">Verificando seu convite e adicionando ao time.</p>
          </>
        )}

        {state === "success" && (
          <>
            <h1 className="font-display text-2xl mb-2">Bem-vindo ao time!</h1>
            <p className="text-sm text-muted-foreground">
              Convite aceito. Redirecionando para seus times…
            </p>
          </>
        )}

        {state === "unauthenticated" && (
          <>
            <h1 className="font-display text-2xl mb-2">Faça login primeiro</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Você precisa estar logado para aceitar este convite.
            </p>
            <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground">
              <Link to={`/auth?redirect=/invite/${token}`}>Entrar na conta</Link>
            </Button>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="font-display text-2xl mb-2">Convite inválido</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {errorMessage ?? "O convite expirou ou já foi usado."}
            </p>
            <Button asChild className="rounded-full bg-gradient-primary text-primary-foreground">
              <Link to="/app/times">Ver meus times</Link>
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
