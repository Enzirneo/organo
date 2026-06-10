import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">("loading");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setStatus(data.session ? "authenticated" : "guest");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? "authenticated" : "guest");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") {
    return (
      <main className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-7 animate-spin text-primary" />
      </main>
    );
  }

  if (status === "guest") return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
