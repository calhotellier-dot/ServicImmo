"use client";

import Link from "next/link";
import { PhoneIcon } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { LogoMark } from "@/components/marketing/Logo";
import type { ApiResponse } from "@/lib/api/responses";
import type { ProjectType } from "@/lib/diagnostics/types";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { EntryScreen } from "./screens/EntryScreen";
import { FillingScreen } from "./screens/FillingScreen";
import { RecapScreen } from "./screens/RecapScreen";
import { ThanksScreen } from "./screens/ThanksScreen";

/**
 * Header minimal propre au parcours devis.
 * Rappel logo cliquable → home + numéro de téléphone. Pas de nav complète :
 * on reste focus sur le questionnaire (pattern « focused flow »).
 */
function QuestionnaireHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-devis-line)] bg-[var(--color-devis-cream)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-10">
        <Link
          href="/"
          aria-label="Retour à l'accueil Servicimmo"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-devis-ink)]">
            Servicimmo
          </span>
        </Link>
        <a
          href="tel:+33247470123"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-devis-ink)] hover:opacity-80"
        >
          <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">02 47 47 0123</span>
        </a>
      </div>
    </header>
  );
}

/**
 * Root Client Component du parcours devis.
 *
 * Orchestration :
 *   entry → filling → recap → thanks
 *
 * Le store Zustand persiste dans localStorage (`servicimmo-quote` v2) : une
 * reprise de session rend directement l'écran où l'utilisateur s'était arrêté.
 */
export function QuestionnaireApp() {
  // Garde anti-mismatch SSR : on ne rend l'écran concret qu'après la fin de
  // l'hydratation du store Zustand (persist middleware lit localStorage).
  // `useSyncExternalStore` évite les setState en useEffect (React 19 lint).
  const mounted = useSyncExternalStore(
    (cb) => useQuestionnaireStore.persist.onFinishHydration(cb),
    () => useQuestionnaireStore.persist.hasHydrated(),
    () => false
  );

  const currentScreen = useQuestionnaireStore((s) => s.currentScreen);
  const data = useQuestionnaireStore((s) => s.data);
  const goToScreen = useQuestionnaireStore((s) => s.goToScreen);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const setQuoteRequestId = useQuestionnaireStore((s) => s.setQuoteRequestId);
  const reset = useQuestionnaireStore((s) => s.reset);

  const [submittingDraft, setSubmittingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const branch: ProjectType = data.project_type ?? "sale";

  async function handleContinueToRecap() {
    setDraftError(null);
    setSubmittingDraft(true);

    const payload = {
      project_type: data.project_type,
      property_type: data.property_type,
      address: data.address,
      postal_code: data.postal_code,
      city: data.city,
      surface: data.surface,
      rooms_count: data.rooms_count,
      is_coownership: data.is_coownership,
      email: data.email,
    };

    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiResponse<{ id: string }>;

      if (json.ok) {
        setQuoteRequestId(json.data.id);
      } else if (res.status !== 503) {
        // 503 = Supabase non configuré : on continue sans id (mode offline S2).
        // Toute autre erreur bloque la progression.
        setDraftError(json.error ?? "Impossible d'enregistrer votre demande.");
        return;
      }
      goToScreen("recap");
    } catch {
      setDraftError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    } finally {
      setSubmittingDraft(false);
    }
  }

  if (!mounted) {
    return <div className="min-h-[80vh] bg-[var(--color-devis-cream)]" aria-hidden />;
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]">
      <QuestionnaireHeader />
      {currentScreen === "entry" ? (
        <EntryScreen
          selected={data.project_type ?? null}
          onSelect={(b) => {
            updateData({ project_type: b });
            goToScreen("filling");
          }}
        />
      ) : null}

      {currentScreen === "filling" ? (
        <FillingScreen
          branch={branch}
          onBack={() => goToScreen("entry")}
          onContinue={handleContinueToRecap}
          submitting={submittingDraft}
          error={draftError}
        />
      ) : null}

      {currentScreen === "recap" ? (
        <RecapScreen branch={branch} onSubmitted={() => goToScreen("thanks")} />
      ) : null}

      {currentScreen === "thanks" ? (
        <ThanksScreen
          branch={branch}
          firstName={data.first_name}
          email={data.email}
          onRestart={() => {
            reset();
          }}
        />
      ) : null}
    </div>
  );
}
