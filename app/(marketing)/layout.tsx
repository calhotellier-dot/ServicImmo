import { Footer } from "@/components/marketing/Footer";
import { Header } from "@/components/marketing/Header";

/**
 * Layout des pages marketing : accueil, services, actualités, zones,
 * mentions légales, CGV, contact. Inclut Header (sticky) + Footer D3.
 *
 * Le questionnaire (`app/(public)/devis`) n'utilise PAS ce layout — il a son
 * propre shell focus-friendly (QuestionnaireApp).
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
