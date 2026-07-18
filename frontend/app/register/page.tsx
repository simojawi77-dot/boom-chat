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
  getAvatarSource,
  stepFields,
  type RegisterStep,
  TOTAL_STEPS,
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
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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

  const avatarSource = useMemo(
    () => getAvatarSource(age, isPasswordFocused),
    [age, isPasswordFocused],
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
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(submitRegistration)}
            className="w-full overflow-hidden rounded-[2rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-colors duration-300 sm:p-8"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <ProgressIndicator currentStep={step} />

              <button
                type="button"
                onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                className="shrink-0 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] transition duration-200 hover:border-[var(--accent)] focus:outline-none focus:ring-4 focus:ring-[color:rgba(185,17,236,0.16)]"
              >
                {isDarkMode ? "Light" : "Dark"}
              </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-start">
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--model)] p-5">
                <AvatarPreview
                  age={age}
                  imageSource={avatarSource}
                  isPasswordFocused={isPasswordFocused}
                />
              </div>

              <div className="min-h-[420px]">
                {step === 1 && <Step1 />}
                {step === 2 && <Step2 />}
                {step === 3 && (
                  <Step3 onPasswordFocusChange={setIsPasswordFocused} />
                )}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 />}
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={step === 1}
                className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] px-6 py-3 text-base font-bold text-[var(--text-primary)] transition duration-200 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="rounded-2xl bg-[var(--accent)] px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/35 focus:outline-none focus:ring-4 focus:ring-[color:rgba(185,17,236,0.24)]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-2xl bg-[var(--accent)] px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/35 focus:outline-none focus:ring-4 focus:ring-[color:rgba(185,17,236,0.24)]"
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
