import type { ReactNode } from "react";
import { Sora, Inter, Fredoka } from "next/font/google";

import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { SplashIntro } from "@/components/marketing/SplashIntro";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

/**
 * Layout des pages marketing : accueil, services, actualités, zones,
 * mentions légales, CGV, contact.
 * Injecte les polices Sora / Inter / Fredoka scopées à ce layout.
 * Header sticky + Footer en encadrement de {children}.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${sora.variable} ${inter.variable} ${fredoka.variable} font-[family-name:var(--font-inter)] text-[color:var(--color-home-ink)] [background:var(--color-home-bg)]`}
    >
      <SplashIntro />
      <Header />
      <main className="min-h-[calc(100dvh-3.5rem)] flex-1">{children}</main>
      <Footer />
    </div>
  );
}
