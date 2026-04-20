import Link from "next/link";
import { CheckCircle2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type MerciPageProps = {
  searchParams: Promise<{ offline?: string }>;
};

export const metadata = {
  title: "Demande bien reçue — merci",
};

export default async function MerciPage({ searchParams }: MerciPageProps) {
  const { offline } = await searchParams;
  const isOffline = offline === "1";

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center gap-10 px-6 py-20 text-center">
      <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
        <CheckCircle2Icon className="size-8" aria-hidden />
      </div>

      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Merci, votre demande est bien reçue !
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Un récapitulatif détaillé vous sera envoyé par email. Notre équipe vous contactera{" "}
          <strong className="text-foreground">sous 2h ouvrées</strong> pour valider votre devis et
          planifier l&apos;intervention.
        </p>
      </div>

      {isOffline ? (
        <Alert>
          <AlertTitle>Mode hors-ligne</AlertTitle>
          <AlertDescription>
            Le service d&apos;enregistrement en base est momentanément indisponible. Vos
            informations sont conservées localement ; nous les synchroniserons dès que possible.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/actualites">Voir nos articles</Link>
        </Button>
      </div>
    </main>
  );
}
