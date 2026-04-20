"use client";

import { Progress } from "@/components/ui/progress";

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <span>
          Étape {currentStep} / {totalSteps}
        </span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} aria-label={`Progression : étape ${currentStep} sur ${totalSteps}`} />
    </div>
  );
}
