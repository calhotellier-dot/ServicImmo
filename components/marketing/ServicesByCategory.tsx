import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Eyebrow } from "./Hero";

type ServiceItem = { name: string; sub: string };
type ServiceCategory = { cat: string; count: number; items: ServiceItem[] };

const CATEGORIES: ServiceCategory[] = [
  {
    cat: "Amiante",
    count: 3,
    items: [
      { name: "DTA", sub: "Diagnostic technique amiante, bâtiments collectifs < 1997" },
      {
        name: "Avant travaux / démolition",
        sub: "Repérage des matériaux amiantés avant chantier",
      },
      {
        name: "Constat visuel",
        sub: "Vérification après travaux de retrait ou d'encapsulage",
      },
    ],
  },
  {
    cat: "Performance énergétique",
    count: 1,
    items: [
      { name: "DPE mention tertiaire", sub: "Locaux professionnels & décret tertiaire" },
    ],
  },
  {
    cat: "Chantier & neuf",
    count: 2,
    items: [
      { name: "Attestation RT 2012", sub: "Conformité jointe au permis de construire" },
      { name: "Amiante & HAP enrobés", sub: "Carottages routiers — France Carottage Routier" },
    ],
  },
];

export function ServicesByCategory() {
  return (
    <section className="border-y border-[var(--color-home-line)] bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_1.5fr] md:gap-20">
          <div className="md:sticky md:top-28">
            <Eyebrow>Nos prestations</Eyebrow>
            <h2 className="mt-4 mb-4 max-w-[18ch] text-[36px] leading-[1.05] font-medium tracking-[-0.025em] text-[var(--color-home-ink)] sm:text-[44px]">
              Trois métiers,{" "}
              <em className="font-medium text-[var(--color-home-saf-dark)] not-italic">
                six expertises
              </em>
              .
            </h2>
            <p className="max-w-[55ch] text-[16px] leading-relaxed text-[var(--color-home-muted-2)]">
              Nos interventions phares, organisées par domaine réglementaire — de la copropriété au
              carottage routier.
            </p>
            <Link
              href="/services"
              className="mt-7 inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-slate)] px-5 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Voir toutes les prestations <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="flex flex-col gap-10">
            {CATEGORIES.map((c, ci) => (
              <div key={c.cat}>
                <div className="mb-3.5 flex items-baseline justify-between border-b border-[var(--color-home-saf-soft)] pb-3">
                  <div className="font-mono text-[11px] font-semibold tracking-[0.1em] text-[var(--color-home-saf-dark)] uppercase">
                    {c.cat} · {c.count} intervention{c.count > 1 ? "s" : ""}
                  </div>
                  <a className="font-mono text-[12px] tracking-[0.04em] text-[var(--color-home-muted-2)]">
                    →
                  </a>
                </div>
                <div>
                  {c.items.map((s, j) => (
                    <div
                      key={s.name}
                      className={[
                        "grid items-baseline gap-4 py-3.5",
                        "grid-cols-[32px_1fr_auto] md:grid-cols-[40px_220px_1fr_auto]",
                        j === 0 ? "" : "border-t border-[var(--color-home-line-soft)]",
                      ].join(" ")}
                    >
                      <span className="font-mono text-[11px] text-[var(--color-home-muted)]">
                        {String(ci * 3 + j + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] font-medium tracking-[-0.01em] text-[var(--color-home-ink)]">
                        {s.name}
                      </span>
                      <span className="col-span-2 text-[13px] text-[var(--color-home-muted-2)] md:col-span-1">
                        {s.sub}
                      </span>
                      <a className="font-mono text-[12px] font-semibold tracking-[0.04em] text-[var(--color-home-saf-dark)] uppercase">
                        →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
