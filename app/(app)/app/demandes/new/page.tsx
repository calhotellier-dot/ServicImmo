import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { listModeles } from "@/lib/features/demandes-documents/queries";

import { DemandeForm } from "./DemandeForm";

export default async function NewDemandePage() {
  const modeles = await listModeles();
  return (
    <div>
      <Link
        href="/app/demandes"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Demandes
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Nouvelle demande de documents</h1>
      <DemandeForm modeles={modeles} />
    </div>
  );
}
