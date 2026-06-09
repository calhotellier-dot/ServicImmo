/**
 * Options UI (libellés FR) partagées par les sous-blocs du questionnaire.
 * Déplacées depuis FillingScreen lors du découpage — valeurs inchangées.
 */

export const PROPERTY_TYPE_OPTIONS = [
  { value: "house", label: "Maison" },
  { value: "apartment", label: "Appartement" },
  { value: "building", label: "Immeuble" },
  { value: "commercial", label: "Local commercial" },
  { value: "common_areas", label: "Parties communes" },
  { value: "land", label: "Terrain" },
  { value: "annex", label: "Annexe" },
  { value: "other", label: "Autre" },
] as const;

export const HEATING_OPTIONS = [
  { value: "gas", label: "Gaz" },
  { value: "electric", label: "Électrique" },
  { value: "heat_pump", label: "Pompe à chaleur" },
  { value: "wood", label: "Bois" },
  { value: "fuel", label: "Fioul" },
  { value: "mixed", label: "Mixte" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const HEATING_MODE_OPTIONS = [
  { value: "individual", label: "Individuel" },
  { value: "collective", label: "Collectif" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const ECS_OPTIONS = [
  { value: "same_as_heating", label: "Comme le chauffage" },
  { value: "electric", label: "Ballon électrique" },
  { value: "gas", label: "Gaz" },
  { value: "solar", label: "Solaire" },
  { value: "other", label: "Autre" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const GAS_INSTALLATION_OPTIONS = [
  { value: "none", label: "Pas de gaz" },
  { value: "city_gas", label: "Gaz de ville" },
  { value: "tank", label: "Citerne" },
  { value: "bottles", label: "Bouteilles" },
  { value: "meter_no_contract", label: "Compteur sans contrat" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const COOKTOP_OPTIONS = [
  { value: "souple", label: "Tuyau souple" },
  { value: "rigide", label: "Tuyau rigide" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const RENTAL_FURNISHED_OPTIONS = [
  { value: "vide", label: "Vide" },
  { value: "meuble", label: "Meublé" },
  { value: "saisonnier", label: "Saisonnier" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const WORKS_TYPE_OPTIONS = [
  { value: "renovation", label: "Rénovation" },
  { value: "demolition", label: "Démolition" },
  { value: "voirie", label: "Voirie / enrobés" },
  { value: "other", label: "Autre" },
  { value: "unknown", label: "Je ne sais pas" },
] as const;

export const URGENCY_OPTIONS = [
  { value: "asap", label: "Dès que possible" },
  { value: "week", label: "Dans la semaine" },
  { value: "two_weeks", label: "Sous 2 semaines" },
  { value: "month", label: "Dans le mois" },
  { value: "flexible", label: "Je suis flexible" },
] as const;

export const REFERRAL_OPTIONS = [
  { value: "particulier", label: "Particulier" },
  { value: "agence", label: "Agence" },
  { value: "notaire", label: "Notaire" },
  { value: "syndic", label: "Syndic" },
  { value: "recommandation", label: "Recommandation" },
  { value: "autre", label: "Autre" },
] as const;

export const DEPENDENCIES_OPTIONS = [
  { value: "cave", label: "Cave" },
  { value: "garage", label: "Garage" },
  { value: "atelier", label: "Atelier" },
  { value: "sous_sol", label: "Sous-sol" },
  { value: "combles", label: "Combles" },
] as const;

export const EXISTING_DIAGS_OPTIONS = [
  { value: "dpe", label: "DPE" },
  { value: "asbestos", label: "Amiante" },
  { value: "lead", label: "Plomb" },
  { value: "gas", label: "Gaz" },
  { value: "electric", label: "Électricité" },
  { value: "termites", label: "Termites" },
  { value: "erp", label: "ERP" },
  { value: "carrez", label: "Loi Carrez" },
  { value: "boutin", label: "Loi Boutin" },
] as const;

export const TRISTATE_OPTIONS = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" },
  { value: "dk", label: "Je ne sais pas" },
] as const;

export const TRISTATE_COMPACT_OPTIONS = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" },
  { value: "dk", label: "?" },
] as const;
