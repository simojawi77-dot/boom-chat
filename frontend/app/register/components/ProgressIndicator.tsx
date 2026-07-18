"use client";

import { stepLabels, TOTAL_STEPS, type RegisterStep } from "../registerWizard";

type ProgressIndicatorProps = {
  currentStep: RegisterStep;
};

const steps = Array.from({ length: TOTAL_STEPS }, (_, index) => (index + 1) as RegisterStep);

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="w-full" aria-label="Registration progress">
      <div className="mb-4 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20">
        Step {currentStep} of {TOTAL_STEPS}
      </div>

      <ol className="grid grid-cols-5 items-start gap-2">
        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <li key={step} className="relative flex flex-col items-center gap-2">
              {step < TOTAL_STEPS && (
                <span
                  className={[
                    "absolute left-1/2 top-5 h-0.5 w-full translate-x-5 rounded-full transition duration-300",
                    isCompleted ? "bg-[var(--accent)]" : "bg-[var(--border-soft)]",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}

              <span
                className={[
                  "relative z-10 grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition duration-300",
                  isCurrent
                    ? "scale-105 border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg shadow-purple-500/25"
                    : "",
                  isCompleted
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border-soft)] bg-[var(--surface-strong)] text-[color:rgba(19,1,28,0.62)] dark:text-[color:rgba(242,229,252,0.72)]",
                ].join(" ")}
              >
                {isCompleted ? <span aria-hidden="true">✓</span> : step}
              </span>

              <span className="hidden max-w-24 text-center text-xs font-semibold text-[color:rgba(19,1,28,0.62)] dark:text-[color:rgba(242,229,252,0.66)] sm:block">
                {stepLabels[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
