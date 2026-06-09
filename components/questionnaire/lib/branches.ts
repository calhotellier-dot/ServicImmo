/**
 * Configuration des 5 branches du parcours devis.
 *
 * Source : handoff Claude Design V2-final (`devis/data.jsx`). Les libellés FR
 * sont verbatim du design. Les icônes sont mappées sur Lucide (déjà en deps).
 */

import {
  Building2Icon,
  HelpCircleIcon,
  HomeIcon,
  KeyRoundIcon,
  PencilIcon,
  type LucideIcon,
} from "lucide-react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

export type BranchConfig = {
  key: ProjectType;
  num: string;
  label: string;
  /** Libellé court, utilisé dans la pill "branche active" en haut du filling. */
  short: string;
  tagline: string;
  stat: string;
  icon: LucideIcon;
  /** Texte pour le badge LABEL en haut à droite de l'illustration style B. */
  badge: string;
};

export const BRANCHES: Record<ProjectType, BranchConfig> = {
  sale: {
    key: "sale",
    num: "01",
    label: "Vente",
    short: "Vente",
    tagline: "Mise en vente d'une maison, appartement ou local.",
    stat: "6 diagnostics en moyenne",
    icon: HomeIcon,
    badge: "VENTE",
  },
  rental: {
    key: "rental",
    num: "02",
    label: "Location",
    short: "Location",
    tagline: "Nouveau bail ou renouvellement de vos diagnostics.",
    stat: "5 diagnostics en moyenne",
    icon: KeyRoundIcon,
    badge: "LOC.",
  },
  works: {
    key: "works",
    num: "03",
    label: "Travaux / Rénovation",
    short: "Travaux",
    tagline: "Repérage amiante et plomb avant chantier.",
    stat: "2 diagnostics ciblés",
    icon: PencilIcon,
    badge: "TRAVAUX",
  },
  coownership: {
    key: "coownership",
    num: "04",
    label: "Gestion copropriété",
    short: "Copropriété",
    tagline: "DTA, DPE collectif, parties communes.",
    stat: "2 diagnostics collectifs",
    icon: Building2Icon,
    badge: "SYNDIC",
  },
  other: {
    key: "other",
    num: "05",
    label: "Autre projet",
    short: "Autre",
    tagline: "Décrivez votre besoin, on vous recontacte.",
    stat: "Étude personnalisée",
    icon: HelpCircleIcon,
    badge: "AUTRE",
  },
};

export const BRANCH_ORDER: ProjectType[] = [
  "sale",
  "rental",
  "works",
  "coownership",
  "other",
];
