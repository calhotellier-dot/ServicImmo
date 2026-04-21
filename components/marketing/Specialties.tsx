import { ArrowRightIcon } from "lucide-react";

import { Eyebrow } from "./Hero";

const CAROTTAGES_TAGS = ["Voiries", "Parkings", "Trottoirs", "Chantiers publics"];

const AMIANTE_ITEMS = [
  "Repérage amiante avant travaux (RAAT)",
  "Repérage amiante avant démolition (RAAD)",
  "Mesures d'empoussièrement",
  "Constat visuel après travaux",
  "Recherche plomb en zone",
];

export function Specialties() {
  return (
    <section className="bg-[var(--color-home-bg)] py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Carottages routiers — card dark */}
          <div className="relative overflow-hidden rounded-[20px] bg-[var(--color-home-slate)] p-10 text-white sm:p-12">
            <div
              aria-hidden
              className="absolute -top-8 -right-8 h-[200px] w-[200px] rounded-full bg-[rgba(232,163,61,0.08)]"
            />
            <Eyebrow onDark>Spécialité</Eyebrow>
            <h2 className="mt-3.5 mb-3.5 text-[28px] leading-[1.1] font-medium tracking-[-0.025em] sm:text-[32px]">
              France Carottage Routier :{" "}
              <em className="font-medium text-[var(--color-home-saf)] not-italic">
                amiante &amp; HAP
              </em>{" "}
              sur enrobés.
            </h2>
            <p className="mb-6 max-w-[46ch] text-[15px] leading-relaxed text-white/75">
              Recherche d&apos;amiante et de HAP dans les enrobés routiers par carottages, afin de
              répondre aux obligations du Code du Travail, du Code de la Santé et du Code de
              l&apos;Environnement. Équipe dédiée, matériel spécialisé.
            </p>
            <div className="mb-7 flex flex-wrap gap-2.5">
              {CAROTTAGES_TAGS.map((t) => (
                <span
                  key={t}
                  className="rounded-[20px] border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white/85"
                >
                  {t}
                </span>
              ))}
            </div>
            <a className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-saf)] px-5 py-3 text-[14px] font-semibold text-[var(--color-home-slate)] transition-opacity hover:opacity-90">
              En savoir plus <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </a>
          </div>

          {/* Amiante chantier — card light */}
          <div className="relative rounded-[20px] border border-[var(--color-home-line)] bg-white p-10 sm:p-12">
            <Eyebrow>Spécialité</Eyebrow>
            <h2 className="mt-3.5 mb-3.5 text-[28px] leading-[1.1] font-medium tracking-[-0.025em] text-[var(--color-home-ink)] sm:text-[32px]">
              Amiante avant travaux, démolition &amp;{" "}
              <em className="font-medium text-[var(--color-home-saf-dark)] not-italic">
                après chantier
              </em>
              .
            </h2>
            <p className="mb-6 max-w-[46ch] text-[15px] leading-relaxed text-[var(--color-home-muted-2)]">
              Repérages amiante avant travaux, avant démolition, mesures d&apos;empoussièrement,
              constats visuels après travaux, recherche de plomb en zone préfectorale. Un
              interlocuteur unique pour sécuriser votre chantier.
            </p>
            <ul className="mb-7 flex flex-col gap-2.5">
              {AMIANTE_ITEMS.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2.5 text-[14px] text-[var(--color-home-ink)]"
                >
                  <span
                    aria-hidden
                    className="h-[5px] w-[5px] flex-none rounded-full bg-[var(--color-home-saf)]"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <a className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-slate)] px-5 py-3 text-[14px] font-medium text-white transition-opacity hover:opacity-90">
              Consulter nos interventions <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
