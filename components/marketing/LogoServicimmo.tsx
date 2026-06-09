/**
 * Logo Servicimmo vectoriel et recolorable (remplace le PNG figé qui rendait
 * mal sur fond sombre). Maison reprise du splash + mot « Servicimmo® » en Fredoka.
 *
 * - `tone="dark"`  : contour + mot en pétrole, pour les fonds CLAIRS.
 * - `tone="light"` : contour + mot en crème, pour les fonds SOMBRES (plus de
 *   boîte blanche dans le footer).
 *
 * La couleur du contour de la maison et du mot suit `currentColor` (piloté par
 * la classe de tonalité) ; les remplissages restent lime quelle que soit la
 * tonalité, pour préserver l'identité. Server Component pur — la taille se règle
 * via `className` (la font-size porte toute l'échelle).
 */

type LogoTone = "dark" | "light";

export function LogoServicimmo({
  tone = "dark",
  withTagline = false,
  className,
}: {
  tone?: LogoTone;
  withTagline?: boolean;
  className?: string;
}) {
  const toneClass =
    tone === "light"
      ? "text-[color:var(--color-si-creme)]"
      : "text-[color:var(--color-si-petrole)]";

  // IDs de gradient distincts par tonalité (évite la collision header/footer)
  const bodyId = `si-logo-body-${tone}`;
  const arrowId = `si-logo-arrow-${tone}`;

  return (
    <span
      className={`inline-flex items-center gap-[0.42em] leading-none ${toneClass} ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 200 200"
        className="h-[1.7em] w-auto flex-none overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E6E900" />
            <stop offset="0.55" stopColor="#C2D400" />
            <stop offset="1" stopColor="#85B600" />
          </linearGradient>
          <radialGradient id={arrowId} cx="0.5" cy="0.3" r="0.85">
            <stop offset="0" stopColor="#FCFFE6" />
            <stop offset="0.5" stopColor="#E7ED82" />
            <stop offset="1" stopColor="#C6D800" />
          </radialGradient>
        </defs>

        {/* Cheminée */}
        <rect
          x="84"
          y="15"
          width="17"
          height="31"
          rx="4"
          fill={`url(#${bodyId})`}
          stroke="currentColor"
          strokeWidth="13"
          strokeLinejoin="round"
        />
        {/* Corps */}
        <path
          d="M100 23 L176 96 L156 96 L156 177 L44 177 L44 96 L24 96 Z"
          fill={`url(#${bodyId})`}
          stroke="currentColor"
          strokeWidth="15"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Flèche intérieure */}
        <path
          d="M104 84 L150 128 L130 128 L130 167 L82 167 L82 128 L58 128 Z"
          fill={`url(#${arrowId})`}
          stroke="currentColor"
          strokeWidth="12"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <span className="inline-flex flex-col leading-none">
        <span className="font-[family-name:var(--font-fredoka)] text-[1em] font-semibold tracking-[-0.01em]">
          Servicimmo
          <sup className="align-super text-[0.4em] opacity-80">®</sup>
        </span>
        {withTagline && (
          <span className="mt-[0.3em] font-[family-name:var(--font-sora)] text-[0.27em] font-semibold uppercase tracking-[0.2em] opacity-75">
            Diagnostics immobiliers
          </span>
        )}
      </span>
    </span>
  );
}
