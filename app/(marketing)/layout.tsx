import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Layout des pages marketing : accueil, services, actualités, zones,
 * mentions légales, CGV, contact. Inclut Header (sticky) + Footer.
 *
 * Note : le questionnaire (`app/(public)/devis`) n'utilise PAS ce layout —
 * il a son propre shell focus-friendly (cf. `QuestionnaireLayout.tsx`).
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100dvh-3.5rem)] flex-1">{children}</main>
      <Footer />
    </>
  );
}
