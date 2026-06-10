import { supabase } from "./supabase";

export async function signUpWithEmail(params: {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}) {
  const { email, password, name, organizationName } = params;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: name,
        display_name: name,
        organization_name: organizationName,
      },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}
