import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="bg-[var(--color-home-bg)] py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="relative grid items-center gap-10 overflow-hidden rounded-[24px] bg-[var(--color-home-saf)] p-10 text-[var(--color-home-slate)] md:grid-cols-[1.4fr_1fr] md:p-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-[40%] -right-[8%] h-[480px] w-[480px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(168,115,32,0.15), transparent 70%)",
            }}
          />
          <div className="relative z-[1]">
            <span
              className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold tracking-[0.1em] text-[var(--color-home-slate)] uppercase"
            >
              <span
                aria-hidden
                className="h-[1px] w-[22px] bg-[var(--color-home-slate)]"
              />
              Vous vendez ou louez ?
            </span>
            <h2 className="mt-4 mb-4 text-[36px] leading-[1.05] font-medium tracking-[-0.03em] sm:text-[44px]">
              Demandez un devis gratuit.
            </h2>
            <p className="mb-7 max-w-[38ch] text-[16px] leading-relaxed text-[rgba(30,58,95,0.8)] sm:text-[17px]">
              Notre équipe vous recontacte rapidement pour cadrer votre projet, identifier les
              diagnostics obligatoires et vous transmettre un chiffrage.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--color-home-slate)] px-5 py-3.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Je souhaite être recontacté(e) <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
              <a className="inline-flex items-center gap-2 rounded-[6px] bg-[rgba(30,58,95,0.08)] px-5 py-3.5 text-[14px] text-[var(--color-home-slate)]">
                Espace client
              </a>
            </div>
          </div>

          <div className="relative z-[1] rounded-[14px] bg-[var(--color-home-slate)] p-7 text-white">
            <div className="mb-3 font-mono text-[11px] tracking-[0.08em] text-[var(--color-home-saf)] uppercase">
              Pour toutes informations
            </div>
            <div className="mb-1.5 text-[28px] font-medium tracking-[-0.02em] sm:text-[32px]">
              02 47 47 0123
            </div>
            <div className="mb-5 text-[13px] text-white/60">Lundi au vendredi</div>
            <a
              href="tel:+33247470123"
              className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--color-home-saf)] px-3 py-3 text-[14px] font-semibold text-[var(--color-home-slate)]"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden /> Nous appeler
            </a>
            <div className="relative my-4 text-center font-mono text-[11px] tracking-[0.08em] text-white/50 uppercase before:absolute before:top-1/2 before:left-0 before:h-px before:w-[40%] before:bg-white/15 after:absolute after:top-1/2 after:right-0 after:h-px after:w-[40%] after:bg-white/15">
              ou
            </div>
            <a
              href="mailto:info@servicimmo.fr"
              className="flex w-full items-center justify-center gap-2 rounded-[6px] border border-white/20 px-3 py-3 text-[14px] text-white"
            >
              info@servicimmo.fr
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
