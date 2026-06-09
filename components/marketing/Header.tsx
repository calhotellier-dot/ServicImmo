"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { PhoneIcon, MenuIcon, XIcon } from "lucide-react";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

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
 * Header sticky — fidèle à la maquette home.html (.si-header).
 * Logo image + nav avec underline animé + tel + CTA devis.
 * Burger menu sur mobile (état local).
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const { open: openModal } = useQuoteModal();

  return (
    <header className="sticky top-0 z-[900] border-b border-[color:var(--color-home-line)] bg-white/92 backdrop-blur-[10px] transition-shadow">
      <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-6 px-6 py-[14px] md:px-8">
        {/* Logo */}
        <Link href="/" aria-label="Accueil Servicimmo" className="inline-flex items-center flex-none">
          <Image
            src="/img/logo-servicimmo.png"
            alt="Servicimmo — Diagnostics immobiliers à Tours"
            width={243}
            height={125}
            className="h-[44px] w-auto"
            priority
          />
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
              className="group relative whitespace-nowrap font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-slate)] transition-colors hover:text-[color:var(--color-home-saf-dark)]"
            >
              {link.label}
              <span
                aria-hidden
                className="absolute bottom-[-6px] left-0 h-[2px] w-0 bg-[color:var(--color-home-saf)] transition-[width] duration-[250ms] group-hover:w-full"
              />
            </Link>
          ))}
        </nav>

        {/* Droite : tel + CTA + burger */}
        <div className="flex items-center gap-[18px]">
          <a
            href="tel:0247470123"
            className="hidden items-center gap-[7px] whitespace-nowrap font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] lg:inline-flex"
          >
            <PhoneIcon
              className="h-4 w-4 text-[color:var(--color-home-saf-dark)]"
              aria-hidden
            />
            02 47 47 01 23
          </a>

          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-[6px] bg-[color:var(--color-home-saf)] px-[22px] py-[13px] font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--color-home-slate)] transition-opacity hover:opacity-90"
          >
            Demander un devis
          </button>

          <button
            className="xl:hidden border-none bg-transparent p-1 text-[22px] text-[color:var(--color-home-ink)] cursor-pointer"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Nav mobile */}
      {open && (
        <nav
          aria-label="Navigation mobile"
          className="xl:hidden flex flex-col gap-0 border-b border-[color:var(--color-home-line)] bg-white px-6 pb-[18px] pt-[10px] shadow-[0_18px_40px_rgba(15,30,58,.10)]"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[color:var(--color-home-line)] py-3 font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-slate)] last:border-b-0 hover:text-[color:var(--color-home-saf-dark)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
