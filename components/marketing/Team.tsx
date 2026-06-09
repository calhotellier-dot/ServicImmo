"use client";

import { useState } from "react";
import Image from "next/image";
import { AwardIcon, ArrowRightIcon, QuoteIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

type Member = {
  img: string;
  name: string;
  role: string;
  quote: string;
};

const DEFAULT_MEMBER: Member = {
  img: "/img/si/team1.jpg",
  name: "Julien Moreau",
  role: "Responsable technique",
  quote: "Un bon diagnostic, c'est d'abord prendre le temps d'expliquer. Nos clients repartent en ayant tout compris.",
};

const MEMBERS: Member[] = [
  DEFAULT_MEMBER,
  {
    img: "/img/si/team2.jpg",
    name: "Camille Rousseau",
    role: "Diagnostiqueuse certifiée",
    quote: "Le DPE n'est pas qu'une étiquette : je vous explique concrètement comment améliorer votre bien.",
  },
  {
    img: "/img/si/team3.jpg",
    name: "Thomas Lefèvre",
    role: "Diagnostiqueur certifié",
    quote: "Amiante, plomb, gaz… je traque le moindre risque pour sécuriser votre transaction.",
  },
  {
    img: "/img/si/team4.jpg",
    name: "Laura Petit",
    role: "Chargée de clientèle",
    quote: "Du premier appel à la facture, je m'assure que tout soit simple et rapide pour vous.",
  },
  {
    img: "/img/si/team5.jpg",
    name: "Nicolas Faure",
    role: "Diagnostiqueur certifié",
    quote: "Sur le terrain, la rigueur et la précision priment : votre rapport doit être irréprochable.",
  },
  {
    img: "/img/si/team6.jpg",
    name: "Sarah Benoît",
    role: "Assistante administrative",
    quote: "Je veille à ce que votre dossier soit complet et transmis dans les délais.",
  },
];

/** Section Notre équipe — focus immersif cliquable (v-team-3) — home.html:274-304 */
export function Team() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active: Member = MEMBERS[activeIdx] ?? DEFAULT_MEMBER;

  return (
    <section
      id="equipe"
      className="bg-[color:var(--color-home-bg)] py-9"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">

        {/* En-tête */}
        <Reveal direction="up" className="mb-12 max-w-[680px]">
          <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
            Notre équipe
          </span>
          <h2 className="mt-[14px] font-[family-name:var(--font-sora)] text-[clamp(28px,3.8vw,44px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            Des diagnostiqueurs certifiés et proches de vous
          </h2>
        </Reveal>

        {/* Scène */}
        <div className="grid items-stretch gap-10 md:grid-cols-[1.15fr_.85fr]">

          {/* Photo feature */}
          <Reveal direction="left">
            <article className="h-full">
              <figure className="relative m-0 h-full min-h-[520px] overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(15,30,58,.18)] max-[880px]:min-h-[420px]">
                <Image
                  key={active.img}
                  src={active.img}
                  alt={active.name}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(.22,.61,.36,1)] hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(15,30,58,.94)_0%,rgba(15,30,58,.55)_50%,rgba(15,30,58,0)_100%)] p-9">
                  <span className="mb-[10px] inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-home-saf)]">
                    <AwardIcon className="h-[13px] w-[13px]" aria-hidden />
                    {active.role}
                  </span>
                  <h3 className="mb-[14px] font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,36px)] font-bold text-white">
                    {active.name}
                  </h3>
                  <blockquote className="m-0 max-w-[440px] font-[family-name:var(--font-inter)] text-[17px] italic leading-[1.65] text-white/90">
                    <QuoteIcon
                      className="mr-[6px] inline-block h-4 w-4 flex-none text-[color:var(--color-home-saf)]"
                      aria-hidden
                    />
                    {active.quote}
                  </blockquote>
                </figcaption>
              </figure>
            </article>
          </Reveal>

          {/* Roster */}
          <Reveal direction="right">
            <aside className="flex flex-col">
              <p className="mb-6 border-b border-[color:var(--color-home-line)] pb-6 font-[family-name:var(--font-inter)] text-[16px] leading-[1.7] text-[color:var(--color-home-muted)]">
                Cliquez sur un membre pour découvrir qui veille sur votre dossier.
                Une équipe à taille humaine, certifiée et fidèle, depuis Tours.
              </p>

              <ul className="mb-7 flex flex-1 flex-col gap-[6px] p-0">
                {MEMBERS.map((m, i) => (
                  <li key={m.name}>
                    <button
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={`group flex w-full cursor-pointer items-center gap-4 rounded-[10px] p-3 text-left transition-all duration-[250ms] hover:translate-x-1 hover:bg-[color:var(--color-home-saf-bg)] ${
                        i === activeIdx
                          ? "bg-[color:var(--color-home-saf-bg)] translate-x-1"
                          : ""
                      }`}
                    >
                      <Image
                        src={m.img}
                        alt={m.name}
                        width={400}
                        height={400}
                        loading="lazy"
                        className="h-14 w-14 flex-none rounded-full border-2 border-[color:var(--color-home-bg)] object-cover shadow-[0_2px_8px_rgba(15,30,58,.12)]"
                      />
                      <div className="flex flex-1 flex-col">
                        <strong className="font-[family-name:var(--font-sora)] text-[16px] font-semibold text-[color:var(--color-home-ink)]">
                          {m.name}
                        </strong>
                        <span className="text-[13px] text-[color:var(--color-home-muted)]">
                          {m.role}
                        </span>
                      </div>
                      <ArrowRightIcon
                        className={`h-4 w-4 flex-none transition-all duration-[250ms] ${
                          i === activeIdx
                            ? "translate-x-0 text-[color:var(--color-home-saf-dark)] opacity-100"
                            : "-translate-x-[6px] text-[color:var(--color-home-muted)] opacity-0 group-hover:translate-x-0 group-hover:text-[color:var(--color-home-saf-dark)] group-hover:opacity-100"
                        }`}
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
