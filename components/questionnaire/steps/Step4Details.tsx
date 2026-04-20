"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioCard } from "@/components/questionnaire/controls/RadioCard";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { step4Schema, type Step4Input } from "@/lib/validation/schemas";

const PERMIT_OPTIONS: {
  value: Step4Input["permit_date_range"];
  title: string;
  description?: string;
}[] = [
  {
    value: "before_1949",
    title: "Avant janvier 1949",
    description: "Risque plomb + amiante possibles.",
  },
  {
    value: "1949_to_1997",
    title: "Entre 1949 et juillet 1997",
    description: "Risque amiante possible.",
  },
  {
    value: "after_1997",
    title: "Après juillet 1997",
    description: "Plus d'amiante dans les matériaux.",
  },
  {
    value: "unknown",
    title: "Je ne sais pas",
    description: "Nos experts identifieront cela lors du RDV.",
  },
];

const BOOLEAN_OPTIONS: { value: "yes" | "no" | "unknown"; title: string }[] = [
  { value: "yes", title: "Oui" },
  { value: "no", title: "Non" },
  { value: "unknown", title: "Je ne sais pas" },
];

const FURNISHED_OPTIONS: {
  value: Step4Input["rental_furnished"];
  title: string;
}[] = [
  { value: "vide", title: "Logement vide" },
  { value: "meuble", title: "Meublé" },
  { value: "saisonnier", title: "Saisonnier / courte durée" },
  { value: "unknown", title: "Je ne sais pas" },
];

const WORKS_OPTIONS: {
  value: Step4Input["works_type"];
  title: string;
  description?: string;
}[] = [
  { value: "renovation", title: "Rénovation" },
  { value: "demolition", title: "Démolition" },
  { value: "voirie", title: "Voirie / enrobés" },
  { value: "other", title: "Autre" },
  { value: "unknown", title: "Je ne sais pas" },
];

export function Step4Details() {
  const { data, updateData, goNext, goPrev } = useQuestionnaireStore();

  const form = useForm<Step4Input>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      permit_date_range: data.permit_date_range,
      heating_type: data.heating_type,
      gas_installation: data.gas_installation,
      gas_over_15_years: data.gas_over_15_years ?? null,
      electric_over_15_years: data.electric_over_15_years ?? null,
      rental_furnished: data.rental_furnished,
      works_type: data.works_type,
    },
  });

  const projectType = data.project_type;
  const isRental = projectType === "rental";
  const isWorks = projectType === "works";

  const onSubmit = (values: Step4Input) => {
    updateData(values);
    goNext();
  };

  const toBool = (v: string | undefined): boolean | null => {
    if (v === "yes") return true;
    if (v === "no") return false;
    return null;
  };
  const fromBool = (b: boolean | null | undefined): string => {
    if (b === true) return "yes";
    if (b === false) return "no";
    return "unknown";
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Caractéristiques techniques
        </h1>
        <p className="text-muted-foreground text-sm">
          Ces informations déterminent les diagnostics obligatoires.
        </p>
      </header>

      {/* Date du permis */}
      <div className="space-y-3">
        <Label>Date du permis de construire</Label>
        <Controller
          control={form.control}
          name="permit_date_range"
          render={({ field }) => (
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
            >
              {PERMIT_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  value={opt.value}
                  title={opt.title}
                  description={opt.description}
                />
              ))}
            </RadioGroup>
          )}
        />
      </div>

      {/* Chauffage */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heating_type">Mode de chauffage principal</Label>
          <Controller
            control={form.control}
            name="heating_type"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="heating_type" className="w-full">
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gas">Gaz</SelectItem>
                  <SelectItem value="electric">Électrique</SelectItem>
                  <SelectItem value="wood">Bois</SelectItem>
                  <SelectItem value="fuel">Fioul</SelectItem>
                  <SelectItem value="heat_pump">Pompe à chaleur</SelectItem>
                  <SelectItem value="mixed">Autre / mixte</SelectItem>
                  <SelectItem value="unknown">Je ne sais pas</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gas_installation">Installation gaz présente ?</Label>
          <Controller
            control={form.control}
            name="gas_installation"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="gas_installation" className="w-full">
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  <SelectItem value="city_gas">Gaz de ville</SelectItem>
                  <SelectItem value="tank">Citerne extérieure</SelectItem>
                  <SelectItem value="bottles">Bouteilles</SelectItem>
                  <SelectItem value="meter_no_contract">Compteur sans abonnement</SelectItem>
                  <SelectItem value="unknown">Je ne sais pas</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* Ages installations */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label>L&apos;installation gaz a plus de 15 ans ?</Label>
          <Controller
            control={form.control}
            name="gas_over_15_years"
            render={({ field }) => (
              <RadioGroup
                value={fromBool(field.value)}
                onValueChange={(v) => field.onChange(toBool(v))}
                className="grid gap-2"
              >
                {BOOLEAN_OPTIONS.map((o) => (
                  <RadioCard key={o.value} value={o.value} title={o.title} />
                ))}
              </RadioGroup>
            )}
          />
        </div>

        <div className="space-y-3">
          <Label>L&apos;installation électrique a plus de 15 ans ?</Label>
          <Controller
            control={form.control}
            name="electric_over_15_years"
            render={({ field }) => (
              <RadioGroup
                value={fromBool(field.value)}
                onValueChange={(v) => field.onChange(toBool(v))}
                className="grid gap-2"
              >
                {BOOLEAN_OPTIONS.map((o) => (
                  <RadioCard key={o.value} value={o.value} title={o.title} />
                ))}
              </RadioGroup>
            )}
          />
        </div>
      </div>

      {/* Conditionnel location */}
      {isRental ? (
        <div className="space-y-3">
          <Label>Location : vide ou meublée ?</Label>
          <p className="text-muted-foreground text-xs">
            Impacte l&apos;obligation de la Loi Boutin (logement vide à usage de résidence
            principale uniquement).
          </p>
          <Controller
            control={form.control}
            name="rental_furnished"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                className="grid gap-2 sm:grid-cols-2"
              >
                {FURNISHED_OPTIONS.map((o) => (
                  <RadioCard key={o.value} value={o.value ?? ""} title={o.title} />
                ))}
              </RadioGroup>
            )}
          />
        </div>
      ) : null}

      {/* Conditionnel travaux */}
      {isWorks ? (
        <div className="space-y-3">
          <Label>Type d&apos;intervention</Label>
          <Controller
            control={form.control}
            name="works_type"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                className="grid gap-2 sm:grid-cols-2"
              >
                {WORKS_OPTIONS.map((o) => (
                  <RadioCard
                    key={o.value}
                    value={o.value ?? ""}
                    title={o.title}
                    description={o.description}
                  />
                ))}
              </RadioGroup>
            )}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button variant="ghost" type="button" onClick={goPrev}>
          Retour
        </Button>
        <Button type="submit" size="lg">
          Continuer
        </Button>
      </div>
    </form>
  );
}
