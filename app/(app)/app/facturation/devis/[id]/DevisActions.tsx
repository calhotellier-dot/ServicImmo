"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createFactureFromDevis, sendDevis } from "@/lib/features/devis/actions";
import type { DevisStatus } from "@/lib/supabase/types";

export function DevisActions({
  devisId,
  status,
}: {
  devisId: string;
  status: DevisStatus;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSend = () => {
    setError(null);
    startTransition(async () => {
      const res = await sendDevis(devisId, email);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPortalUrl(res.data.url);
      router.refresh();
    });
  };

  const handleInvoice = () => {
    setError(null);
    startTransition(async () => {
      const res = await createFactureFromDevis(devisId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/app/facturation/factures/${res.data.id}`);
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
        ACTIONS
      </div>
      {status === "brouillon" || status === "envoye" ? (
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex flex-1 flex-col">
            <span className="mb-1.5 text-[12px] font-medium text-neutral-700">
              Email client
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@exemple.fr"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </label>
          <button
            type="button"
            onClick={handleSend}
            disabled={pending || !email}
            className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {pending ? "Envoi…" : status === "envoye" ? "Renvoyer" : "Envoyer le devis"}
          </button>
        </div>
      ) : null}

      {portalUrl ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <div className="mb-1 font-medium">Lien portail client :</div>
          <code className="break-all font-mono text-[11px]">{portalUrl}</code>
          <p className="mt-1 text-[11px] text-emerald-800">
            L&apos;email Resend sera câblé Sprint 5 ; pour l&apos;instant, transmettez
            ce lien manuellement au client.
          </p>
        </div>
      ) : null}

      {status === "accepte" ? (
        <button
          type="button"
          onClick={handleInvoice}
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Création…" : "Émettre la facture"}
        </button>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
