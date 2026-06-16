import Image from "next/image";
import { StarIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

const SCATTER = [
  { src: "/img/si/avatar1.jpg", cls: "top-[6%] left-[5%] h-[66px] w-[66px]" },
  { src: "/img/si/team2.jpg",   cls: "top-[30%] left-[16%] h-[52px] w-[52px]" },
  { src: "/img/si/team5.jpg",   cls: "bottom-[12%] left-[9%] h-[66px] w-[66px]" },
  { src: "/img/si/avatar2.jpg", cls: "top-[8%] right-[6%] h-[66px] w-[66px]" },
  { src: "/img/si/team4.jpg",   cls: "top-[32%] right-[16%] h-[52px] w-[52px]" },
  { src: "/img/si/team3.jpg",   cls: "bottom-[12%] right-[8%] h-[66px] w-[66px]" },
] as const;

/** Section témoignages — carte centrée + avatars éparpillés (v-testimonials-1) — home.html:248-272 */
export function Testimonials() {
  return (
    <section
      id="avis"
      className="py-9 [background:linear-gradient(180deg,var(--color-home-bg)_0%,var(--color-home-saf-bg)_18%,var(--color-home-saf-bg)_82%,var(--color-home-bg)_100%)]"
    >
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">

        {/* En-tête */}
        <Reveal direction="up" className="mx-auto mb-10 max-w-[640px] text-center">
          <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
            Ils nous font confiance
          </span>
          <h2 className="mt-[14px] font-[family-name:var(--font-sora)] text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            Ce que disent nos clients
          </h2>
        </Reveal>

        {/* Scène */}
        <div className="relative mx-auto flex min-h-[430px] max-w-[1040px] items-center justify-center max-[880px]:min-h-0 max-[880px]:py-5">

          {/* Avatars éparpillés (aria-hidden, masqués sur mobile) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 max-[880px]:hidden">
            {SCATTER.map(({ src, cls }) => (
              <Image
                key={src}
                src={src}
                alt=""
                width={400}
                height={400}
                loading="lazy"
                className={`absolute rounded-full border-[3px] border-white object-cover opacity-[.95] shadow-[0_4px_14px_rgba(15,30,58,.14)] ${cls}`}
              />
            ))}
          </div>

          {/* Carte centrale */}
          <Reveal direction="zoom" className="relative z-[2] max-w-[620px] px-5 text-center">
            <Image
              src="/img/si/avatar3.jpg"
              alt="Maître Laurent D."
              width={400}
              height={400}
              loading="lazy"
              className="mx-auto mb-[18px] h-[118px] w-[118px] rounded-full border-4 border-white object-cover shadow-[0_8px_32px_rgba(15,30,58,.18)]"
            />

            {/* 5 étoiles */}
            <div className="mb-[18px] flex justify-center gap-[3px] text-[color:var(--color-home-saf)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="h-[15px] w-[15px] fill-current" aria-hidden />
              ))}
            </div>

            <blockquote className="mb-[22px] font-[family-name:var(--font-inter)] text-[21px] italic leading-[1.6] text-[color:var(--color-home-muted)] max-[880px]:text-[17px]">
              &ldquo;Un interlocuteur fiable et réactif pour nos dossiers. Les rapports sont conformes,
              livrés dans les délais, et l&apos;équipe sait gérer les cas complexes. Nous travaillons
              avec eux depuis des années.&rdquo;
            </blockquote>

            <h4 className="mb-1 font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
              Maître Laurent D.
            </h4>
            <span className="font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--color-home-saf-dark)]">
              Notaire, Fondettes
            </span>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
