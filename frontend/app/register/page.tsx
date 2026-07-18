"use client";

import { FormProvider, SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { registerSchema, type RegisterData } from "@/schemas/registerSchema";
import AvatarPreview from "./components/AvatarPreview";
import ProgressIndicator from "./components/ProgressIndicator";
import {
  getAvatarDisplay,
  type RegisterStep,
  TOTAL_STEPS,
  stepFields,
  type PasswordAvatarState,
} from "./registerWizard";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";

const defaultValues: Partial<RegisterData> = {
  dateOfBirth: "",
  firstName: "",
  lastName: "",
  city: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
};

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>(1);
  const [passwordState, setPasswordState] = useState<PasswordAvatarState>("open");
  const { resolvedTheme, setTheme } = useTheme();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues,
  });

  const age = useWatch({
    control: form.control,
    name: "age",
  });

  const avatarDisplay = useMemo(
    () => getAvatarDisplay(step, age, passwordState),
    [step, age, passwordState],
  );

  const goToNextStep = async () => {
    const isStepValid = await form.trigger(stepFields[step], {
      shouldFocus: true,
    });

    if (!isStepValid) {
      return;
    }

    setStep((currentStep) => Math.min(currentStep + 1, TOTAL_STEPS) as RegisterStep);
  };

  const goToPreviousStep = () => {
    setStep((currentStep) => Math.max(currentStep - 1, 1) as RegisterStep);
  };

  const submitRegistration: SubmitHandler<RegisterData> = (data) => {
    console.info("Registration data", data);
    toast.success("Registration details are ready to submit.");
  };

  const isDarkMode = resolvedTheme === "dark";

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-8 text-[var(--text-primary)] transition-colors duration-300 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(submitRegistration)}
            className="w-full overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-colors duration-300 sm:p-8"
          >
            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <ProgressIndicator currentStep={step} />

              <button
                type="button"
                onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                className="shrink-0 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] transition duration-200 hover:bg-[var(--model)]"
              >
                {isDarkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-[1fr_250px] lg:items-start">
              {/* Form Content */}
              <div className="order-2 min-h-[420px] lg:order-1">
                {step === 1 && <Step1 />}
                {step === 2 && <Step2 />}
                {step === 3 && <Step3 />}
                {step === 4 && (
                  <Step4 onPasswordAvatarStateChange={setPasswordState} />
                )}
                {step === 5 && <Step5 />}
              </div>

              {/* Avatar Preview */}
              <div className="order-1 rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-5 lg:order-2">
                <AvatarPreview
                  imageSource={avatarDisplay.source}
                  label={avatarDisplay.label}
                />
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={step === 1}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] px-6 py-3 text-base font-bold text-[var(--text-primary)] transition duration-200 hover:bg-[var(--model)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="rounded-2xl bg-[var(--accent)] px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/40"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-2xl bg-[var(--accent)] px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/40"
                >
                  Create Account
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </section>
    </main>
  );
}
