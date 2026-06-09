import Image from "next/image";
import Link from "next/link";
import { ZapIcon, WindIcon, BugIcon, ShieldCheckIcon, ClipboardListIcon, ArrowRightIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

type ServiceRow = {
  num: string;
  img: string;
  imgAlt: string;
  tag: string;
  tagIcon: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  desc: string;
  rev?: boolean;
};

const ROWS: ServiceRow[] = [
  {
    num: "01",
    img: "/img/si/proj2.jpg",
    imgAlt: "Immeuble résidentiel évalué pour sa performance énergétique",
    tag: "Obligatoire",
    tagIcon: <ShieldCheckIcon className="h-[13px] w-[13px]" aria-hidden />,
    icon: <ZapIcon className="h-6 w-6" aria-hidden />,
    title: "DPE & performance énergétique",
    desc: "Le Diagnostic de Performance Énergétique établit la classe énergie et climat de votre bien. Il est obligatoire pour toute vente comme pour toute mise en location.",
  },
  {
    num: "02",
    img: "/img/si/proj3.jpg",
    imgAlt: "Intérieur de logement",
    tag: "Avant 1997",
    tagIcon: <WindIcon className="h-[13px] w-[13px]" aria-hidden />,
    icon: <WindIcon className="h-6 w-6" aria-hidden />,
    title: "Amiante & plomb",
    desc: "Repérage amiante avant vente, travaux ou démolition pour les biens d'avant 1997, et Constat de Risque d'Exposition au Plomb (CREP) pour les logements d'avant 1949.",
    rev: true,
  },
  {
    num: "03",
    img: "/img/si/proj1.jpg",
    imgAlt: "Maison individuelle",
    tag: "Indre-et-Loire",
    tagIcon: <BugIcon className="h-[13px] w-[13px]" aria-hidden />,
    icon: <BugIcon className="h-6 w-6" aria-hidden />,
    title: "Termites, gaz & électricité",
    desc: "État parasitaire obligatoire sur tout le département, et contrôle des installations gaz et électricité de plus de 15 ans, exigé en vente comme en location.",
  },
];

/** Section Nos prestations — liste alternée (v-services-2) — home.html:189-246 */
export function Services() {
  return (
    <section
      id="services"
      className="bg-[color:var(--color-home-bg)] py-11"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">

        {/* En-tête */}
        <Reveal direction="up" className="mb-16 max-w-[620px]">
          <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
            Nos prestations
          </span>
          <h2 className="mt-4 mb-4 font-[family-name:var(--font-sora)] text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            Tous vos diagnostics,{" "}
            <em className="not-italic text-[color:var(--color-home-saf-dark)]">un seul interlocuteur</em>
          </h2>
          <p className="m-0 font-[family-name:var(--font-inter)] text-[18px] leading-[1.65] text-[color:var(--color-home-muted)]">
            De l&apos;énergie à la sécurité des installations, nous vous accompagnons sur chaque
            diagnostic réglementaire avec rigueur et pédagogie.
          </p>
        </Reveal>

        {/* Lignes */}
        <div className="flex flex-col gap-9">
          {ROWS.map((row) => (
            <Reveal key={row.num} direction={row.rev ? "right" : "left"}>
              <article
                className={`grid items-center gap-[50px] rounded-[20px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] p-[26px] shadow-[0_2px_12px_rgba(15,30,58,.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(15,30,58,.12)] md:grid-cols-2 ${
                  row.rev ? "[&_.si-media]:order-2 [&_.si-txt]:order-1" : ""
                }`}
              >
                {/* Photo */}
                <div className="si-media relative overflow-hidden rounded-[14px]">
                  <Image
                    src={row.img}
                    alt={row.imgAlt}
                    width={800}
                    height={533}
                    loading="lazy"
                    className="h-[330px] w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-[15px] py-2 font-[family-name:var(--font-sora)] text-[13px] font-semibold text-[color:var(--color-home-ink)] shadow-[0_2px_8px_rgba(15,30,58,.1)] backdrop-blur-sm [&_svg]:text-[color:var(--color-home-saf-dark)]">
                    {row.tagIcon}
                    {row.tag}
                  </span>
                </div>

                {/* Texte */}
                <div className="si-txt relative px-6 py-[10px]">
                  {/* Numéro décoratif */}
                  <span className="pointer-events-none absolute right-6 top-[-6px] z-0 font-[family-name:var(--font-sora)] text-[64px] font-extrabold leading-none text-[#00585f4d]">
                    {row.num}
                  </span>

                  {/* Icône */}
                  <div className="relative z-[1] mb-5 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)]">
                    {row.icon}
                  </div>

                  <h3 className="relative z-[1] mb-[14px] font-[family-name:var(--font-sora)] text-[24px] font-bold text-[color:var(--color-home-ink)]">
                    {row.title}
                  </h3>
                  <p className="relative z-[1] mb-[22px] font-[family-name:var(--font-inter)] text-[16px] leading-[1.7] text-[color:var(--color-home-muted)]">
                    {row.desc}
                  </p>

                  <Link
                    href="/devis"
                    className="relative z-[1] inline-flex items-center gap-[9px] font-[family-name:var(--font-sora)] text-[15px] font-semibold text-[color:var(--color-home-saf-dark)] transition-[gap] hover:gap-[14px]"
                  >
                    Demander un devis
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Pied CTA */}
        <Reveal direction="up" className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-[30px] rounded-[14px] border border-dashed border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] px-[34px] py-[26px]">
            <p className="m-0 flex items-center gap-2 font-[family-name:var(--font-inter)] text-[16px] font-medium text-[color:var(--color-home-ink)]">
              <ClipboardListIcon
                className="h-5 w-5 flex-none text-[color:var(--color-home-saf-dark)]"
                aria-hidden
              />
              Sans oublier l&apos;ERP (État des Risques et Pollutions) et les mesurages
              Loi Carrez &amp; Loi Boutin.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-home-saf)] px-6 py-3.5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
            >
              Obtenir mon devis complet
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
