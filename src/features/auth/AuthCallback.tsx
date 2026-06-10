import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const finishConfirmation = async () => {
      const { error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      navigate("/app/dashboard", { replace: true });
    };

    finishConfirmation();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-screen grid place-items-center bg-background px-6">
      <section className="glass max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
          {errorMessage ? <MailCheck className="size-6" /> : <Loader2 className="size-6 animate-spin" />}
        </div>
        <h1 className="font-display text-2xl mb-2">
          {errorMessage ? "Não foi possível confirmar" : "Confirmando sua conta"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "Estamos validando seu e-mail e preparando seu workspace no Organo."}
        </p>
        {errorMessage && (
          <Button asChild className="mt-6 rounded-full bg-gradient-primary text-primary-foreground">
            <Link to="/auth">Voltar para o login</Link>
          </Button>
        )}
      </section>
    </main>
  );
}
