"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";

// Abonnement no-op utilisé pour le garde SSR via useSyncExternalStore
// (évite setState dans useEffect, conforme React 19 lint).
const subscribeNoop = () => () => {};

/**
 * Splash d'intro Servicimmo — variante `tracedoors`, fond crème.
 * Joue une fois par session (sessionStorage). Respecte prefers-reduced-motion.
 * Renvoie null côté serveur (snapshot serveur = false) pour éviter tout
 * mismatch d'hydratation.
 */
export function SplashIntro() {
  const uid = useId().replace(/:/g, "");

  // Garde SSR : côté serveur snapshot = false, client = true après hydratation
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Durées correspondant aux réglages retenus : duration=5, pause=1.4
  const duration = 5;
  const pause = 1.4;
  const enter = Math.max(0.8, duration * 0.62); // ~3.1s
  const leave = enter * 0.42;                    // ~1.3s
  const hold  = enter + Math.max(0, pause);      // ~4.5s

  // Décision « déjà vu cette session » figée au 1er passage réel : reste stable
  // malgré le double-invoke de React Strict Mode (qui rejouerait sinon
  // sessionStorage et masquerait le splash sans l'animer).
  const seenBeforeRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Tant que `mounted` est false, le composant rend `null` : l'élément du
    // splash n'existe pas encore dans le DOM. Sans cette garde (et sans `mounted`
    // en dépendance), l'effet tournerait une seule fois sur un DOM vide, sortirait
    // aussitôt et ne reposerait jamais le timer → splash figé sur le logo.
    if (!mounted) return;
    const root = document.getElementById("si-splash-root");
    if (!root) return;

    // Lu UNE seule fois par instance : l'avait-on déjà vu AVANT ce montage ?
    if (seenBeforeRef.current === null) {
      seenBeforeRef.current = sessionStorage.getItem("si-splash-seen") === "1";
      sessionStorage.setItem("si-splash-seen", "1");
    }

    if (seenBeforeRef.current) {
      // Déjà vu plus tôt dans la session : cacher immédiatement
      root.style.display = "none";
      return;
    }

    // Première visite : (re)lancer la séquence de sortie
    root.style.display = "";

    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const holdMs = reduce ? 900 : hold * 1000;

    const timer = setTimeout(() => {
      root.classList.add("is-leaving");
      setTimeout(() => {
        root.style.display = "none";
      }, leave * 1000 + 60);
    }, holdMs);

    return () => clearTimeout(timer);
  }, [mounted, hold, leave]);

  // Ne rien rendre côté serveur
  if (!mounted) return null;

  const enterS = `${enter}s`;
  const leaveS = `${leave}s`;
  const stroke = "#00585F";

  return (
    <div
      id="si-splash-root"
      role="status"
      aria-label="Chargement Servicimmo"
      className="si-splash v-tracedoors"
      style={
        {
          "--si-enter": enterS,
          "--si-leave": leaveS,
          "--si-door": "#00585F",
          "--si-seam": "#C6D800",
        } as React.CSSProperties
      }
    >
      {/* Fond crème */}
      <div
        className="si-splash__bg"
        style={{ background: "var(--color-si-creme)" }}
      />

      {/* Porte gauche */}
      <div className="si-splash__door si-splash__door--l" />
      {/* Porte droite */}
      <div className="si-splash__door si-splash__door--r" />

      {/* Logo */}
      <div className="si-splash__logo" style={{ color: stroke }}>
        <svg
          className="si-splash__house"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`si-body-${uid}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0" stopColor="#E6E900" />
              <stop offset="0.55" stopColor="#C2D400" />
              <stop offset="1" stopColor="#85B600" />
            </linearGradient>
            <radialGradient
              id={`si-arrow-${uid}`}
              cx="0.5"
              cy="0.3"
              r="0.85"
            >
              <stop offset="0" stopColor="#FCFFE6" />
              <stop offset="0.5" stopColor="#E7ED82" />
              <stop offset="1" stopColor="#C6D800" />
            </radialGradient>
          </defs>

          {/* Cheminée */}
          <rect
            className="si-p si-chimney"
            pathLength="1"
            x="84"
            y="15"
            width="17"
            height="31"
            rx="4"
            fill={`url(#si-body-${uid})`}
            stroke={stroke}
            strokeWidth="13"
            strokeLinejoin="round"
          />

          {/* Corps de la maison */}
          <path
            className="si-p si-body"
            pathLength="1"
            d="M100 23 L176 96 L156 96 L156 177 L44 177 L44 96 L24 96 Z"
            fill={`url(#si-body-${uid})`}
            stroke={stroke}
            strokeWidth="15"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Flèche intérieure */}
          <path
            className="si-p si-arrow"
            pathLength="1"
            d="M104 84 L150 128 L130 128 L130 167 L82 167 L82 128 L58 128 Z"
            fill={`url(#si-arrow-${uid})`}
            stroke={stroke}
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Texte */}
        <div className="si-splash__word">
          Servicimmo<sup>®</sup>
        </div>
      </div>
    </div>
  );
}
