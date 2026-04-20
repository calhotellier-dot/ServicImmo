/**
 * Moteur de règles — calcul des diagnostics immobiliers obligatoires.
 *
 * ⚠️ RÈGLES INDICATIVES — À VALIDER AVEC SERVICIMMO AVANT MISE EN PRODUCTION.
 *
 * Source : `QUESTIONNAIRE_FLOW.md` §4 (tableau décisionnel) + décisions de
 * Session 1 :
 *   - Option B pour `permit_date_range === 'unknown'` : on n'assume pas
 *     "le pire cas", on signale via `toClarify`.
 *   - Règles complètes (DAPP en location, Loi Boutin uniquement si vide,
 *     variantes tertiaire / travaux).
 *   - Pas de seuil "sur devis" automatique — tout est fourchette, Servicimmo
 *     affine au devis définitif sous 2h.
 *
 * Fonction pure, pas d'effet de bord, pas d'appel réseau → facilement testable.
 */

import type {
  DiagnosticsResult,
  PermitDateRange,
  PropertyType,
  QuoteFormData,
  RequiredDiagnostic,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Un "logement" = maison, appartement ou immeuble entier.
 * N'inclut PAS les locaux commerciaux, terrains, dépendances, parties communes.
 */
function isLogement(type: PropertyType): boolean {
  return type === "house" || type === "apartment" || type === "building";
}

function isTertiary(type: PropertyType): boolean {
  return type === "commercial";
}

function isPre1997(range: PermitDateRange): boolean {
  return range === "before_1949" || range === "1949_to_1997";
}

/** Code postal 37 → Indre-et-Loire. */
function isIndreEtLoire(postalCode: string): boolean {
  return postalCode.trim().startsWith("37");
}

// ---------------------------------------------------------------------------
// Fonction principale
// ---------------------------------------------------------------------------

export function calculateRequiredDiagnostics(data: QuoteFormData): DiagnosticsResult {
  const required: RequiredDiagnostic[] = [];
  const toClarify: RequiredDiagnostic[] = [];

  // Cas "works" — on ne calcule QUE les diagnostics pré-chantier.
  // Les vente/location se gèrent séparément (si le client a vraiment les 2
  // projets, il fera 2 demandes distinctes — à voir avec Servicimmo).
  if (data.project_type === "works") {
    addWorksDiagnostics(data, required, toClarify);
    return { required, toClarify };
  }

  // Cas "coownership" (gestion syndic) — on a très peu d'info, on propose
  // principalement le DTA (amiante parties communes) et on laisse Servicimmo
  // affiner au RDV.
  if (data.project_type === "coownership") {
    addCoownershipDiagnostics(data, required, toClarify);
    return { required, toClarify };
  }

  // Cas "other" — aucune règle fiable applicable. On retourne un résultat vide,
  // l'équipe Servicimmo traitera à la main.
  if (data.project_type === "other") {
    return { required, toClarify };
  }

  // ---- À partir d'ici : project_type ∈ {'sale', 'rental'} ---------------

  addDPE(data, required);
  addLead(data, required, toClarify);
  addAsbestos(data, required, toClarify);
  addTermites(data, required);
  addGas(data, required, toClarify);
  addElectric(data, required, toClarify);
  addCarrez(data, required);
  addBoutin(data, required);
  addERP(data, required);

  return { required, toClarify };
}

// ---------------------------------------------------------------------------
// Règles — ventes et locations
// ---------------------------------------------------------------------------

function addDPE(data: QuoteFormData, required: RequiredDiagnostic[]): void {
  if (data.project_type !== "sale" && data.project_type !== "rental") return;

  if (isLogement(data.property_type)) {
    required.push({
      id: "dpe",
      name: "DPE — Diagnostic de Performance Énergétique",
      reason:
        data.project_type === "sale"
          ? "Obligatoire pour toute vente de logement."
          : "Obligatoire pour toute location de logement.",
      validityMonths: 120,
    });
    return;
  }

  if (isTertiary(data.property_type)) {
    required.push({
      id: "dpe_tertiary",
      name: "DPE Tertiaire",
      reason: "Obligatoire pour la vente ou location de locaux tertiaires.",
      validityMonths: 120,
    });
  }
}

function addLead(
  data: QuoteFormData,
  required: RequiredDiagnostic[],
  toClarify: RequiredDiagnostic[]
): void {
  if (!isLogement(data.property_type)) return;
  if (data.project_type !== "sale" && data.project_type !== "rental") return;

  const entry: RequiredDiagnostic = {
    id: "lead",
    name: "CREP — Constat de Risque d'Exposition au Plomb",
    reason: "Permis de construire antérieur au 1er janvier 1949.",
    validityMonths: data.project_type === "sale" ? 12 : 72,
  };

  if (data.permit_date_range === "before_1949") {
    required.push(entry);
  } else if (data.permit_date_range === "unknown") {
    // Option B : l'utilisateur ne sait pas → on signale.
    toClarify.push({
      ...entry,
      reason:
        "Date du permis inconnue : si le bien est antérieur à 1949, le CREP sera obligatoire.",
    });
  }
}

function addAsbestos(
  data: QuoteFormData,
  required: RequiredDiagnostic[],
  toClarify: RequiredDiagnostic[]
): void {
  if (data.project_type !== "sale" && data.project_type !== "rental") return;

  const applicable = isLogement(data.property_type) || isTertiary(data.property_type);
  if (!applicable) return;

  if (isPre1997(data.permit_date_range)) {
    if (data.project_type === "sale") {
      required.push({
        id: "asbestos",
        name: "Amiante",
        reason:
          "Permis de construire antérieur au 1er juillet 1997 — diagnostic amiante obligatoire pour la vente.",
        // Illimité si absence d'amiante constatée, sinon 3 ans.
        validityMonths: -1,
      });
    } else {
      // Location : DAPP (logement uniquement, parties privatives)
      if (isLogement(data.property_type)) {
        required.push({
          id: "dapp",
          name: "DAPP — Diagnostic Amiante des Parties Privatives",
          reason: "Location d'un logement pré-1997 : DAPP obligatoire sur les parties privatives.",
          validityMonths: -1,
        });
      }
    }
    return;
  }

  if (data.permit_date_range === "unknown") {
    // Option B
    if (data.project_type === "sale") {
      toClarify.push({
        id: "asbestos",
        name: "Amiante",
        reason:
          "Date du permis inconnue : si le bien est antérieur à juillet 1997, le diagnostic amiante sera obligatoire.",
        validityMonths: -1,
      });
    } else if (isLogement(data.property_type)) {
      toClarify.push({
        id: "dapp",
        name: "DAPP — Amiante parties privatives",
        reason:
          "Date du permis inconnue : si le logement est antérieur à juillet 1997, le DAPP sera obligatoire.",
        validityMonths: -1,
      });
    }
  }
}

function addTermites(data: QuoteFormData, required: RequiredDiagnostic[]): void {
  // Termites : vente uniquement, zone déclarée par arrêté préfectoral.
  // L'Indre-et-Loire (37) est entièrement classée depuis le 27/02/2018.
  if (data.project_type !== "sale") return;
  if (!isIndreEtLoire(data.postal_code)) return;
  // Exclure terrain nu.
  if (data.property_type === "land") return;

  required.push({
    id: "termites",
    name: "État parasitaire — Termites",
    reason: "L'Indre-et-Loire est classée zone à risque termites par arrêté préfectoral.",
    validityMonths: 6,
  });
}

function addGas(
  data: QuoteFormData,
  required: RequiredDiagnostic[],
  toClarify: RequiredDiagnostic[]
): void {
  if (!isLogement(data.property_type)) return;
  if (data.project_type !== "sale" && data.project_type !== "rental") return;
  if (data.gas_installation === "none") return;

  const entry: RequiredDiagnostic = {
    id: "gas",
    name: "État de l'installation Gaz",
    reason: "Installation gaz de plus de 15 ans.",
    validityMonths: data.project_type === "sale" ? 36 : 72,
  };

  if (data.gas_over_15_years === true) {
    required.push(entry);
  } else if (data.gas_over_15_years === null) {
    // Installation déclarée (pas 'none' — déjà écartée ci-dessus) mais âge
    // inconnu → Option B. On distingue 'unknown' (ne sait pas non plus s'il y
    // a une installation) du reste (installation présente, âge inconnu).
    if (data.gas_installation === "unknown") {
      toClarify.push({
        ...entry,
        reason: "Présence et âge de l'installation gaz à vérifier sur place.",
      });
    } else {
      toClarify.push({
        ...entry,
        reason:
          "Âge de l'installation gaz inconnu : si plus de 15 ans, le diagnostic sera obligatoire.",
      });
    }
  }
}

function addElectric(
  data: QuoteFormData,
  required: RequiredDiagnostic[],
  toClarify: RequiredDiagnostic[]
): void {
  if (!isLogement(data.property_type)) return;
  if (data.project_type !== "sale" && data.project_type !== "rental") return;

  const entry: RequiredDiagnostic = {
    id: "electric",
    name: "État de l'installation Électrique",
    reason: "Installation électrique de plus de 15 ans.",
    validityMonths: data.project_type === "sale" ? 36 : 72,
  };

  if (data.electric_over_15_years === true) {
    required.push(entry);
  } else if (data.electric_over_15_years === null) {
    // Option B
    toClarify.push({
      ...entry,
      reason:
        "Âge de l'installation électrique inconnu : si plus de 15 ans, le diagnostic sera obligatoire.",
    });
  }
}

function addCarrez(data: QuoteFormData, required: RequiredDiagnostic[]): void {
  // Loi Carrez : vente d'un lot en copropriété ≥ 8 m² (on ne check pas le seuil 8 m²
  // côté questionnaire, on assume que le client n'a pas un placard à vendre).
  if (data.project_type !== "sale") return;
  if (data.is_coownership !== true) return;
  // Carrez ne concerne pas les terrains ou parties communes.
  if (data.property_type === "land" || data.property_type === "common_areas") {
    return;
  }

  required.push({
    id: "carrez",
    name: "Loi Carrez",
    reason: "Vente d'un lot en copropriété — mesurage Loi Carrez obligatoire.",
    validityMonths: -1,
  });
}

function addBoutin(data: QuoteFormData, required: RequiredDiagnostic[]): void {
  // Loi Boutin : location d'un logement VIDE à usage de résidence principale.
  if (data.project_type !== "rental") return;
  if (!isLogement(data.property_type)) return;
  // Exclure meublé et saisonnier. Le cas "unknown" ne déclenche pas Boutin
  // (on n'assume pas).
  if (data.rental_furnished !== "vide") return;

  required.push({
    id: "boutin",
    name: "Loi Boutin",
    reason: "Location d'un logement vide à usage de résidence principale.",
    validityMonths: -1,
  });
}

function addERP(data: QuoteFormData, required: RequiredDiagnostic[]): void {
  // ERP : toujours obligatoire en vente ou location (y compris terrains et
  // locaux pro). Validité 6 mois.
  if (data.project_type !== "sale" && data.project_type !== "rental") return;

  required.push({
    id: "erp",
    name: "ERP — État des Risques et Pollutions",
    reason:
      "Obligatoire pour toute vente ou location. L'Indre-et-Loire est concernée par plusieurs risques (RGA notamment).",
    validityMonths: 6,
  });
}

// ---------------------------------------------------------------------------
// Règles — projet "works" (travaux / rénovation / démolition)
// ---------------------------------------------------------------------------

function addWorksDiagnostics(
  data: QuoteFormData,
  required: RequiredDiagnostic[],
  toClarify: RequiredDiagnostic[]
): void {
  const asbestosWorks: RequiredDiagnostic = {
    id: "asbestos_works",
    name: "Repérage Amiante avant Travaux (RAT)",
    reason:
      "Tout chantier dans un bâtiment antérieur au 1er juillet 1997 impose un repérage amiante avant travaux.",
    validityMonths: -1,
  };

  const leadWorks: RequiredDiagnostic = {
    id: "lead_works",
    name: "Diagnostic Plomb avant Travaux",
    reason: "Bâtiment antérieur au 1er janvier 1949 : diagnostic plomb avant travaux.",
    validityMonths: -1,
  };

  if (isPre1997(data.permit_date_range)) {
    required.push(asbestosWorks);
  } else if (data.permit_date_range === "unknown") {
    toClarify.push(asbestosWorks);
  }

  if (data.permit_date_range === "before_1949") {
    required.push(leadWorks);
  } else if (data.permit_date_range === "unknown") {
    toClarify.push(leadWorks);
  }
}

// ---------------------------------------------------------------------------
// Règles — projet "coownership" (gestion syndic)
// ---------------------------------------------------------------------------

function addCoownershipDiagnostics(
  data: QuoteFormData,
  required: RequiredDiagnostic[],
  toClarify: RequiredDiagnostic[]
): void {
  // DTA (Diagnostic Technique Amiante des parties communes) si copro pré-1997.
  const dta: RequiredDiagnostic = {
    id: "dta",
    name: "DTA — Diagnostic Technique Amiante des parties communes",
    reason: "Copropriété dont le permis de construire est antérieur au 1er juillet 1997.",
    validityMonths: -1,
  };

  if (isPre1997(data.permit_date_range)) {
    required.push(dta);
  } else if (data.permit_date_range === "unknown") {
    toClarify.push(dta);
  }

  // DPE collectif : pour les copropriétés (> 50 lots depuis 2024, toutes
  // depuis 2025-2026). On n'a pas l'info du nombre de lots → on signale.
  toClarify.push({
    id: "dpe_collective",
    name: "DPE Collectif",
    reason:
      "Obligatoire en copropriété selon le calendrier 2024-2026 (en fonction du nombre de lots).",
    validityMonths: 120,
  });
}
