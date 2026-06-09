import { About } from "@/components/marketing/About";
import { Actualites } from "@/components/marketing/Actualites";
import { ClientsMarquee } from "@/components/marketing/ClientsMarquee";
import { Contact } from "@/components/marketing/Contact";
import { Hero } from "@/components/marketing/Hero";
import { Services } from "@/components/marketing/Services";
import { Team } from "@/components/marketing/Team";
import { Testimonials } from "@/components/marketing/Testimonials";

/**
 * Page d'accueil Servicimmo — portage fidèle de home.html (maquette).
 * Sections : Hero (v-hero-3), About (v-about-1), ClientsMarquee (v-references-2),
 * Services (v-services-2), Testimonials (v-testimonials-1), Team (v-team-3),
 * Actualites (v-actualites-1), Contact (v-contact-4).
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <ClientsMarquee />
      <Services />
      <Testimonials />
      <Team />
      <Actualites />
      <Contact />
    </>
  );
}
