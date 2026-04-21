/**
 * Logo composite utilisé dans Header et Footer.
 * Mark « S » sur fond slate avec bande anis en bas.
 */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div
      className="relative grid flex-none place-items-center overflow-hidden rounded-[6px] bg-[var(--color-home-slate)] font-sans font-bold text-white"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.44) }}
    >
      S
      <span
        aria-hidden
        className="absolute right-0 bottom-0 left-0 bg-[var(--color-home-saf)]"
        style={{ height: "32%" }}
      />
    </div>
  );
}
