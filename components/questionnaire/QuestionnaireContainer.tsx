"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { QuestionnaireLayout } from "@/components/questionnaire/QuestionnaireLayout";
import { Step1Project } from "@/components/questionnaire/steps/Step1Project";
import { Step2Property } from "@/components/questionnaire/steps/Step2Property";
import { Step3Email } from "@/components/questionnaire/steps/Step3Email";
import { Step4Details } from "@/components/questionnaire/steps/Step4Details";
import { Step5Timeline } from "@/components/questionnaire/steps/Step5Timeline";
import { Step6Recap } from "@/components/questionnaire/steps/Step6Recap";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

const STEP_COMPONENTS = {
  1: Step1Project,
  2: Step2Property,
  3: Step3Email,
  4: Step4Details,
  5: Step5Timeline,
  6: Step6Recap,
} as const;

export function QuestionnaireContainer() {
  const currentStep = useQuestionnaireStore((s) => s.currentStep);
  const [mounted, setMounted] = useState(false);

  // Éviter les rehydrations qui affichent "étape 1" brièvement sur mobile.
  // Pattern classique "hasMounted" — le setState après mount est volontaire
  // et ne crée pas de cascade (état booléen one-shot).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <QuestionnaireLayout currentStep={1}>
        <div className="text-muted-foreground text-sm">Chargement…</div>
      </QuestionnaireLayout>
    );
  }

  const step = STEP_COMPONENTS[currentStep as keyof typeof STEP_COMPONENTS] ?? Step1Project;
  const StepComponent = step;

  return (
    <QuestionnaireLayout currentStep={currentStep}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </QuestionnaireLayout>
  );
}
