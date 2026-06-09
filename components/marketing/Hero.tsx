import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";

import { MapCard } from "./MapCard";

/**
 * Hero D3 — fond slate, kicker, h1 anis, sous-titre, 2 CTAs, strip 4 badges,
 * MapCard à droite. Copy figée sur le ton "warm" (défaut handoff).
 */
const HERO_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cpath d='M0 80 Q40 40 80 80 T160 80' fill='none' stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1'/%3E%3Cpath d='M0 100 Q40 60 80 100 T160 100' fill='none' stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1'/%3E%3Cpath d='M0 120 Q40 80 80 120 T160 120' fill='none' stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E\")";

const STRIP = [
  { value: "LCC", rest: " Qualixpert", label: "Cabinet certifié" },
  { value: "Allianz", rest: "", label: "Assurance RCP" },
  { value: "Tours", rest: " + Fondettes", label: "Équipes locales" },
  { value: "Tout le 37", rest: "", label: "Indre-et-Loire" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-home-slate)] py-24 text-white md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: HERO_PATTERN }}
      />
      <div className="relative z-[1] mx-auto grid max-w-[1280px] items-center gap-12 px-6 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-12">
        <div>
          <Eyebrow onDark>Indre-et-Loire · Tours &amp; Fondettes</Eyebrow>
          <h1 className="mt-5 mb-5 max-w-[16ch] font-medium text-balance tracking-[-0.035em] text-white text-[40px] leading-[1.02] sm:text-[52px] md:text-[60px]">
            Votre partenaire diagnostic immobilier{" "}
            <em className="font-medium not-italic text-[var(--color-home-saf)]">
              en Indre-et-Loire
            </em>
            .
          </h1>
          <p className="mb-8 max-w-[48ch] text-[17px] leading-relaxed text-white/75 md:text-[18px]">
            Construction, location, vente, travaux, gestion de copropriété — la plupart des biens
            immobiliers doivent faire l&apos;objet de diagnostics et de contrôles. Servicimmo vous
            accompagne au quotidien pour respecter une réglementation de plus en plus étoffée.
          </p>

          <div className="mb-10 flex flex-wrap gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-saf)] px-6 py-4 text-[14px] font-semibold text-[var(--color-home-slate)] transition-opacity hover:opacity-90"
            >
              Demander un devis gratuit <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="tel:+33247470123"
              className="inline-flex items-center gap-2 rounded-[6px] border border-white/30 px-6 py-4 text-[14px] font-medium text-white transition-colors hover:bg-white/5"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden /> 02 47 47 0123
            </a>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-5 border-t border-white/10 pt-7">
            {STRIP.map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <div className="text-[20px] font-medium tracking-[-0.02em] text-white sm:text-[22px]">
                  <em className="font-medium not-italic text-[var(--color-home-saf)]">
                    {item.value}
                  </em>
                  {item.rest}
                </div>
                <div className="font-mono text-[11px] tracking-[0.05em] text-white/55 uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <MapCard density="medium" />
      </div>
    </section>
  );
}

/**
 * Eyebrow partagé (tiret horizontal + caps mono).
 */
export function Eyebrow({ children, onDark }: { children: React.ReactNode; onDark?: boolean }) {
  const color = onDark ? "var(--color-home-saf)" : "var(--color-home-saf-dark)";
  return (
    <span
      className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.1em] uppercase"
      style={{ color }}
    >
      <span
        aria-hidden
        className="h-[1px] w-[22px]"
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  );
}
