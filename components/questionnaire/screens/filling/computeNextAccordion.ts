/**
 * Moteur PUR de l'enchaînement automatique des accordéons d'étape (testable,
 * sans React). Quand une étape vient d'être complétée ET qu'elle est l'accordéon
 * ouvert, on ouvre automatiquement le suivant.
 *
 * IMPORTANT — l'étape optionnelle « Diagnostics déjà valides ? » (`existing`)
 * est VOLONTAIREMENT absente de cette chaîne : étant facultative, elle ne doit
 * jamais accaparer ni figer la progression. Elle reste ouvrable d'un clic. Voir
 * le bug d'origine : sa condition d'auto-avance était du code mort (toujours
 * « done »), ce qui bloquait l'ouverture de « Délai » et « Contact ».
 */

export type AccordionKey = "prop" | "tech" | "existing" | "time" | "contact";

/** Étapes requises dont la complétion pilote l'auto-ouverture. */
export type StepDoneFlags = {
  prop: boolean;
  tech: boolean;
  time: boolean;
};

type Transition = {
  done: keyof StepDoneFlags;
  from: AccordionKey;
  to: AccordionKey;
};

// `existing` est sautée : tech complétée → on ouvre directement « time ».
const AUTO_FLOW: readonly Transition[] = [
  { done: "prop", from: "prop", to: "tech" },
  { done: "tech", from: "tech", to: "time" },
  { done: "time", from: "time", to: "contact" },
];

/**
 * Renvoie l'accordéon à ouvrir, ou `null` si aucune transition ne s'applique.
 * Une transition se déclenche seulement quand l'étape passe d'incomplète à
 * complète (`!prev && next`) ET que son accordéon est celui actuellement ouvert.
 */
export function computeNextAccordion(
  prev: StepDoneFlags,
  next: StepDoneFlags,
  open: AccordionKey | null,
): AccordionKey | null {
  for (const t of AUTO_FLOW) {
    if (next[t.done] && !prev[t.done] && open === t.from) return t.to;
  }
  return null;
}
