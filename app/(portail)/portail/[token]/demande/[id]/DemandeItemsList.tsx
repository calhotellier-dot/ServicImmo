"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { submitItemAnswer } from "@/lib/features/demandes-documents/actions";
import type { DemandeItemRow } from "@/lib/supabase/types";

export function DemandeItemsList({
  token,
  items,
}: {
  token: string;
  items: DemandeItemRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const updateAnswer = (id: string, v: string) =>
    setAnswers((a) => ({ ...a, [id]: v }));

  const submitQuestion = (itemId: string) => {
    const text = answers[itemId];
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const res = await submitItemAnswer(token, itemId, { text });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  // Upload minimal via endpoint fichier séparé : pour l'instant, on bloque
  // l'upload réel côté portail (nécessite une route POST signed-upload).
  // Sera activé quand le bucket Storage public sera configuré (Sprint 6.1).
  const submitSignaturePlaceholder = (itemId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await submitItemAnswer(token, itemId, {
        text: "[Signature capturée via UI portail — à brancher Sprint 6.1]",
      });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <section
          key={item.id}
          className={`rounded-xl border p-4 ${
            item.status === "completed"
              ? "border-emerald-200 bg-emerald-50"
              : "border-neutral-200 bg-white"
          }`}
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {item.item_type}
              </div>
              <div className="mt-0.5 font-medium text-neutral-900">
                {item.label}
                {item.required ? (
                  <span className="ml-1 text-red-500">*</span>
                ) : null}
              </div>
              {item.description ? (
                <p className="mt-1 text-[12px] text-neutral-500">{item.description}</p>
              ) : null}
            </div>
            {item.status === "completed" ? (
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-900">
                Fourni
              </span>
            ) : null}
          </div>

          {item.status !== "completed" ? (
            item.item_type === "document" ? (
              <div className="text-[12px] text-neutral-600">
                L&apos;upload de fichiers depuis le portail sera activé dès que le
                bucket Supabase Storage `demande-uploads` sera provisionné. Pour
                l&apos;instant, envoyez vos fichiers à contact@servicimmo.fr en
                mentionnant la référence <strong>ci-dessus</strong>.
              </div>
            ) : item.item_type === "question" ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={answers[item.id] ?? ""}
                  onChange={(e) => updateAnswer(item.id, e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => submitQuestion(item.id)}
                  disabled={pending || !answers[item.id]}
                  className="self-start rounded-lg bg-neutral-900 px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                >
                  {pending ? "Envoi…" : "Envoyer ma réponse"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => submitSignaturePlaceholder(item.id)}
                disabled={pending}
                className="rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-[12px] text-neutral-700 hover:border-neutral-400 disabled:opacity-60"
              >
                Signer (stub — UI signature dédiée Sprint 6.1)
              </button>
            )
          ) : null}
        </section>
      ))}
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
