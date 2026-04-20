"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheckIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { step3Schema, type Step3Input } from "@/lib/validation/schemas";

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string; code?: string };

export function Step3Email() {
  const { data, updateData, goNext, goPrev, setQuoteRequestId } = useQuestionnaireStore();
  const [submitting, setSubmitting] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);

  const form = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
    defaultValues: { email: data.email ?? "" },
  });

  const onSubmit = async (values: Step3Input) => {
    setSubmitting(true);
    setOfflineNotice(false);
    updateData(values);

    // Essaie de créer un draft côté serveur. En cas de 503, on continue en
    // "offline mode" (Session 2) : Zustand persist suffit.
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...values,
        }),
      });
      const json = (await res.json()) as ApiResponse<{ id: string }>;
      if (json.ok) {
        setQuoteRequestId(json.data.id);
      } else if (res.status === 503) {
        setOfflineNotice(true);
      } else {
        console.warn("[Step3] API error", json);
      }
    } catch (err) {
      console.warn("[Step3] fetch error", err);
      setOfflineNotice(true);
    } finally {
      setSubmitting(false);
      goNext();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Votre email</h1>
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Encore 3 étapes pour recevoir votre estimation personnalisée. Laissez-nous votre email :
          vous recevrez un récapitulatif détaillé et un devis définitif sous 2h ouvrées.
        </p>
      </header>

      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.fr"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="text-muted-foreground flex items-start gap-2 text-xs">
        <ShieldCheckIcon className="size-4 shrink-0" aria-hidden />
        <span>
          Pas de spam. Vos données restent chez nous (RGPD). Vous pouvez demander leur suppression à
          tout moment.
        </span>
      </div>

      {offlineNotice ? (
        <Alert>
          <AlertDescription>
            Service d&apos;enregistrement temporairement indisponible. Vos réponses sont conservées
            localement : vous pouvez poursuivre le questionnaire et soumettre plus tard.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex items-center justify-between">
        <Button variant="ghost" type="button" onClick={goPrev}>
          Retour
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Un instant…" : "Continuer"}
        </Button>
      </div>
    </form>
  );
}
