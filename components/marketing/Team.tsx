import Image from "next/image";
import { AwardIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

const TEAM_PHOTO = "/img/si/equipe.jpg";

/** Section Notre équipe — photo immersive pleine largeur (une seule photo de groupe). */
export function Team() {
  return (
    <section id="equipe" className="bg-[color:var(--color-home-bg)] py-9">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">

        {/* En-tête */}
        <Reveal direction="up" className="mb-10 max-w-[680px]">
          <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
            Notre équipe
          </span>
          <h2 className="mt-[14px] font-[family-name:var(--font-sora)] text-[clamp(28px,3.8vw,44px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            Des diagnostiqueurs certifiés et proches de vous
          </h2>
        </Reveal>

        {/* Photo immersive pleine largeur */}
        <Reveal direction="up">
          <figure className="relative m-0 h-[clamp(420px,52vw,640px)] overflow-hidden rounded-[24px] shadow-[0_20px_60px_rgba(15,30,58,.18)]">
            <Image
              src={TEAM_PHOTO}
              alt="L'équipe Servicimmo réunie à Tours"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(15,30,58,.94)_0%,rgba(15,30,58,.55)_45%,rgba(15,30,58,0)_100%)] p-9 md:p-12">
              <span className="mb-[12px] inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12px] font-semibold uppercase tracking-[0.06em] text-[color:var(--color-home-saf)]">
                <AwardIcon className="h-[13px] w-[13px]" aria-hidden />
                Certifiés &amp; basés à Tours
              </span>
              <p className="m-0 max-w-[640px] font-[family-name:var(--font-sora)] text-[clamp(20px,2.4vw,30px)] font-bold leading-[1.2] text-white">
                Une équipe à taille humaine, fidèle et rigoureuse — du premier
                appel à la remise de votre rapport.
              </p>
            </figcaption>
          </figure>
        </Reveal>

      </div>
    </section>
  );
}
