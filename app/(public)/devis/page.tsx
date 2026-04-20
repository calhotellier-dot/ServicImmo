import type { Metadata } from "next";

import { QuestionnaireContainer } from "@/components/questionnaire/QuestionnaireContainer";

export const metadata: Metadata = {
  title: "Demander mon devis diagnostic — 2 minutes",
  description:
    "Questionnaire intelligent : nous identifions les diagnostics obligatoires pour votre bien et vous donnons une estimation de prix sous 2h ouvrées.",
  robots: { index: false, follow: true }, // on laisse le questionnaire hors index
};

export default function DevisPage() {
  return <QuestionnaireContainer />;
}
