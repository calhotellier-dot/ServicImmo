"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon, ZapIcon, ClockIcon, MapPinIcon, AwardIcon, ShieldCheckIcon, BuildingIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal } from "@/components/marketing/Reveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ─── Sous-composant : bandeau certifications ─── */
const CERTS = [
  { icon: <AwardIcon className="h-[14px] w-[14px]" aria-hidden />, label: "Qualixpert" },
  { icon: <ShieldCheckIcon className="h-[14px] w-[14px]" aria-hidden />, label: "Allianz" },
  { icon: <BuildingIcon className="h-[14px] w-[14px]" aria-hidden />, label: "FNAIM Diagnostic" },
  { icon: <AwardIcon className="h-[14px] w-[14px]" aria-hidden />, label: "iCert" },
] as const;

function CertStrip() {
  return (
    <Reveal direction="up" className="mt-11 flex flex-wrap items-center gap-3.5 border-t border-[color:var(--color-home-line)] pt-7">
      <span className="mr-1.5 font-[family-name:var(--font-sora)] text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--color-home-muted)]">
        Certifiés &amp; assurés
      </span>
      {CERTS.map(({ icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg-2)] px-4 py-2 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]"
        >
          {icon}
          {label}
        </span>
      ))}
    </Reveal>
  );
}

/* ─── Composant principal Hero (v-hero-3) ─── */
export function Hero() {
  const { ref: yearsRef, value: yearsValue } = useCountUp(28);

  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-bg)]">
      {/* Deco blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12%] right-[-6%] z-0 h-[62%] w-[46%] rounded-[48%_52%_60%_40%/55%_48%_52%_45%] bg-[color:var(--color-home-saf-bg)] opacity-70 blur-[2px)]"
      />

      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 pt-10 pb-16 md:px-12">
        <div className="grid items-center gap-12 md:grid-cols-[1.05fr_.95fr]">

          {/* ── Colonne gauche : copy ── */}
          <Reveal direction="left">
            <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
              Diagnostic immobilier · Tours depuis 1998
            </span>

            <h1 className="mt-4 mb-6 font-[family-name:var(--font-sora)] text-[clamp(40px,5.4vw,76px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-[color:var(--color-home-ink)]">
              Vos diagnostics<br />
              obligatoires{" "}
              <em className="relative inline-block not-italic text-[color:var(--color-home-saf-dark)] after:absolute after:bottom-[0.08em] after:left-0 after:right-0 after:z-[-1] after:h-[0.34em] after:rounded-[3px] after:bg-[color:var(--color-home-saf)] after:opacity-30 after:content-['']">
                identifiés
              </em>
              <br />
              en 2&nbsp;minutes
            </h1>

            <p className="mb-7 max-w-[480px] font-[family-name:var(--font-inter)] text-[18.5px] leading-[1.6] text-[color:var(--color-home-muted)]">
              Vente, location, travaux : on cible précisément les diagnostics réglementaires de votre
              bien, puis on intervient vite. Devis sous 2&nbsp;h, rendez-vous sous 48&nbsp;h.
            </p>

            {/* CTA */}
            <div className="mb-6 flex flex-wrap items-center gap-[18px]">
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-home-saf)] px-6 py-3.5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
              >
                Commencer mon devis
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="tel:0247470123"
                className="inline-flex items-center gap-2.5 font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]"
              >
                <PhoneIcon className="h-4 w-4" aria-hidden />
                02 47 47 01 23
              </a>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-[22px]">
              <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]">
                <ZapIcon className="h-[14px] w-[14px]" aria-hidden /> Devis sous 2 h
              </span>
              <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]">
                <ClockIcon className="h-[14px] w-[14px]" aria-hidden /> Intervention sous 48 h
              </span>
              <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]">
                <MapPinIcon className="h-[14px] w-[14px]" aria-hidden /> Indre-et-Loire (37)
              </span>
            </div>
          </Reveal>

          {/* ── Colonne droite : visuel ── */}
          <Reveal direction="right">
            <div className="relative">
              <Image
                src="/img/si/hero1.jpg"
                alt="Bien immobilier diagnostiqué à Tours"
                width={1600}
                height={1063}
                priority
                className="h-[560px] w-full rounded-[32px] object-cover [clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] max-[880px]:[clip-path:none] max-[880px]:h-[340px]"
              />
              {/* Tag count-up */}
              <Reveal direction="zoom" className="absolute bottom-12 -left-6">
                <div className="flex flex-col rounded-[24px] border border-white/[0.08] bg-[color:var(--color-home-slate)] px-7 py-5 shadow-[0_8px_32px_rgba(15,30,58,.35)]">
                  <span
                    ref={yearsRef}
                    className="font-[family-name:var(--font-sora)] text-[42px] font-extrabold leading-none text-[color:var(--color-home-saf)]"
                  >
                    {yearsValue}
                  </span>
                  <em className="mt-1 block not-italic text-[13px] font-semibold text-white/80">
                    ans en Indre-et-Loire
                  </em>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>

        {/* ── Strip certifications ── */}
        <CertStrip />
      </div>
    </section>
  );
}

/**
 * Eyebrow partagé — conservé pour compatibilité avec les sections D3 existantes.
 * @deprecated Les nouvelles sections home.html utilisent directement une <span>.
 */
export function Eyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }) {
  const color = onDark ? "var(--color-home-saf)" : "var(--color-home-saf-dark)";
  return (
    <span
      className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
      style={{ color }}
    >
      <span aria-hidden className="h-[1px] w-[22px]" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
