"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { acceptDevisViaToken, refuseDevisViaToken } from "@/lib/features/devis/actions";

export function AcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const res = await acceptDevisViaToken(token);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  const handleRefuse = () => {
    setError(null);
    startTransition(async () => {
      const res = await refuseDevisViaToken(token, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-700">
        Cliquez sur « Accepter » pour valider le devis. L&apos;équipe Servicimmo
        prend contact sous 2 h ouvrées.
      </p>
      <button
        type="button"
        onClick={handleAccept}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Traitement…" : "Accepter le devis"}
      </button>

      <details className="mt-2">
        <summary className="cursor-pointer text-[12px] text-neutral-500">
          Refuser le devis
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Motif du refus (optionnel)"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleRefuse}
            disabled={pending}
            className="self-start rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-neutral-400 disabled:opacity-60"
          >
            Confirmer le refus
          </button>
        </div>
      </details>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
