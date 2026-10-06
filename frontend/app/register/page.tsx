"use client";

import {
  FormProvider,
  SubmitHandler,
  useForm,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser, storeAuthTokens } from "@/lib/api";
import { registerSchema, type RegisterData } from "@/schemas/registerSchema";
import Navbar from "../components/Navbar";
import AvatarPreview from "./components/AvatarPreview";
import ProgressIndicator from "./components/ProgressIndicator";
import {
  calculateAge,
  getAvatarDisplay,
  type RegisterStep,
  TOTAL_STEPS,
  stepFields,
} from "./registerWizard";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";
import Step6 from "./steps/Step6";

const defaultValues: Partial<RegisterData> = {
  dateOfBirth: "",
  age: undefined,
  firstName: "",
  lastName: "",
  city: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
};

const createUniqueUsername = (data: RegisterData) => {
  const baseName =
    `${data.firstName} ${data.lastName}`.trim().replace(/\s+/g, "_") ||
    data.email.split("@")[0] ||
    "user";

  const cleanBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  const shortBase = cleanBase.slice(0, 20) || "user";
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${shortBase}_${suffix}`.slice(0, 30);
};

export default function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    defaultValues,
  });

  const age = useWatch({
    control: form.control,
    name: "age",
  });

  const dateOfBirth = useWatch({
    control: form.control,
    name: "dateOfBirth",
  });

  const effectiveAge =
    typeof age === "number" ? age : calculateAge(dateOfBirth);

  const avatarDisplay = useMemo(
    () => getAvatarDisplay(step, effectiveAge),
    [step, effectiveAge],
  );

  const goToNextStep = async () => {
    const isStepValid = await form.trigger(stepFields[step], {
      shouldFocus: true,
    });

    if (!isStepValid) {
      return;
    }

    setStep(
      (currentStep) => Math.min(currentStep + 1, TOTAL_STEPS) as RegisterStep,
    );
  };

  const goToPreviousStep = () => {
    setStep((currentStep) => Math.max(currentStep - 1, 1) as RegisterStep);
  };

  const submitRegistration: SubmitHandler<RegisterData> = async (data) => {
    setIsSubmitting(true);

    try {
      const username = createUniqueUsername(data);
      const result = await registerUser({
        username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        city: data.city,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
      });

      storeAuthTokens(result);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-dvh bg-(--bg) text-(--text-primary) transition-colors duration-300">
      <Navbar />

      <div className="flex min-h-[calc(100dvh-4rem)] items-center px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <section className="mx-auto flex w-full max-w-7xl items-center justify-center">
          <FormProvider {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(submitRegistration)}
              className="flex w-full flex-col rounded-4xl border border-(--border-soft) bg-(--surface) p-4 shadow-(--shadow-soft) backdrop-blur-xl transition-colors duration-300 sm:p-5 lg:min-h-[min(760px,calc(100dvh-5rem))] lg:p-6"
            >
              <div className="mb-4 shrink-0 sm:mb-5">
                <ProgressIndicator currentStep={step} />
              </div>

              <div className="grid flex-1 min-h-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_300px] lg:items-center xl:grid-cols-[minmax(0,1.35fr)_320px]">
                <div className="order-2 min-h-0 lg:order-1">
                  {step === 1 && <Step1 />}
                  {step === 2 && <Step2 />}
                  {step === 3 && <Step3 />}
                  {step === 4 && <Step4 />}
                  {step === 5 && <Step5 />}
                  {step === 6 && <Step6 />}
                </div>

                <div className="order-1 flex min-h-0 items-center justify-center rounded-4xl border border-(--border-soft) bg-(--model) p-3 sm:p-4 lg:order-2">
                  <AvatarPreview
                    imageSource={avatarDisplay.source}
                    label={avatarDisplay.label}
                  />
                </div>
              </div>

              <div
                className={`mt-5 flex shrink-0 flex-col-reverse gap-3 sm:mt-6 sm:flex-row ${step === 1 ? "sm:justify-end" : "sm:justify-between"}`}
              >
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    aria-label="Go to previous step"
                    className="rounded-2xl border border-(--border-soft) bg-(--surface-strong) px-6 py-3 text-base font-bold text-(--text-primary) transition duration-200 hover:bg-(--border-soft)"
                  >
                    Back
                  </button>
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    aria-label={`Go to step ${step + 1}`}
                    className="rounded-2xl bg-(--accent) px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/40"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    aria-label="Create account"
                    disabled={isSubmitting}
                    className="rounded-2xl bg-(--accent) px-8 py-3 text-base font-black text-white shadow-lg shadow-purple-500/25 transition duration-200 hover:scale-[1.01] hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </section>
      </div>
    </main>
  );
}
