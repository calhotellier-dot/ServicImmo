import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";

import { LogoMark } from "./Logo";

/**
 * Header D3 — logo + tagline + nav 8 items + phone + CTA orange ambré.
 * Note : le design mélange "Accueil / Références / Particuliers / Pros / Amiante /
 * Devis / Actualités / Contact". On mappe sur les routes existantes.
 */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Zones", href: "/zones" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-home-line)] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4 md:px-12">
        <Link href="/" aria-label="Accueil Servicimmo" className="flex items-center gap-2.5">
          <LogoMark />
          <div>
            <div className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-[var(--color-home-ink)]">
              Servicimmo
            </div>
            <div className="text-[11px] leading-none tracking-[0.02em] text-[var(--color-home-muted)]">
              Diagnostics immobiliers · Carottages routiers
            </div>
          </div>
        </Link>

        <nav aria-label="Navigation principale" className="hidden gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] text-[var(--color-home-muted-2)] transition-colors hover:text-[var(--color-home-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+33247470123"
            className="hidden items-center gap-1.5 text-[14px] font-medium text-[var(--color-home-slate)] sm:inline-flex"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden /> 02 47 47 0123
          </a>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-saf)] px-5 py-3 text-[14px] font-semibold text-[var(--color-home-slate)] transition-opacity hover:opacity-90"
          >
            Demander un devis <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}
