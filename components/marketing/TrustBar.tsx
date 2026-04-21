const LOGOS = [
  { role: "Certification", name: "LCC Qualixpert" },
  { role: "Certification", name: "I.Cert" },
  { role: "Assurance RCP", name: "Allianz" },
  { role: "Fédération", name: "FNAIM Diagnostiqueurs" },
  { role: "Partenaire", name: "Optimiz'e Construction" },
];

export function TrustBar() {
  return (
    <section className="border-b border-[var(--color-home-line)] bg-white py-9">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-8 px-6 md:px-12">
        <span className="font-mono text-[11px] tracking-[0.12em] text-[var(--color-home-muted)] uppercase">
          Certifié · Assuré · Fédéré
        </span>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          {LOGOS.map((logo) => (
            <div
              key={logo.name}
              className="flex flex-col gap-0.5 border-l border-[var(--color-home-line)] pl-4"
            >
              <span className="font-mono text-[10px] tracking-[0.06em] text-[var(--color-home-muted)] uppercase">
                {logo.role}
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-home-slate)]">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
