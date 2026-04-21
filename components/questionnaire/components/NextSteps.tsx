const STEPS = [
  {
    num: "01",
    title: "Appel téléphonique",
    desc: "Dans les 2 h ouvrées — vérification rapide et confirmation du devis.",
  },
  {
    num: "02",
    title: "Planification",
    desc: "On choisit ensemble un créneau d'intervention qui vous arrange.",
  },
  {
    num: "03",
    title: "Intervention",
    desc: "Notre technicien se présente sur place, diagnostics en 1 à 2 h selon le bien.",
  },
] as const;

export function NextSteps() {
  return (
    <div className="flex flex-col gap-3.5 rounded-[16px] border border-[var(--color-devis-line)] bg-white p-5">
      <div className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-devis-muted)]">
        PROCHAINES ÉTAPES
      </div>
      {STEPS.map((s, i) => (
        <div
          key={s.num}
          className={[
            "flex gap-3.5 pt-1.5",
            i === 0 ? "" : "border-t border-[var(--color-devis-line)]",
          ].join(" ")}
        >
          <div className="mt-1 flex-none font-mono text-[11px] font-semibold text-[var(--branch-fg)]">
            {s.num}
          </div>
          <div>
            <div className="text-[15px] font-medium text-[var(--color-devis-ink)]">{s.title}</div>
            <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--color-devis-muted)]">
              {s.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
