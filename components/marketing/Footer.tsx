import { LogoMark } from "./Logo";

const COL_SERVICES = [
  "Actualités",
  "Promotion du moment",
  "Paiement en ligne",
  "Secteur d'intervention",
  "Témoignages clients",
  "Demande de devis",
];

const COL_PROS = [
  "Attestation RT 2012",
  "DPE Neuf",
  "DPE collectif",
  "DPE mention tertiaire",
  "État des lieux",
];

const COL_AMIANTE = [
  "DTA · Diagnostic Technique Amiante",
  "Diagnostics av. travaux / démol.",
  "Amiante et HAP enrobés",
  "Constat visuel après travaux",
  "Mesures d'empoussièrement",
];

const BADGES = ["Qualixpert", "I.Cert", "Allianz", "FNAIM", "Optimiz'e"];

export function Footer() {
  return (
    <footer className="bg-[var(--color-home-ink)] pt-16 pb-7 text-white/70">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <LogoMark />
              <div className="text-[18px] font-semibold text-white">Servicimmo</div>
            </div>
            <p className="mb-4 max-w-[32ch] text-[14px] leading-relaxed text-white/55">
              58 Rue de la Chevalerie
              <br />
              37100 TOURS
              <br />
              02 47 47 0123
              <br />
              info[at]servicimmo.fr
              <br />
              Lundi au vendredi
            </p>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-[rgba(164,196,37,0.12)] px-2.5 py-1 font-mono text-[11px] text-[var(--color-home-saf)]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          <FooterCol title="Services" items={COL_SERVICES} />
          <FooterCol title="Professionnels" items={COL_PROS} />
          <FooterCol title="Amiante" items={COL_AMIANTE} />
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[12px] text-white/40 sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} Servicimmo · Diagnostics immobiliers &amp; Carottages
            routiers
          </span>
          <span>Mentions légales · Politique de confidentialité</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-4 font-mono text-[12px] font-semibold tracking-[0.1em] text-[var(--color-home-saf)] uppercase">
        {title}
      </h4>
      <ul className="flex flex-col gap-1">
        {items.map((it) => (
          <li key={it}>
            <a className="inline-block py-1 text-[14px] text-white/60 transition-colors hover:text-[var(--color-home-saf)]">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
