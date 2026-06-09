import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Eyebrow } from "./Hero";

type NewsItem = {
  tag: string;
  date: { d: string; m: string };
  title: string;
  excerpt: string;
  color: string;
};

/**
 * Stubs de données — à remplacer par les articles Supabase en S3.
 */
const NEWS: NewsItem[] = [
  {
    tag: "DPE",
    date: { d: "27", m: "Mars 2026" },
    title: "DPE reconduction du bail, DPE travaux : bientôt de nouvelles obligations ?",
    excerpt:
      "Vous reconduisez le contrat de location d'un appartement, d'une maison ou d'un local professionnel ? Vous venez d'engager des travaux…",
    color: "var(--color-home-saf)",
  },
  {
    tag: "Plomb",
    date: { d: "25", m: "Fév. 2026" },
    title: "Plomb avant travaux : le risque au cœur de onze affiches de prévention",
    excerpt:
      "La lutte contre l'exposition professionnelle au plomb sur les chantiers de bâtiments anciens est un combat de longue haleine qui…",
    color: "var(--color-home-slate)",
  },
  {
    tag: "Amiante",
    date: { d: "29", m: "Janv. 2026" },
    title: "Amiante et rénovation énergétique : attention aux risques dans les bâtiments anciens",
    excerpt:
      "La nécessité de réduire les consommations d'énergie des bâtiments pour faire des économies et protéger la planète…",
    color: "var(--color-home-saf-dark)",
  },
];

export function Actualites() {
  return (
    <section className="border-t border-[var(--color-home-line)] bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mx-auto mb-14 max-w-[800px] text-center">
          <div className="inline-flex justify-center">
            <Eyebrow>Nos dernières actualités</Eyebrow>
          </div>
          <h2 className="mx-auto mt-4 mb-4 max-w-[20ch] text-[32px] leading-[1.1] font-medium tracking-[-0.025em] text-[var(--color-home-ink)] sm:text-[40px]">
            L&apos;évolution réglementaire,{" "}
            <em className="font-medium text-[var(--color-home-saf-dark)] not-italic">expliquée</em>
            .
          </h2>
          <p className="mx-auto max-w-[55ch] text-[16px] leading-relaxed text-[var(--color-home-muted-2)]">
            La réglementation du diagnostic immobilier bouge régulièrement. Nos articles vous
            aident à rester à jour sur vos obligations.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {NEWS.map((n, i) => (
            <article
              key={i}
              className="overflow-hidden rounded-[14px] border border-[var(--color-home-line)] bg-white"
            >
              <div
                className="relative grid h-[140px] place-items-center text-white"
                style={{ background: n.color }}
              >
                <span className="font-mono text-[11px] tracking-[0.1em] text-white/85 uppercase">
                  {n.tag}
                </span>
                <div
                  className="absolute right-4 bottom-0 translate-y-1/2 bg-[var(--color-home-slate)] px-3 py-2.5 text-center text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
                >
                  <div className="text-[20px] font-semibold leading-none tracking-[-0.02em]">
                    {n.date.d}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-white/70">{n.date.m}</div>
                </div>
              </div>
              <div className="px-6 pt-7 pb-6">
                <h3 className="mb-2.5 text-[16px] leading-[1.35] font-semibold tracking-[-0.015em] text-[var(--color-home-ink)]">
                  {n.title}
                </h3>
                <p className="mb-4 text-[13px] leading-relaxed text-[var(--color-home-muted-2)]">
                  {n.excerpt}
                </p>
                <Link
                  href="/actualites"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-home-saf-dark)]"
                >
                  Lire l&apos;article <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
