import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { getDossier } from "@/lib/features/dossiers/queries";

import { DossierWizard } from "./DossierWizard";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

const TABS = [
  { id: "dossier", label: "Dossier" },
  { id: "infos", label: "Infos bien" },
  { id: "devis", label: "Devis" },
  { id: "documents", label: "Documents" },
  { id: "journal", label: "Journal" },
  { id: "notes", label: "Notes" },
  { id: "demande", label: "Demandes" },
  { id: "export", label: "Export" },
] as const;

export default async function DossierDetailPage({ params, searchParams }: PageProps) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const dossier = await getDossier(id);
  if (!dossier) notFound();

  const activeTab = tab && TABS.some((t) => t.id === tab) ? tab : "dossier";

  return (
    <div className="max-w-5xl">
      <Link
        href="/app/dossiers"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour aux dossiers
      </Link>

      <header className="mb-5">
        <div className="font-mono text-[12px] text-neutral-500">
          {dossier.reference ?? dossier.id.slice(0, 8)}
        </div>
        <h1 className="text-2xl font-semibold">
          {dossier.address ?? "Nouveau dossier"}
          {dossier.city ? ` · ${dossier.city}` : ""}
        </h1>
      </header>

      {/* Tabs */}
      <nav className="mb-6 flex gap-1 border-b border-neutral-200">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.id === "dossier" ? `/app/dossiers/${dossier.id}` : `/app/dossiers/${dossier.id}?tab=${t.id}`}
            className={`border-b-2 px-3 py-2 text-sm ${
              activeTab === t.id
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      {activeTab === "dossier" ? (
        <DossierWizard dossier={dossier} />
      ) : (
        <StubTab label={TABS.find((t) => t.id === activeTab)?.label ?? activeTab} />
      )}
    </div>
  );
}

function StubTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-8 text-center">
      <div className="text-sm font-medium text-neutral-900">Onglet « {label} »</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
        Contenu livré dans un sprint ultérieur (cf. MASTER-PLAN.md).
      </p>
    </div>
  );
}
