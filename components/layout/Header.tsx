import Link from "next/link";

import { Button } from "@/components/ui/button";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Services", href: "/services" },
  { label: "Zones", href: "/zones" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight"
          aria-label="Accueil Servicimmo"
        >
          Servicimmo
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+33247470123"
            className="text-muted-foreground hidden text-sm font-medium tracking-tight sm:inline"
          >
            02&nbsp;47&nbsp;47&nbsp;01&nbsp;23
          </a>
          <Button asChild size="sm">
            <Link href="/devis">Mon devis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
