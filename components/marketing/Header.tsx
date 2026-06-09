"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PhoneIcon,
  MenuIcon,
  XIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";
import { LogoServicimmo } from "@/components/marketing/LogoServicimmo";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Accueil", href: "/" },
  { label: "Diagnostics", href: "/services" },
  { label: "À propos", href: "/#apropos" },
  { label: "Références", href: "/#references" },
  { label: "Équipe", href: "/#equipe" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
];

/**
 * Header sticky — variante « 2 niveaux » retenue.
 * Bandeau utilitaire pétrole (horaires / certifs / tél) au-dessus d'une barre
 * crème (logo pétrole, nav slate, CTA saf). Ombre douce qui apparaît au scroll.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { open: openModal } = useQuoteModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-[900]">
      {/* Bandeau utilitaire pétrole */}
      <div className="bg-[color:var(--color-si-petrole)] text-[#bfe0e2]">
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-4 px-6 py-[7px] font-[family-name:var(--font-sora)] text-[12.5px] md:px-8">
          <span className="inline-flex items-center gap-[7px]">
            <ClockIcon className="h-[14px] w-[14px]" aria-hidden />
            Lun–Ven 9h–12h / 14h–19h
          </span>
          <span className="hidden items-center gap-[7px] sm:inline-flex">
            <ShieldCheckIcon
              className="h-[14px] w-[14px] text-[color:var(--color-si-lime)]"
              aria-hidden
            />
            Certifié COFRAC · iCert · Assuré Allianz
          </span>
          <a
            href="tel:0247470123"
            className="inline-flex items-center gap-[7px] font-bold text-white transition-colors hover:text-[color:var(--color-si-lime)]"
          >
            <PhoneIcon className="h-[14px] w-[14px]" aria-hidden />
            02 47 47 01 23
          </a>
        </div>
      </div>

      {/* Barre principale crème */}
      <div
        className={`border-b border-[color:var(--color-home-line)] bg-[color:var(--color-si-creme)] backdrop-blur-[10px] transition-shadow ${
          scrolled ? "shadow-[0_8px_26px_rgba(15,30,58,.07)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-6 px-6 py-[14px] md:px-8">
          <Link
            href="/"
            aria-label="Accueil Servicimmo"
            className="inline-flex flex-none items-center"
          >
            <LogoServicimmo tone="dark" className="text-[21px]" />
          </Link>

          {/* Nav desktop */}
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-[26px] xl:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative whitespace-nowrap font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-slate)] transition-colors hover:text-[color:var(--color-si-petrole)]"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute bottom-[-6px] left-0 h-[2px] w-0 bg-[color:var(--color-si-petrole)] transition-[width] duration-[250ms] group-hover:w-full"
                />
              </Link>
            ))}
          </nav>

          {/* Droite : CTA + burger (le tél vit dans le bandeau) */}
          <div className="flex items-center gap-[18px]">
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-[6px] bg-[color:var(--color-home-saf)] px-[22px] py-[13px] font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
            >
              Demander un devis
            </button>

            <button
              className="cursor-pointer border-none bg-transparent p-1 text-[color:var(--color-home-ink)] xl:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Nav mobile */}
      {open && (
        <nav
          aria-label="Navigation mobile"
          className="flex flex-col gap-0 border-b border-[color:var(--color-home-line)] bg-[color:var(--color-si-creme)] px-6 pb-[18px] pt-[10px] text-[color:var(--color-home-slate)] shadow-[0_18px_40px_rgba(15,30,58,.12)] xl:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[color:var(--color-home-line)] py-3 font-[family-name:var(--font-sora)] text-[14.5px] font-semibold last:border-b-0 hover:text-[color:var(--color-si-petrole)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
