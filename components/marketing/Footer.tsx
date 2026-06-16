import Link from "next/link";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, AwardIcon, ShieldIcon, BuildingIcon, BadgeIcon, FlaskConicalIcon, FacebookIcon, InstagramIcon, LinkedinIcon } from "lucide-react";

import { LogoServicimmo } from "@/components/marketing/LogoServicimmo";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "À propos", href: "/#apropos" },
  { label: "Nos diagnostics", href: "/services" },
  { label: "Références", href: "/#references" },
  { label: "Notre équipe", href: "/#equipe" },
  { label: "Actualités", href: "/actualites" },
];

const DIAGNOSTICS = [
  { label: "DPE", href: "/services" },
  { label: "Amiante", href: "/services" },
  { label: "Plomb (CREP)", href: "/services" },
  { label: "Termites", href: "/services" },
  { label: "Gaz & Électricité", href: "/services" },
  { label: "ERP & mesurages", href: "/services" },
];

const CERTIFICATIONS = [
  { icon: AwardIcon, label: "LCC Qualixpert" },
  { icon: ShieldIcon, label: "Assuré Allianz" },
  { icon: BuildingIcon, label: "FNAIM Diagnostic" },
  { icon: BadgeIcon, label: "iCert" },
  { icon: FlaskConicalIcon, label: "COFRAC" },
];

/**
 * Footer fidèle à la maquette home.html (.si-footer).
 * 4 colonnes : brand/contact, navigation, diagnostics, certifications.
 */
export function Footer() {
  return (
    <footer className="bg-[color:var(--color-si-petrole)] text-[#c7d2e0]">
      {/* Top */}
      <div className="grid grid-cols-1 gap-10 px-6 pb-14 pt-[84px] sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1.1fr] md:px-10 lg:px-16">
        {/* Colonne 1 : brand */}
        <div>
          <div className="mb-4">
            <LogoServicimmo tone="light" withTagline className="text-[26px]" />
          </div>
          <p className="mb-[22px] max-w-[330px] text-[14.5px] leading-[1.7] text-[#9fb0c4]">
            Cabinet de diagnostic immobilier indépendant à Tours depuis 1998.
            Particuliers, bailleurs, notaires, syndics et collectivités : nous
            sécurisons vos transactions partout en Indre-et-Loire.
          </p>
          <ul className="flex flex-col gap-[11px]">
            <FooterContactItem icon={PhoneIcon} text="02 47 47 01 23" href="tel:0247470123" />
            <FooterContactItem icon={MailIcon} text="info@servicimmo.fr" href="mailto:info@servicimmo.fr" />
            <FooterContactItem icon={MapPinIcon} text="58 Rue de la Chevalerie, 37100 Tours" />
            <FooterContactItem icon={ClockIcon} text="Lun–Ven 9h–12h / 14h–19h (18h le vendredi)" />
          </ul>
        </div>

        {/* Colonne 2 : navigation */}
        <FooterLinkCol title="Navigation" links={NAV_LINKS} />

        {/* Colonne 3 : diagnostics */}
        <FooterLinkCol title="Nos diagnostics" links={DIAGNOSTICS} />

        {/* Colonne 4 : certifications */}
        <div>
          <h4 className="mb-5 font-[family-name:var(--font-sora)] text-[16px] font-semibold tracking-[0.01em] text-white">
            Certifications
          </h4>
          <ul className="flex flex-col gap-[11px]">
            {CERTIFICATIONS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-[11px] text-[14.5px]">
                <Icon
                  className="mt-[1px] h-4 w-4 flex-none text-[color:var(--color-home-saf)]"
                  aria-hidden
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="grid grid-cols-1 items-center gap-3 px-6 py-[22px] text-center md:grid-cols-[1fr_auto_1fr] md:px-10 lg:px-16">
          <p className="m-0 text-[13.5px] text-[#8295ab] md:justify-self-start md:text-left">
            © 2026 Servicimmo
          </p>
          <p className="m-0 text-[13.5px] text-[#8295ab] md:justify-self-center">
            Fait avec passion par{" "}
            <a
              href="https://propulseo-site.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#a9bccf] no-underline transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              Propul&apos;SEO
            </a>
          </p>
          <div className="flex justify-center gap-[10px] md:justify-self-end">
            <SocialLink href="#" icon={FacebookIcon} label="Facebook" />
            <SocialLink href="#" icon={InstagramIcon} label="Instagram" />
            <SocialLink href="#" icon={LinkedinIcon} label="LinkedIn" />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function FooterLinkCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-5 font-[family-name:var(--font-sora)] text-[16px] font-semibold tracking-[0.01em] text-white">
        {title}
      </h4>
      <ul className="flex flex-col gap-[11px]">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[14.5px] text-[#c7d2e0] transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterContactItem({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  text: string;
  href?: string;
}) {
  const inner = (
    <span className="flex items-start gap-[11px] text-[14.5px] text-[#c7d2e0]">
      <Icon
        className="mt-[3px] h-4 w-4 flex-none text-[color:var(--color-home-saf)]"
        aria-hidden
      />
      {text}
    </span>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="transition-colors hover:text-[color:var(--color-home-saf)]">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/[0.08] text-white transition-all hover:bg-[color:var(--color-home-saf)] hover:text-[color:var(--color-home-ink)]"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
