import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(
  email: string,
  password: string,
  data?: Record<string, string | null>,
  emailRedirectTo?: string
) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data,
      emailRedirectTo,
    },
  });
}

export async function signInWithOAuth(
  provider: Provider,
  redirectTo: string
) {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
}

export async function verifyOtp(
  email: string,
  token: string,
  type: "signup" | "recovery"
) {
  const supabase = createClient();
  return supabase.auth.verifyOtp({ email, token, type });
}

export async function resendOtp(email: string, type: "signup") {
  const supabase = createClient();
  return supabase.auth.resend({ type, email });
}

export async function resetPasswordForEmail(email: string) {
  const supabase = createClient();
  return supabase.auth.resetPasswordForEmail(email);
}

export async function updatePassword(password: string) {
  const supabase = createClient();
  return supabase.auth.updateUser({ password });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function getUserRoles(userId: string) {
  const supabase = createClient();
  return supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
}
