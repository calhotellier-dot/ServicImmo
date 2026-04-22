"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset, updatePassword } from "@/lib/features/auth/actions";
import type { AuthActionState } from "@/lib/features/auth/types";

const INITIAL: AuthActionState = { status: "idle" };

export default function ResetPasswordPage() {
  const [reqState, reqAction, reqPending] = useActionState(requestPasswordReset, INITIAL);
  const [updState, updAction, updPending] = useActionState(updatePassword, INITIAL);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Réinitialiser le mot de passe</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>

      <form action={reqAction} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-neutral-700">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
        </label>
        {reqState.status === "ok" && reqState.message ? (
          <p className="text-[12px] text-emerald-700">{reqState.message}</p>
        ) : null}
        {reqState.status === "error" && reqState.message ? (
          <p role="alert" className="text-[12px] text-red-600">
            {reqState.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={reqPending}
          className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {reqPending ? "Envoi…" : "Envoyer le lien"}
        </button>
      </form>

      <details className="mt-5">
        <summary className="cursor-pointer text-[12px] text-neutral-500">
          J&apos;ai déjà le lien — changer mon mot de passe
        </summary>
        <form action={updAction} className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[12px] font-medium text-neutral-700">Nouveau mot de passe</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </label>
          {updState.status === "error" && updState.message ? (
            <p role="alert" className="text-[12px] text-red-600">
              {updState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={updPending}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-neutral-400 disabled:opacity-60"
          >
            {updPending ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </form>
      </details>

      <div className="mt-5 text-center text-[12px] text-neutral-500">
        <Link href="/login" className="underline hover:text-neutral-900">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
