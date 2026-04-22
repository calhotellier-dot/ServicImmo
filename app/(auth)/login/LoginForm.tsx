"use client";

import Link from "next/link";
import { useActionState } from "react";

import { sendMagicLink, signInWithPassword } from "@/lib/features/auth/actions";
import type { AuthActionState } from "@/lib/features/auth/types";

const INITIAL: AuthActionState = { status: "idle" };

export function LoginForm() {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    signInWithPassword,
    INITIAL
  );
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, INITIAL);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Connexion</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Accès admin / diagnostiqueur à l&apos;app Pilote.
      </p>

      <form action={passwordAction} className="mt-5 flex flex-col gap-3">
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={passwordState.fieldErrors?.email}
        />
        <Field
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="current-password"
          error={passwordState.fieldErrors?.password}
        />
        {passwordState.status === "error" && passwordState.message ? (
          <p role="alert" className="text-[12px] text-red-600">
            {passwordState.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={passwordPending}
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {passwordPending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-neutral-400">
        <div className="h-px flex-1 bg-neutral-200" />
        ou
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <form action={magicAction} className="flex flex-col gap-2">
        <Field
          label="Lien magique par email"
          name="email"
          type="email"
          autoComplete="email"
          error={magicState.fieldErrors?.email}
        />
        {magicState.status === "ok" && magicState.message ? (
          <p className="text-[12px] text-emerald-700">{magicState.message}</p>
        ) : null}
        {magicState.status === "error" && magicState.message ? (
          <p role="alert" className="text-[12px] text-red-600">
            {magicState.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={magicPending}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-neutral-400 disabled:opacity-60"
        >
          {magicPending ? "Envoi…" : "Recevoir un lien magique"}
        </button>
      </form>

      <div className="mt-5 text-center text-[12px] text-neutral-500">
        <Link href="/reset-password" className="underline hover:text-neutral-900">
          Mot de passe oublié ?
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-neutral-700">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
      {error ? <span className="text-[11px] text-red-600">{error}</span> : null}
    </label>
  );
}
