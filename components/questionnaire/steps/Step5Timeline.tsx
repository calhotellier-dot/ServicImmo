"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { PaperclipIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { RadioCard } from "@/components/questionnaire/controls/RadioCard";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { step5Schema, type Step5Input } from "@/lib/validation/schemas";

const URGENCY_OPTIONS: { value: Step5Input["urgency"]; title: string }[] = [
  { value: "asap", title: "Dès que possible (< 48h)" },
  { value: "week", title: "Sous une semaine" },
  { value: "two_weeks", title: "Sous deux semaines" },
  { value: "month", title: "Dans le mois" },
  { value: "flexible", title: "Pas pressé / à planifier" },
];

export function Step5Timeline() {
  const { data, updateData, goNext, goPrev } = useQuestionnaireStore();

  const form = useForm<Step5Input>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      urgency: data.urgency,
      notes: data.notes ?? "",
    },
  });

  const onSubmit = (values: Step5Input) => {
    updateData(values);
    goNext();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Délai et précisions</h1>
        <p className="text-muted-foreground text-sm">
          Deux dernières questions avant votre récapitulatif.
        </p>
      </header>

      <div className="space-y-3">
        <Label>Quand souhaitez-vous l&apos;intervention ?</Label>
        <Controller
          control={form.control}
          name="urgency"
          render={({ field }) => (
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              className="grid gap-2"
            >
              {URGENCY_OPTIONS.map((opt) => (
                <RadioCard key={opt.value} value={opt.value} title={opt.title} />
              ))}
            </RadioGroup>
          )}
        />
        {form.formState.errors.urgency ? (
          <p className="text-destructive text-sm">Veuillez choisir un délai.</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Message ou précision (optionnel)</Label>
        <Textarea
          id="notes"
          placeholder="Contraintes d'accès, informations complémentaires…"
          rows={4}
          {...form.register("notes")}
        />
      </div>

      {/* Upload désactivé Session 2 */}
      <div className="space-y-2">
        <Label>Documents à joindre (optionnel)</Label>
        <div className="border-muted-foreground/30 bg-muted/30 text-muted-foreground flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
          <PaperclipIcon className="size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Bientôt disponible</p>
            <p className="text-xs">
              Plans, anciens diagnostics, attestations — la pièce jointe arrivera en prochaine
              version. Vous pouvez nous envoyer vos fichiers par email après soumission.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" type="button" onClick={goPrev}>
          Retour
        </Button>
        <Button type="submit" size="lg">
          Voir mon récapitulatif
        </Button>
      </div>
    </form>
  );
}
