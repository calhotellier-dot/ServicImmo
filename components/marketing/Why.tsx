import Link from "next/link";

import { Eyebrow } from "./Hero";

const BULLETS = [
  "Un seul métier, fait sérieusement — ni gestion locative, ni transaction",
  "Veille réglementaire publique depuis 2017, 100+ articles de fond",
  "Équipe locale, pas de sous-traitance — le technicien signe son rapport",
  "Ancrage Indre-et-Loire : Tours, Chinon, Amboise, Loches, Azay-le-Rideau…",
];

export function Why() {
  return (
    <section className="bg-[var(--color-home-bg)] py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid overflow-hidden rounded-[24px] border border-[var(--color-home-line)] bg-white shadow-[0_20px_60px_-30px_rgba(13,26,36,0.15)] md:grid-cols-[1fr_1.3fr]">
          <div
            className="relative flex min-h-[440px] flex-col justify-between overflow-hidden p-14 text-white"
            style={{
              background:
                "linear-gradient(160deg, var(--color-home-saf) 0%, var(--color-home-saf-dark) 100%)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-12 -right-12 h-[200px] w-[200px] rounded-full bg-white/10"
            />
            <div>
              <div className="relative font-semibold text-[96px] leading-[0.9] tracking-[-0.045em] sm:text-[120px]">
                1998
              </div>
              <div className="relative mt-2.5 font-mono text-[12px] tracking-[0.08em] text-white/85 uppercase">
                Cabinet créé à Tours
              </div>
            </div>
            <div className="relative border-t border-white/30 pt-5">
              <span className="mb-1.5 block font-mono text-[11px] tracking-[0.08em] text-white/85 uppercase">
                Aujourd&apos;hui
              </span>
              <b className="text-[24px] font-semibold tracking-[-0.02em]">
                10 000+ diagnostics délivrés
              </b>
            </div>
          </div>

          <div className="p-14">
            <Eyebrow>Notre histoire</Eyebrow>
            <h2 className="mt-3.5 mb-4 max-w-[22ch] text-[30px] leading-[1.1] font-medium tracking-[-0.025em] text-[var(--color-home-ink)] sm:text-[36px]">
              Servicimmo, cabinet{" "}
              <em className="font-medium text-[var(--color-home-saf-dark)] not-italic">
                indépendant
              </em>{" "}
              depuis bientôt trente ans.
            </h2>
            <p className="mb-5 max-w-[55ch] text-[16px] leading-relaxed text-[var(--color-home-muted-2)]">
              Basés à Tours depuis 1998, nous intervenons en Indre-et-Loire et départements
              limitrophes. Certifiés Qualixpert et I.Cert, assurés Allianz, membres de la FNAIM
              Diagnostic.
            </p>
            <ul className="grid gap-3">
              {BULLETS.map((b) => (
                <li
                  key={b}
                  className="relative pl-6 text-[14px] leading-relaxed text-[var(--color-home-ink)] before:absolute before:top-0 before:left-0 before:font-semibold before:text-[var(--color-home-saf-dark)] before:content-['→']"
                >
                  {b}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-saf)] px-5 py-3.5 text-[14px] font-semibold text-[var(--color-home-slate)] transition-opacity hover:opacity-90"
              >
                Demander un devis
              </Link>
              <a className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-slate)] px-5 py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90">
                Voir nos références
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
