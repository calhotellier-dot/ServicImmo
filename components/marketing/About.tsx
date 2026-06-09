"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckIcon, PhoneIcon, ShieldCheckIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { useCountUp } from "@/hooks/useCountUp";

const POINTS = [
  {
    title: "Équipe locale certifiée",
    desc: "Des diagnostiqueurs du territoire, formés et assurés.",
  },
  {
    title: "Veille réglementaire continue",
    desc: "Publiée et partagée avec vous depuis 2017.",
  },
  {
    title: "Tarifs transparents",
    desc: "Annoncés à l'avance, sans mauvaise surprise.",
  },
  {
    title: "Rapports conformes",
    desc: "Des documents opposables, reconnus par les notaires.",
  },
] as const;

/** Section Pourquoi Servicimmo (v-about-1) — home.html:123-151 */
export function About() {
  const { ref: countRef, value: countValue } = useCountUp(10000);

  return (
    <section
      id="apropos"
      className="bg-[color:var(--color-home-bg)] py-[52px]"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid items-center gap-16 md:grid-cols-[.92fr_1.08fr]">

          {/* ── Colonne gauche : média ── */}
          <Reveal direction="left">
            <div className="relative">
              <Image
                src="/img/si/about1.jpg"
                alt="Diagnostiqueur Servicimmo en inspection sur le terrain"
                width={900}
                height={1350}
                loading="lazy"
                className="h-[560px] w-full rounded-[24px] object-cover shadow-[0_20px_60px_rgba(15,30,58,.18)]"
              />

              {/* Badge « Certifiés & assurés » */}
              <div className="absolute left-[22px] top-[22px] flex items-center gap-2 rounded-full bg-white/95 px-4 py-[10px] shadow-[0_4px_14px_rgba(15,30,58,.12)] backdrop-blur-sm">
                <ShieldCheckIcon
                  className="h-4 w-4 flex-none text-[color:var(--color-home-saf-dark)]"
                  aria-hidden
                />
                <span className="font-[family-name:var(--font-sora)] text-[13px] font-bold text-[color:var(--color-home-ink)]">
                  Certifiés &amp; assurés
                </span>
              </div>

              {/* Encart flottant « 10 000+ diagnostics » */}
              <div className="absolute -right-7 bottom-[46px] flex flex-col gap-1 rounded-[18px] border-b-[5px] border-[color:var(--color-home-saf)] bg-[color:var(--color-si-petrole)] px-[26px] py-[22px] shadow-[0_16px_48px_rgba(15,30,58,.35)]">
                <div className="flex items-baseline gap-1 font-[family-name:var(--font-sora)] text-[40px] font-extrabold leading-none text-white">
                  <span ref={countRef}>{countValue.toLocaleString("fr-FR")}</span>
                  <em className="not-italic text-[26px] font-extrabold text-[color:var(--color-home-saf)]">
                    +
                  </em>
                </div>
                <p className="text-[13px] leading-[1.4] text-white/70">
                  diagnostics réalisés
                  <br />
                  en Indre-et-Loire
                </p>
              </div>
            </div>
          </Reveal>

          {/* ── Colonne droite : copy ── */}
          <Reveal direction="right">
            <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
              Pourquoi Servicimmo
            </span>
            <h2 className="mt-[18px] mb-[18px] max-w-[560px] font-[family-name:var(--font-sora)] text-[clamp(28px,3vw,40px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
              Un cabinet indépendant à Tours, fidèle à ses clients depuis plus de 25 ans
            </h2>
            <p className="mb-[30px] max-w-[560px] font-[family-name:var(--font-inter)] text-[18px] leading-[1.65] text-[color:var(--color-home-muted)]">
              Depuis 1998, notre équipe locale de diagnostiqueurs certifiés et assurés accompagne
              particuliers, notaires, syndics, agences et collectivités d&apos;Indre-et-Loire.
              Plus de 10&nbsp;000 diagnostics réalisés, avec la même exigence de clarté et de fiabilité.
            </p>

            <ul className="mb-[34px] grid grid-cols-2 gap-x-[28px] gap-y-[18px] max-[640px]:grid-cols-1">
              {POINTS.map((pt, i) => (
                <Reveal key={pt.title} direction="up" delay={i * 0.08}>
                  <li className="flex items-start gap-[14px]">
                    <span className="mt-[2px] flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-[color:var(--color-home-saf-bg)] text-[color:var(--color-home-saf-dark)]">
                      <CheckIcon className="h-[14px] w-[14px]" aria-hidden />
                    </span>
                    <div>
                      <strong className="block font-[family-name:var(--font-sora)] text-[15.5px] font-bold text-[color:var(--color-home-ink)]">
                        {pt.title}
                      </strong>
                      <span className="text-[13.5px] leading-[1.45] text-[color:var(--color-home-muted)]">
                        {pt.desc}
                      </span>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-home-saf)] px-6 py-3.5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
              >
                Demander un devis
              </Link>
              <a
                href="tel:0247470123"
                className="inline-flex items-center gap-[9px] font-[family-name:var(--font-sora)] text-[15.5px] font-bold text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]"
              >
                <PhoneIcon className="h-4 w-4" aria-hidden />
                Parler à un diagnostiqueur
              </a>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
