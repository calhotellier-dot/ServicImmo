"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { HammerIcon, HelpCircleIcon, HomeIcon, KeyRoundIcon, Users2Icon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioCard } from "@/components/questionnaire/controls/RadioCard";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { step1Schema, type Step1Input } from "@/lib/validation/schemas";

const OPTIONS: {
  value: Step1Input["project_type"];
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "sale",
    title: "Vente d'un bien",
    description: "Mise en vente d'une maison, appartement ou local.",
    icon: <HomeIcon className="size-5" />,
  },
  {
    value: "rental",
    title: "Mise en location",
    description: "Nouveau bail ou renouvellement de diagnostics.",
    icon: <KeyRoundIcon className="size-5" />,
  },
  {
    value: "works",
    title: "Travaux / Rénovation",
    description: "Repérage amiante / plomb avant chantier.",
    icon: <HammerIcon className="size-5" />,
  },
  {
    value: "coownership",
    title: "Gestion copropriété / syndic",
    description: "DTA, DPE collectif, parties communes.",
    icon: <Users2Icon className="size-5" />,
  },
  {
    value: "other",
    title: "Autre projet",
    description: "Décrivez-nous votre besoin, on vous recontacte.",
    icon: <HelpCircleIcon className="size-5" />,
  },
];

export function Step1Project() {
  const { data, updateData, goNext } = useQuestionnaireStore();

  const form = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      project_type: data.project_type,
    },
  });

  const onSubmit = (values: Step1Input) => {
    updateData({ project_type: values.project_type });
    goNext();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Quel est votre projet ?
        </h1>
        <p className="text-muted-foreground text-sm">
          On adapte les questions suivantes en fonction de votre réponse.
        </p>
      </header>

      <Controller
        control={form.control}
        name="project_type"
        render={({ field }) => (
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            className="grid gap-3"
          >
            {OPTIONS.map((opt) => (
              <RadioCard
                key={opt.value}
                value={opt.value}
                title={opt.title}
                description={opt.description}
                icon={opt.icon}
              />
            ))}
          </RadioGroup>
        )}
      />
      {form.formState.errors.project_type ? (
        <p className="text-destructive text-sm">Veuillez choisir un type de projet.</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Continuer
        </Button>
      </div>
    </form>
  );
}
