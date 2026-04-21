import { Eyebrow } from "./Hero";

const ZONES_DPE = [
  "DPE Tours",
  "DPE Sainte-Maure-de-Touraine",
  "DPE Chambray-lès-Tours",
  "DPE Luynes",
  "DPE Saint-Pierre-des-Corps",
  "DPE Chinon",
  "DPE Bléré",
  "DPE Joué-lès-Tours",
  "DPE Fondettes",
  "DPE Saint-Cyr-sur-Loire",
  "DPE Château-Renault",
  "DPE Amboise",
  "DPE Azay-le-Rideau",
  "DPE Langeais",
  "DPE commerce Tours",
  "DPE Montlouis-sur-Loire",
  "DPE Loches",
  "DPE Montbazon",
];

const ZONES_DIAG = [
  "Diagnostic Château-Renault",
  "Diagnostic Ligueil",
  "Diagnostic Azay-le-Rideau",
  "Diagnostic Saint-Pierre-des-Corps",
  "Diagnostic Langeais",
  "Amiante avant travaux Tours",
  "Diagnostic Bléré",
  "Diagnostic Amboise",
  "Diagnostic Membrolle-sur-Choisille",
  "Diagnostic Sainte-Maure-de-Touraine",
  "Diagnostic Joué-lès-Tours",
  "Diagnostic Descartes",
  "Diagnostic Chambray-lès-Tours",
  "Diagnostic Fondettes",
  "Diagnostic avant démolition Tours",
  "Diagnostic Luynes",
  "Diagnostic Montbazon",
  "Diagnostic Loches",
  "Diagnostic Saint-Cyr-sur-Loire",
];

const WAVE_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cpath d='M0 100 Q50 60 100 100 T200 100' fill='none' stroke='%23a4c425' stroke-opacity='0.06' stroke-width='1'/%3E%3C/svg%3E\")";

export function Zones() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-home-slate)] py-24 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: WAVE_PATTERN }}
      />
      <div className="relative mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mx-auto mb-14 max-w-[800px] text-center">
          <div className="inline-flex justify-center">
            <Eyebrow onDark>Diagnostic immobilier proche de Tours</Eyebrow>
          </div>
          <h2 className="mx-auto mt-4 mb-4 max-w-[22ch] text-[32px] leading-[1.1] font-medium tracking-[-0.025em] sm:text-[40px]">
            Nos équipes couvrent{" "}
            <em className="font-medium text-[var(--color-home-saf)] not-italic">
              toute l&apos;Indre-et-Loire
            </em>
            .
          </h2>
          <p className="mx-auto max-w-[55ch] text-[16px] leading-relaxed text-white/70">
            Nous intervenons à Tours et Fondettes ainsi que dans l&apos;ensemble du département.
            Quelques-unes des communes où nous sommes régulièrement présents :
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-4 font-mono text-[11px] font-semibold tracking-[0.1em] text-[var(--color-home-saf)] uppercase">
              Diagnostic de performance énergétique
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ZONES_DPE.map((z) => (
                <span
                  key={z}
                  className="rounded-[20px] border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] text-white/80"
                >
                  {z}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-mono text-[11px] font-semibold tracking-[0.1em] text-[var(--color-home-saf)] uppercase">
              Diagnostics &amp; amiante
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ZONES_DIAG.map((z) => (
                <span
                  key={z}
                  className="rounded-[20px] border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] text-white/80"
                >
                  {z}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
