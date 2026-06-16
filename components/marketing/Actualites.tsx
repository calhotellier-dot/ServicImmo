import Image from "next/image";
import Link from "next/link";
import { BugIcon, ZapIcon, DropletIcon, CalendarIcon, ArrowRightIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

type Article = {
  img: string;
  imgAlt: string;
  tagIcon: React.ReactNode;
  tag: string;
  date: string;
  title: string;
  excerpt: string;
  href: string;
};

const ARTICLES: Article[] = [
  {
    img: "/img/si/blog1.jpg",
    imgAlt: "Amiante avant travaux",
    tagIcon: <BugIcon className="h-3 w-3" aria-hidden />,
    tag: "Amiante",
    date: "Mai 2026",
    title: "Amiante avant travaux : ce que la polémique sur l'indépendance change pour les propriétaires",
    excerpt: "Indépendance des opérateurs, fiabilité des repérages : on fait le point sur ce qui évolue et vos obligations avant le moindre chantier.",
    href: "#",
  },
  {
    img: "/img/si/blog2.jpg",
    imgAlt: "DPE et bail",
    tagIcon: <ZapIcon className="h-3 w-3" aria-hidden />,
    tag: "DPE",
    date: "Avril 2026",
    title: "DPE, reconduction de bail et après travaux : vers de nouvelles obligations ?",
    excerpt: "Renouvellement de location, fin de chantier : zoom sur les cas qui pourraient bientôt exiger un nouveau diagnostic de performance.",
    href: "#",
  },
  {
    img: "/img/si/blog3.jpg",
    imgAlt: "Plomb avant travaux",
    tagIcon: <DropletIcon className="h-3 w-3" aria-hidden />,
    tag: "Plomb",
    date: "Avril 2026",
    title: "Plomb avant travaux : la prévention au cœur de onze affiches",
    excerpt: "Une campagne de sensibilisation rappelle les bons réflexes face au plomb dans le bâti ancien. Ce qu'il faut en retenir.",
    href: "#",
  },
];

/** Section Actualités & conseils (v-actualites-1) — home.html:306-359 */
export function Actualites() {
  return (
    <section
      id="actualites"
      className="py-[52px] [background:linear-gradient(180deg,var(--color-home-bg)_0%,var(--color-home-saf-bg)_18%,var(--color-home-saf-bg)_82%,var(--color-home-bg)_100%)]"
    >
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">

        {/* En-tête */}
        <Reveal direction="up" className="mx-auto mb-14 max-w-[660px] text-center">
          <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
            Veille réglementaire
          </span>
          <h2 className="mt-4 mb-[14px] font-[family-name:var(--font-sora)] text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            Actualités &amp; conseils diagnostic
          </h2>
          <p className="m-0 font-[family-name:var(--font-inter)] text-[17px] leading-[1.7] text-[color:var(--color-home-muted)]">
            On suit la réglementation de près pour vous. Chaque mois, nos experts décryptent les
            nouvelles obligations et leurs conséquences concrètes pour les propriétaires.
          </p>
        </Reveal>

        {/* Grille articles */}
        <div className="grid grid-cols-1 gap-[30px] md:grid-cols-3">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.title} direction="up" delay={i * 0.07}>
              <article className="group flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] shadow-[0_2px_12px_rgba(15,30,58,.06)] transition-all duration-[350ms] hover:-translate-y-2 hover:border-transparent hover:shadow-[0_20px_60px_rgba(15,30,58,.14)]">

                {/* Vignette */}
                <Link href={a.href} className="relative block aspect-[16/10] overflow-hidden">
                  <Image
                    src={a.img}
                    alt={a.imgAlt}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.07]"
                  />
                  <span className="absolute left-[14px] top-[14px] inline-flex items-center gap-[7px] rounded-full bg-white/90 px-[13px] py-[7px] font-[family-name:var(--font-sora)] text-[12px] font-bold tracking-[0.04em] text-[color:var(--color-home-saf-dark)] shadow-[0_2px_8px_rgba(15,30,58,.1)] backdrop-blur-[4px] [&_svg]:text-[color:var(--color-home-saf-dark)]">
                    {a.tagIcon}
                    {a.tag}
                  </span>
                </Link>

                {/* Corps */}
                <div className="flex flex-1 flex-col px-6 py-6">
                  <span className="mb-[13px] inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--color-home-muted)] [&_svg]:text-[color:var(--color-home-saf-dark)]">
                    <CalendarIcon className="h-3 w-3" aria-hidden />
                    {a.date}
                  </span>
                  <h3 className="mb-3 font-[family-name:var(--font-sora)] text-[18.5px] font-bold leading-[1.32] text-[color:var(--color-home-ink)]">
                    <Link
                      href={a.href}
                      className="transition-colors hover:text-[color:var(--color-home-saf-dark)]"
                    >
                      {a.title}
                    </Link>
                  </h3>
                  <p className="mb-5 font-[family-name:var(--font-inter)] text-[14.5px] leading-[1.65] text-[color:var(--color-home-muted)]">
                    {a.excerpt}
                  </p>
                  <Link
                    href={a.href}
                    className="mt-auto inline-flex items-center gap-[9px] font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-saf-dark)] transition-[gap] hover:gap-[14px]"
                  >
                    Lire l&apos;article
                    <ArrowRightIcon className="h-[14px] w-[14px]" aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Pied */}
        <Reveal direction="up" className="mt-[50px] text-center">
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-home-line)] bg-transparent px-6 py-3.5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-all hover:border-[color:var(--color-home-saf)] hover:bg-[color:var(--color-home-saf-bg)]"
          >
            Toutes les actualités
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>

      </div>
    </section>
  );
}
