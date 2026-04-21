import { Actualites } from "@/components/marketing/Actualites";
import { Audiences } from "@/components/marketing/Audiences";
import { Hero } from "@/components/marketing/Hero";
import { ServicesByCategory } from "@/components/marketing/ServicesByCategory";
import { Specialties } from "@/components/marketing/Specialties";
import { TrustBar } from "@/components/marketing/TrustBar";
import { Why } from "@/components/marketing/Why";
import { Zones } from "@/components/marketing/Zones";

/**
 * Page d'accueil Servicimmo — composition des sections Direction 3 du handoff
 * Claude Design. Variantes dev-only du design (TweaksPanel, tone, density,
 * servicesVariant) ne sont pas portées : les défauts sont hardcodés
 * (accent=classic Anis+Navy, tone=warm, density=medium, servicesVariant=table).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Audiences />
      <ServicesByCategory />
      <Why />
      <Specialties />
      <Actualites />
      <Zones />
    </>
  );
}
