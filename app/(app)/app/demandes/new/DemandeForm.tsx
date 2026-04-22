"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createDemande } from "@/lib/features/demandes-documents/actions";
import type { DemandeItemType, ModeleDemandeRow } from "@/lib/supabase/types";

type Item = { item_type: DemandeItemType; label: string; required: boolean };

type ModeleItem = { item_type: DemandeItemType; label: string; required?: boolean };

export function DemandeForm({ modeles }: { modeles: ModeleDemandeRow[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const applyModele = (id: string) => {
    const m = modeles.find((x) => x.id === id);
    if (!m) return;
    const modeleItems = Array.isArray(m.items) ? (m.items as unknown as ModeleItem[]) : [];
    setItems(
      modeleItems.map((it) => ({
        item_type: it.item_type ?? "document",
        label: it.label ?? "",
        required: it.required ?? true,
      }))
    );
  };

  const addItem = () =>
    setItems((arr) => [...arr, { item_type: "document", label: "", required: true }]);

  const updateItem = (idx: number, patch: Partial<Item>) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const removeItem = (idx: number) =>
    setItems((arr) => arr.filter((_, i) => i !== idx));

  const submit = () => {
    if (!email) {
      setError("Email destinataire requis.");
      return;
    }
    if (items.length === 0) {
      setError("Ajoutez au moins un item.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createDemande({
        recipient_email: email,
        recipient_name: name || undefined,
        message: message || undefined,
        due_date: dueDate || undefined,
        items: items.filter((i) => i.label),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPortalUrl(res.data.portalUrl);
      router.refresh();
    });
  };

  return (
    <div className="grid max-w-3xl gap-5">
      {modeles.length > 0 ? (
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="mb-2 font-mono text-[11px] tracking-widest text-neutral-500">
            MODÈLES
          </div>
          <div className="flex flex-wrap gap-2">
            {modeles.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => applyModele(m.id)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400"
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        <Field label="Email destinataire" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Nom destinataire (optionnel)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Échéance">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
      </section>

      <Field label="Message accompagnement (optionnel)">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </Field>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-widest text-neutral-500">
            ITEMS DEMANDÉS
          </div>
          <button
            type="button"
            onClick={addItem}
            className="text-[12px] text-neutral-600 hover:text-neutral-900"
          >
            + Ajouter
          </button>
        </div>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-500">
            Aucun item — sélectionnez un modèle ou ajoutez manuellement.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2">
                <select
                  value={it.item_type}
                  onChange={(e) =>
                    updateItem(idx, { item_type: e.target.value as DemandeItemType })
                  }
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[12px]"
                >
                  <option value="document">Document</option>
                  <option value="question">Question</option>
                  <option value="signature">Signature</option>
                </select>
                <input
                  value={it.label}
                  onChange={(e) => updateItem(idx, { label: e.target.value })}
                  placeholder="Libellé"
                  className="flex-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <input
                    type="checkbox"
                    checked={it.required}
                    onChange={(e) => updateItem(idx, { required: e.target.checked })}
                  />
                  obligatoire
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[12px] text-neutral-500 hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {portalUrl ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <div className="font-medium">Demande envoyée ✓</div>
          <code className="mt-1 block break-all font-mono text-[11px]">{portalUrl}</code>
        </div>
      ) : null}

      <div>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Envoyer la demande"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
