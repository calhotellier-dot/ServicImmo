import Image from "next/image";

import { Reveal } from "@/components/marketing/Reveal";

const LOGOS = [
  { src: "/img/logos/bouygues.png", alt: "Bouygues" },
  { src: "/img/logos/orpi.png", alt: "Orpi" },
  { src: "/img/logos/icade.png", alt: "Icade" },
  { src: "/img/logos/sncf.png", alt: "SNCF" },
  { src: "/img/logos/groupama.png", alt: "Groupama" },
  { src: "/img/logos/caisse-epargne.png", alt: "Caisse d'Épargne" },
  { src: "/img/logos/ville-tours.png", alt: "Ville de Tours" },
  { src: "/img/logos/notaires.png", alt: "Chambre des Notaires" },
  { src: "/img/logos/arthur-loyd.png", alt: "Arthur Loyd" },
  { src: "/img/logos/square-habitat.png", alt: "Square Habitat" },
  { src: "/img/logos/advenis.png", alt: "Advenis" },
] as const;

/** Section Nos clients — marquee logos (v-references-2) — home.html:153-187 */
export function ClientsMarquee() {
  return (
    <section
      id="references"
      className="overflow-hidden py-[72px] [background:linear-gradient(180deg,var(--color-home-bg)_0%,var(--color-home-saf-bg)_18%,var(--color-home-saf-bg)_82%,var(--color-home-bg)_100%)]"
    >
      {/* Titre */}
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">
        <Reveal direction="up" className="mb-10 text-center">
          <span className="font-[family-name:var(--font-sora)] text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-home-muted)]">
            Nos clients
          </span>
        </Reveal>
      </div>

      {/* Piste défilante — masque dégradé latéral via [mask-image] */}
      <Reveal direction="up">
        <div className="vr2-marquee relative w-full overflow-hidden py-[14px] [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="vr2-track vr2-track-a inline-flex items-center gap-[56px] whitespace-nowrap [will-change:transform]">
            {/* Jeu 1 */}
            {LOGOS.map(({ src, alt }) => (
              <Image
                key={alt}
                src={src}
                alt={alt}
                width={180}
                height={120}
                loading="lazy"
                className="h-[120px] w-auto object-contain grayscale opacity-55 transition-[filter,opacity] duration-300 hover:grayscale-0 hover:opacity-100"
              />
            ))}
            {/* Jeu 2 (duplicata pour boucle sans couture) */}
            {LOGOS.map(({ src, alt }) => (
              <Image
                key={`${alt}-dup`}
                src={src}
                alt=""
                aria-hidden
                width={180}
                height={120}
                loading="lazy"
                className="h-[120px] w-auto object-contain grayscale opacity-55"
              />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
