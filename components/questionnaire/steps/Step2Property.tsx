"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/questionnaire/controls/AddressAutocomplete";
import { NumberInput } from "@/components/questionnaire/controls/NumberInput";
import { RadioCard } from "@/components/questionnaire/controls/RadioCard";
import { isOutOfServiceArea } from "@/lib/ban-api";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";
import { step2Schema, type Step2Input } from "@/lib/validation/schemas";

const PROPERTY_OPTIONS: {
  value: Step2Input["property_type"];
  title: string;
  description?: string;
}[] = [
  { value: "house", title: "Maison" },
  { value: "apartment", title: "Appartement" },
  { value: "building", title: "Immeuble entier" },
  { value: "commercial", title: "Local commercial / professionnel" },
  { value: "common_areas", title: "Parties communes copropriété" },
  { value: "land", title: "Terrain" },
  { value: "annex", title: "Cave, garage, dépendance" },
  { value: "other", title: "Autre" },
];

const COOWNERSHIP_OPTIONS: { value: "yes" | "no" | "unknown"; title: string }[] = [
  { value: "yes", title: "Oui" },
  { value: "no", title: "Non" },
  { value: "unknown", title: "Je ne sais pas" },
];

export function Step2Property() {
  const { data, updateData, goNext, goPrev } = useQuestionnaireStore();

  const form = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      property_type: data.property_type,
      address: data.address ?? "",
      postal_code: data.postal_code ?? "",
      city: data.city ?? "",
      surface: data.surface ?? (undefined as unknown as number),
      rooms_count: data.rooms_count ?? (undefined as unknown as number),
      is_coownership: data.is_coownership ?? null,
    },
    mode: "onBlur",
  });

  const postalCode = form.watch("postal_code");

  const outOfArea =
    typeof postalCode === "string" && postalCode.length >= 2
      ? isOutOfServiceArea(postalCode)
      : false;

  // On garde postal_code à 5 chiffres max
  useEffect(() => {
    if (postalCode && postalCode.length > 5) {
      form.setValue("postal_code", postalCode.slice(0, 5));
    }
  }, [postalCode, form]);

  const onSubmit = (values: Step2Input) => {
    updateData(values);
    goNext();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Votre bien immobilier</h1>
        <p className="text-muted-foreground text-sm">
          Quelques informations pour cadrer l&apos;intervention.
        </p>
      </header>

      {/* Type de bien */}
      <div className="space-y-3">
        <Label>Type de bien</Label>
        <Controller
          control={form.control}
          name="property_type"
          render={({ field }) => (
            <RadioGroup
              value={field.value ?? ""}
              onValueChange={field.onChange}
              className="grid gap-2 sm:grid-cols-2"
            >
              {PROPERTY_OPTIONS.map((opt) => (
                <RadioCard key={opt.value} value={opt.value} title={opt.title} />
              ))}
            </RadioGroup>
          )}
        />
        {form.formState.errors.property_type ? (
          <p className="text-destructive text-sm">Veuillez choisir un type.</p>
        ) : null}
      </div>

      {/* Adresse */}
      <div className="space-y-2">
        <Label htmlFor="address">Adresse du bien</Label>
        <Controller
          control={form.control}
          name="address"
          render={({ field }) => (
            <AddressAutocomplete
              id="address"
              value={field.value ?? ""}
              onChange={field.onChange}
              onSelect={(picked) => {
                field.onChange(picked.label);
                form.setValue("postal_code", picked.postal_code, {
                  shouldValidate: true,
                });
                form.setValue("city", picked.city, { shouldValidate: true });
              }}
            />
          )}
        />
        {form.formState.errors.address ? (
          <p className="text-destructive text-sm">{form.formState.errors.address.message}</p>
        ) : null}
      </div>

      {/* Code postal + Ville */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Code postal</Label>
          <Input
            id="postal_code"
            maxLength={5}
            inputMode="numeric"
            {...form.register("postal_code")}
          />
          {form.formState.errors.postal_code ? (
            <p className="text-destructive text-sm">{form.formState.errors.postal_code.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" {...form.register("city")} />
          {form.formState.errors.city ? (
            <p className="text-destructive text-sm">{form.formState.errors.city.message}</p>
          ) : null}
        </div>
      </div>

      {/* Alerte hors zone */}
      {outOfArea ? (
        <Alert>
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Hors zone principale</AlertTitle>
          <AlertDescription>
            Nous intervenons principalement en Indre-et-Loire et départements limitrophes. Vous
            pouvez continuer la demande : nous vérifierons notre disponibilité dans votre secteur.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Surface + pièces */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="surface">Surface habitable</Label>
          <Controller
            control={form.control}
            name="surface"
            render={({ field }) => (
              <NumberInput
                id="surface"
                value={field.value ?? null}
                onChange={(v) => field.onChange(v === null ? (undefined as unknown as number) : v)}
                suffix="m²"
                min={1}
              />
            )}
          />
          {form.formState.errors.surface ? (
            <p className="text-destructive text-sm">{form.formState.errors.surface.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="rooms_count">Nombre de pièces principales</Label>
          <Controller
            control={form.control}
            name="rooms_count"
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger id="rooms_count" className="w-full">
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Studio / 1 pièce</SelectItem>
                  <SelectItem value="2">2 pièces</SelectItem>
                  <SelectItem value="3">3 pièces</SelectItem>
                  <SelectItem value="4">4 pièces</SelectItem>
                  <SelectItem value="5">5 pièces</SelectItem>
                  <SelectItem value="6">6 pièces</SelectItem>
                  <SelectItem value="7">7 pièces ou plus</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.rooms_count ? (
            <p className="text-destructive text-sm">{form.formState.errors.rooms_count.message}</p>
          ) : null}
        </div>
      </div>

      {/* Copropriété */}
      <div className="space-y-3">
        <Label>S&apos;agit-il d&apos;une copropriété ?</Label>
        <Controller
          control={form.control}
          name="is_coownership"
          render={({ field }) => (
            <RadioGroup
              value={
                field.value === true
                  ? "yes"
                  : field.value === false
                    ? "no"
                    : field.value === null
                      ? "unknown"
                      : ""
              }
              onValueChange={(v) => field.onChange(v === "yes" ? true : v === "no" ? false : null)}
              className="grid gap-2 sm:grid-cols-3"
            >
              {COOWNERSHIP_OPTIONS.map((opt) => (
                <RadioCard key={opt.value} value={opt.value} title={opt.title} />
              ))}
            </RadioGroup>
          )}
        />
      </div>

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
