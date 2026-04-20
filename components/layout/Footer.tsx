import Link from "next/link";

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Coordonnées */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Servicimmo</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              58 rue de la Chevalerie
              <br />
              37100 Tours
            </p>
            <p className="text-muted-foreground text-sm">
              <a href="tel:+33247470123" className="hover:text-foreground transition-colors">
                02 47 47 01 23
              </a>
            </p>
          </div>

          {/* Horaires */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Horaires</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Lundi - Jeudi : 9h - 12h / 14h - 19h
              <br />
              Vendredi : 9h - 12h / 14h - 18h
            </p>
          </div>

          {/* Liens */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Informations</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground mt-10 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center">
          <span>© {year} Servicimmo — Diagnostic immobilier à Tours depuis 1998</span>
          <span className="text-muted-foreground/70">
            Certifié Qualixpert · Assuré Allianz · Membre FNAIM Diagnostic
          </span>
        </div>
      </div>
    </footer>
  );
}
