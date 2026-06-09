"use server";

/**
 * Server Actions pour l'authentification admin (Sprint 1 — F-02).
 *
 * Utilise Supabase Auth. Fail-soft 503 si l'environnement n'est pas
 * configuré (DB non provisionnée) → l'UI affiche un message explicite.
 */

import { redirect } from "next/navigation";
import { z } from "zod";

import type { AuthActionState } from "@/lib/features/auth/types";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Email invalide"),
});

const resetSchema = z.object({
  email: z.string().email("Email invalide"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "8 caractères minimum"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function notConfigured(): AuthActionState {
  return {
    status: "error",
    message:
      "Service d'authentification non configuré. Le projet Supabase sera provisionné en Sprint 1.",
  };
}

function fromZod(err: z.ZodError): AuthActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = issue.path.join(".") || "_form";
    fieldErrors[k] = issue.message;
  }
  return { status: "error", message: "Données invalides.", fieldErrors };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasServerSupabaseEnv()) return notConfigured();

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { status: "error", message: "Email ou mot de passe incorrect." };
  }

  redirect("/app");
}

export async function sendMagicLink(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasServerSupabaseEnv()) return notConfigured();

  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/app`,
    },
  });
  if (error) return { status: "error", message: error.message };

  return {
    status: "ok",
    message: "Lien de connexion envoyé — vérifiez votre boîte mail.",
  };
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasServerSupabaseEnv()) return notConfigured();

  const parsed = resetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/reset-password`,
  });
  if (error) return { status: "error", message: error.message };

  return {
    status: "ok",
    message: "Email de réinitialisation envoyé — vérifiez votre boîte mail.",
  };
}

export async function updatePassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasServerSupabaseEnv()) return notConfigured();

  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) return fromZod(parsed.error);

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { status: "error", message: error.message };

  redirect("/app");
}

export async function signOut(): Promise<void> {
  if (!hasServerSupabaseEnv()) redirect("/login");
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

