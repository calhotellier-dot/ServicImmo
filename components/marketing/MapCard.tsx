/**
 * Carte stylisée de la Touraine affichée dans le Hero.
 *
 * Densité : sparse (4) / medium (7) / dense (10) villes. Valeur hardcodée
 * "medium" dans la composition actuelle de la home.
 */
type MapCardProps = {
  density?: "sparse" | "medium" | "dense";
};

type City = {
  name: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

const CITIES: City[] = [
  { name: "Château-Renault", top: "22%", left: "18%" },
  { name: "Amboise", top: "38%", right: "16%" },
  { name: "Saint-Cyr-sur-Loire", top: "46%", right: "30%" },
  { name: "Azay-le-Rideau", bottom: "34%", left: "16%" },
  { name: "Chinon", bottom: "14%", left: "34%" },
  { name: "Loches", bottom: "20%", right: "20%" },
  { name: "Joué-lès-Tours", top: "62%", left: "48%" },
  { name: "Fondettes", top: "42%", left: "26%" },
  { name: "Chambray-lès-Tours", top: "58%", left: "58%" },
  { name: "Bléré", bottom: "36%", right: "28%" },
];

export function MapCard({ density = "medium" }: MapCardProps) {
  const count = density === "dense" ? 10 : density === "sparse" ? 4 : 7;
  const shown = CITIES.slice(0, count);

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-white text-[var(--color-home-ink)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),0_40px_80px_-40px_rgba(0,0,0,0.3)]">
      <div
        className="relative h-[320px] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--color-home-slate-2) 0%, var(--color-home-slate) 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* SVG routes + perimeter outline */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 280"
          preserveAspectRatio="none"
        >
          <path
            d="M-10 110 Q 80 95, 160 115 T 280 120 Q 340 122, 410 108"
            stroke="rgba(232,163,61,0.38)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-10 115 Q 80 100, 160 120 T 280 125 Q 340 127, 410 113"
            stroke="rgba(232,163,61,0.15)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-10 168 Q 80 160, 150 180 T 280 182 Q 340 184, 410 172"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M-10 210 Q 80 200, 150 215 T 290 218"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 30 52 Q 90 36, 180 46 T 340 56 Q 380 82, 370 152 T 322 240 Q 232 256, 132 240 T 30 180 Q 12 130, 30 52 Z"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
            fill="rgba(255,255,255,0.02)"
            strokeDasharray="2 3"
          />
        </svg>

        {/* Overlay labels */}
        <div className="absolute top-4 right-5 left-5 z-[3] flex justify-between gap-3 font-mono text-[10px] tracking-[0.08em] text-white/55 uppercase">
          <span>Indre-et-Loire · 37</span>
          <span>Tours &amp; Fondettes · toute la Touraine</span>
        </div>

        {/* Pulsing rings around pin */}
        {[120, 220, 320].map((size, i) => (
          <div
            key={size}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-[rgba(232,163,61,0.35)]"
            style={{
              width: size,
              height: size,
              opacity: [1, 0.7, 0.4][i],
            }}
          />
        ))}

        {/* Pin */}
        <div className="absolute top-1/2 left-[45%] z-[2] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-[4px] bg-[var(--color-home-saf)] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-[var(--color-home-slate)]">
            Tours · Fondettes
            <span
              aria-hidden
              className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[var(--color-home-saf)]"
            />
          </div>
          <div
            aria-hidden
            className="h-[14px] w-[14px] rounded-full border-[3px] border-white bg-[var(--color-home-saf)]"
            style={{ animation: "home-ping 2.5s infinite" }}
          />
        </div>

        {/* City labels */}
        {shown.map((city, i) => (
          <div
            key={`${city.name}-${i}`}
            className="absolute flex items-center gap-1.5 text-[11px] text-white/75"
            style={{
              top: city.top,
              left: city.left,
              right: city.right,
              bottom: city.bottom,
            }}
          >
            <span className="h-[5px] w-[5px] rounded-full bg-white/50" />
            {city.name}
          </div>
        ))}
      </div>

      <dl className="p-6">
        {[
          { label: "Cabinet basé à", value: "Tours & Fondettes (37100)" },
          { label: "Zone d'intervention", value: "Toute l'Indre-et-Loire" },
          { label: "Certification", value: "LCC Qualixpert" },
          { label: "Disponibilité", value: "Lundi au vendredi", withDot: true },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-[var(--color-home-line)] py-3 last:border-b-0 last:pb-0"
          >
            <dt className="text-[12px] text-[var(--color-home-muted)]">{row.label}</dt>
            <dd className="flex items-center text-[14px] font-semibold tracking-[-0.01em] text-[var(--color-home-ink)]">
              {row.withDot ? (
                <span
                  aria-hidden
                  className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full bg-emerald-500"
                  style={{ animation: "home-blink 2s infinite" }}
                />
              ) : null}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
