"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { DiagnosticCard } from "@/components/questionnaire/controls/DiagnosticCard";
import { RadioCard } from "@/components/questionnaire/controls/RadioCard";
import type { DiagnosticsResult, PriceEstimate, RequiredDiagnostic } from "@/lib/diagnostics/types";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { step6Schema, type Step6Input } from "@/lib/validation/schemas";

type CalculateResponse = DiagnosticsResult & { estimate: PriceEstimate };
type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string; code?: string };

export function Step6Recap() {
  const router = useRouter();
  const { data, updateData, goPrev, quoteRequestId, markSubmitted } = useQuestionnaireStore();

  const [calc, setCalc] = useState<CalculateResponse | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  const form = useForm<Step6Input>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      civility: data.civility,
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      phone: data.phone ?? "",
      consent_rgpd: data.consent_rgpd ?? false,
    },
  });

  // Fetch du calcul à l'arrivée sur l'étape 6.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setCalcError(null);
      try {
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_type: data.project_type,
            property_type: data.property_type,
            address: data.address,
            postal_code: data.postal_code,
            city: data.city,
            surface: data.surface,
            rooms_count: data.rooms_count,
            is_coownership: data.is_coownership,
            permit_date_range: data.permit_date_range,
            heating_type: data.heating_type,
            gas_installation: data.gas_installation,
            gas_over_15_years: data.gas_over_15_years,
            electric_over_15_years: data.electric_over_15_years,
            rental_furnished: data.rental_furnished,
            works_type: data.works_type,
            urgency: data.urgency,
          }),
        });
        const json = (await res.json()) as ApiResponse<CalculateResponse>;
        if (cancelled) return;
        if (json.ok) setCalc(json.data);
        else setCalcError(json.error);
      } catch (err) {
        if (!cancelled) {
          setCalcError("Impossible de calculer les diagnostics.");
          console.warn("[Step6] calcul error", err);
        }
      }
    }
    run();

    return () => {
      cancelled = true;
    };
  }, [
    data.project_type,
    data.property_type,
    data.address,
    data.postal_code,
    data.city,
    data.surface,
    data.rooms_count,
    data.is_coownership,
    data.permit_date_range,
    data.heating_type,
    data.gas_installation,
    data.gas_over_15_years,
    data.electric_over_15_years,
    data.rental_furnished,
    data.works_type,
    data.urgency,
  ]);

  const onSubmit = async (values: Step6Input) => {
    setSubmitting(true);
    setSubmitNotice(null);
    updateData(values);

    const fullPayload = { ...data, ...values };
    const targetId = quoteRequestId ?? "offline";

    try {
      const res = await fetch(`/api/quote-request/${encodeURIComponent(targetId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });
      const json = (await res.json()) as ApiResponse<{
        id: string;
        status: string;
      }>;

      if (json.ok) {
        markSubmitted();
        router.push("/devis/merci");
        return;
      }

      if (res.status === 503) {
        // Session 2 : Supabase pas configuré → on marque submitted localement
        // et on redirige vers l'écran de confirmation avec un warning.
        markSubmitted();
        router.push("/devis/merci?offline=1");
        return;
      }

      setSubmitNotice(json.error);
    } catch (err) {
      console.warn("[Step6] submit error", err);
      setSubmitNotice("Erreur réseau — veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Votre récapitulatif</h1>
        <p className="text-muted-foreground text-sm">
          Voici les diagnostics obligatoires identifiés et leur estimation.
        </p>
      </header>

      {/* Bloc 1 — Diagnostics */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Diagnostics identifiés</h2>
        {calc ? (
          <>
            {calc.required.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Aucun diagnostic obligatoire détecté — nos experts étudieront votre cas.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {calc.required.map((d: RequiredDiagnostic) => (
                  <li key={d.id}>
                    <DiagnosticCard diagnostic={d} />
                  </li>
                ))}
              </ul>
            )}
            {calc.toClarify.length > 0 ? (
              <div className="space-y-3 pt-2">
                <p className="text-muted-foreground text-sm font-medium">À valider sur place</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {calc.toClarify.map((d: RequiredDiagnostic) => (
                    <li key={`clarify-${d.id}`}>
                      <DiagnosticCard diagnostic={d} variant="toClarify" />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : calcError ? (
          <Alert variant="destructive">
            <AlertTitle>Calcul indisponible</AlertTitle>
            <AlertDescription>{calcError}</AlertDescription>
          </Alert>
        ) : (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            Analyse en cours…
          </div>
        )}
      </section>

      {/* Bloc 2 — Estimation */}
      {calc && calc.estimate.max > 0 ? (
        <section className="bg-primary/5 border-primary/20 space-y-3 rounded-xl border p-6">
          <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
            Estimation tarifaire
          </p>
          <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Entre {calc.estimate.min.toLocaleString("fr-FR")} €
            <span className="text-muted-foreground mx-2 text-2xl font-normal">et</span>
            {calc.estimate.max.toLocaleString("fr-FR")} €
            <span className="text-muted-foreground text-xl font-normal"> TTC</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Devis définitif sous 2h ouvrées après validation.
          </p>
          {calc.estimate.appliedModulators.length > 0 ? (
            <ul className="text-muted-foreground flex flex-wrap gap-2 pt-2 text-xs">
              {calc.estimate.appliedModulators.map((m) => (
                <li key={m} className="bg-background rounded-full border px-2.5 py-1">
                  {m}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-muted-foreground/70 border-t pt-3 text-xs leading-relaxed">
            Estimation indicative basée sur les tarifs 2026. Le devis final prend en compte les
            caractéristiques précises de votre bien et votre secteur géographique.
          </p>
        </section>
      ) : null}

      {/* Bloc 3 — Coordonnées */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold">Vos coordonnées</h2>

        <div className="space-y-3">
          <Label>Civilité</Label>
          <Controller
            control={form.control}
            name="civility"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                className="grid gap-2 sm:grid-cols-3"
              >
                <RadioCard value="mr" title="M." />
                <RadioCard value="mme" title="Mme" />
                <RadioCard value="other" title="Autre" />
              </RadioGroup>
            )}
          />
          {form.formState.errors.civility ? (
            <p className="text-destructive text-sm">Civilité requise.</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom</Label>
            <Input id="first_name" autoComplete="given-name" {...form.register("first_name")} />
            {form.formState.errors.first_name ? (
              <p className="text-destructive text-sm">{form.formState.errors.first_name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Nom</Label>
            <Input id="last_name" autoComplete="family-name" {...form.register("last_name")} />
            {form.formState.errors.last_name ? (
              <p className="text-destructive text-sm">{form.formState.errors.last_name.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Téléphone{" "}
            <span className="text-muted-foreground text-xs font-normal">
              — recommandé pour accélérer la prise de RDV
            </span>
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="06 00 00 00 00"
            {...form.register("phone")}
          />
          {form.formState.errors.phone ? (
            <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>
      </section>

      {/* Bloc 4 — Consentement + Submit */}
      <section className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border p-4">
          <Controller
            control={form.control}
            name="consent_rgpd"
            render={({ field }) => (
              <Checkbox
                id="consent_rgpd"
                checked={field.value ?? false}
                onCheckedChange={(v) => field.onChange(Boolean(v))}
              />
            )}
          />
          <Label
            htmlFor="consent_rgpd"
            className="text-muted-foreground text-xs leading-relaxed font-normal"
          >
            J&apos;accepte que Servicimmo utilise mes données pour traiter ma demande de devis.
            Aucun partage à des tiers, suppression possible à tout moment. Cf. mentions légales.
          </Label>
        </div>
        {form.formState.errors.consent_rgpd ? (
          <p className="text-destructive text-sm">{form.formState.errors.consent_rgpd.message}</p>
        ) : null}

        {submitNotice ? (
          <Alert variant="destructive">
            <AlertDescription>{submitNotice}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center justify-between">
          <Button variant="ghost" type="button" onClick={goPrev}>
            Retour
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Envoi…" : "Envoyer ma demande"}
          </Button>
        </div>
      </section>
    </form>
  );
}
