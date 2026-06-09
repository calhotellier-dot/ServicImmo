import Image from "next/image";
import Link from "next/link";
import { AwardIcon, PhoneIcon, MailIcon, MapPinIcon, ClockIcon, ArrowRightIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

/** Section Contact & devis (v-contact-4) — home.html:361-390 */
export function Contact() {
  return (
    <section
      id="contact"
      className="bg-[color:var(--color-home-bg)] py-[52px]"
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid items-stretch gap-0 overflow-hidden rounded-[24px] shadow-[0_24px_80px_rgba(15,30,58,.16)] md:grid-cols-2">

          {/* ── Colonne visuelle ── */}
          <Reveal direction="left" className="relative min-h-[480px]">
            <div className="relative h-full min-h-[480px]">
              <Image
                src="/img/si/proj3.jpg"
                alt="Intérieur d'un bien immobilier inspecté par Servicimmo"
                fill
                loading="lazy"
                className="object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-[rgba(15,30,58,.55)]" />

              {/* Badge Depuis 1998 */}
              <div className="absolute left-7 top-7 flex items-center gap-3 rounded-[14px] bg-white/12 px-5 py-3 backdrop-blur-sm">
                <AwardIcon className="h-5 w-5 flex-none text-[color:var(--color-home-saf)]" aria-hidden />
                <div>
                  <strong className="block font-[family-name:var(--font-sora)] text-[14px] font-bold text-white">
                    Depuis 1998
                  </strong>
                  <span className="font-[family-name:var(--font-inter)] text-[12px] text-white/80">
                    Diagnostiqueurs certifiés à Tours
                  </span>
                </div>
              </div>

              {/* Chips contact */}
              <div className="absolute bottom-8 left-7 flex flex-col gap-3">
                <Reveal direction="up" delay={0.05}>
                  <a
                    href="tel:0247470123"
                    className="inline-flex items-center gap-[10px] rounded-full bg-white/90 px-5 py-[10px] font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--color-home-ink)] shadow-[0_4px_14px_rgba(15,30,58,.18)] backdrop-blur-sm transition-all hover:bg-white [&_svg]:text-[color:var(--color-home-saf-dark)]"
                  >
                    <PhoneIcon className="h-4 w-4" aria-hidden />
                    02 47 47 01 23
                  </a>
                </Reveal>
                <Reveal direction="up" delay={0.1}>
                  <a
                    href="mailto:info@servicimmo.fr"
                    className="inline-flex items-center gap-[10px] rounded-full bg-white/90 px-5 py-[10px] font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--color-home-ink)] shadow-[0_4px_14px_rgba(15,30,58,.18)] backdrop-blur-sm transition-all hover:bg-white [&_svg]:text-[color:var(--color-home-saf-dark)]"
                  >
                    <MailIcon className="h-4 w-4" aria-hidden />
                    info@servicimmo.fr
                  </a>
                </Reveal>
                <Reveal direction="up" delay={0.15}>
                  <span className="inline-flex items-center gap-[10px] rounded-full bg-white/90 px-5 py-[10px] font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--color-home-ink)] shadow-[0_4px_14px_rgba(15,30,58,.18)] backdrop-blur-sm [&_svg]:text-[color:var(--color-home-saf-dark)]">
                    <MapPinIcon className="h-4 w-4" aria-hidden />
                    58 Rue de la Chevalerie, 37100 Tours
                  </span>
                </Reveal>
              </div>
            </div>
          </Reveal>

          {/* ── Colonne formulaire ── */}
          <Reveal direction="right" className="bg-white">
            <div className="flex h-full flex-col px-9 py-10">
              <span className="mb-3 font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
                Contact
              </span>
              <h2 className="mb-3 font-[family-name:var(--font-sora)] text-[clamp(26px,2.8vw,36px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
                Demandez votre devis gratuit
              </h2>
              <p className="mb-7 font-[family-name:var(--font-inter)] text-[16px] leading-[1.65] text-[color:var(--color-home-muted)]">
                Remplissez ce formulaire, un diagnostiqueur vous recontacte rapidement avec une
                estimation adaptée à votre bien.
              </p>

              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <Reveal direction="up" delay={0.05}>
                  <div className="flex flex-col gap-[6px]">
                    <label
                      htmlFor="c4-nom"
                      className="font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)]"
                    >
                      Nom complet
                    </label>
                    <input
                      id="c4-nom"
                      type="text"
                      placeholder="Jean Dupont"
                      className="rounded-[10px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] text-[color:var(--color-home-ink)] outline-none placeholder:text-[color:var(--color-home-muted)] focus:border-[color:var(--color-home-saf-dark)] focus:ring-2 focus:ring-[color:var(--color-home-saf-bg)]"
                    />
                  </div>
                </Reveal>

                <Reveal direction="up" delay={0.08}>
                  <div className="flex flex-col gap-[6px]">
                    <label
                      htmlFor="c4-mail"
                      className="font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)]"
                    >
                      Adresse e-mail
                    </label>
                    <input
                      id="c4-mail"
                      type="email"
                      placeholder="vous@exemple.fr"
                      className="rounded-[10px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] text-[color:var(--color-home-ink)] outline-none placeholder:text-[color:var(--color-home-muted)] focus:border-[color:var(--color-home-saf-dark)] focus:ring-2 focus:ring-[color:var(--color-home-saf-bg)]"
                    />
                  </div>
                </Reveal>

                <Reveal direction="up" delay={0.11}>
                  <div className="flex flex-col gap-[6px]">
                    <label
                      htmlFor="c4-tel"
                      className="font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)]"
                    >
                      Téléphone
                    </label>
                    <input
                      id="c4-tel"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      className="rounded-[10px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] text-[color:var(--color-home-ink)] outline-none placeholder:text-[color:var(--color-home-muted)] focus:border-[color:var(--color-home-saf-dark)] focus:ring-2 focus:ring-[color:var(--color-home-saf-bg)]"
                    />
                  </div>
                </Reveal>

                <Reveal direction="up" delay={0.14}>
                  <div className="flex flex-col gap-[6px]">
                    <label
                      htmlFor="c4-msg"
                      className="font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)]"
                    >
                      Votre projet
                    </label>
                    <textarea
                      id="c4-msg"
                      rows={3}
                      placeholder="Type de bien, surface, échéance..."
                      className="rounded-[10px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] text-[color:var(--color-home-ink)] outline-none placeholder:text-[color:var(--color-home-muted)] focus:border-[color:var(--color-home-saf-dark)] focus:ring-2 focus:ring-[color:var(--color-home-saf-bg)] resize-none"
                    />
                  </div>
                </Reveal>

                <Reveal direction="up" delay={0.17}>
                  <Link
                    href="/devis"
                    className="mt-1 inline-flex items-center gap-2 rounded-[10px] bg-[color:var(--color-home-saf)] px-6 py-[14px] font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
                  >
                    Commencer mon devis
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </Link>
                </Reveal>
              </form>

              <Reveal direction="up" delay={0.2} className="mt-5">
                <p className="flex items-center gap-2 font-[family-name:var(--font-inter)] text-[13px] text-[color:var(--color-home-muted)]">
                  <ClockIcon className="h-[13px] w-[13px] flex-none text-[color:var(--color-home-saf-dark)]" aria-hidden />
                  Lun-Ven 9h-12h / 14h-19h (18h le vendredi) — Indre-et-Loire (37)
                </p>
              </Reveal>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
