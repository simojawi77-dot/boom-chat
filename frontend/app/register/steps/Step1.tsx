"use client";

import { useEffect, useRef } from "react";
import { CalendarDays } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import { calculateAge, getAgeDisplayLabel } from "../registerWizard";
import {
  fieldLabelClassName,
  getFieldControlClassName,
  stepIntroClassName,
} from "../components/formStyles";

export default function Step1() {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<RegisterData>();
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const dateOfBirthField = register("dateOfBirth");

  const dateOfBirth = useWatch({
    control,
    name: "dateOfBirth",
  });

  const currentAge = calculateAge(dateOfBirth);
  const latestAllowedBirthDate = new Date();
  latestAllowedBirthDate.setFullYear(latestAllowedBirthDate.getFullYear() - 14);

  useEffect(() => {
    setValue(
      "age",
      typeof currentAge === "number"
        ? currentAge
        : (undefined as unknown as RegisterData["age"]),
      {
        shouldDirty: false,
        shouldValidate: typeof currentAge === "number",
      },
    );
  }, [currentAge, setValue]);

  const openDatePicker = () => {
    const input = dateInputRef.current;

    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });

    try {
      input.showPicker?.();
    } catch {
      // Some browsers block showPicker outside a trusted user gesture.
    }
  };

  return (
    <div className="space-y-7">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] sm:text-4xl">
          When were you born?
        </h1>

        <p className={stepIntroClassName}>
          Your date of birth helps us personalize your onboarding.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="dateOfBirth" className={fieldLabelClassName}>
            Date of Birth
          </label>

          <div className="relative">
            <input
              type="date"
              id="dateOfBirth" required
              className={`${getFieldControlClassName(Boolean(errors.dateOfBirth))} pr-14`}
              max={latestAllowedBirthDate.toISOString().split("T")[0]}
              {...dateOfBirthField}
              ref={(element) => {
                dateOfBirthField.ref(element);
                dateInputRef.current = element;
              }}
            />

            <button
              type="button"
              aria-label="Open birth date calendar"
              onClick={openDatePicker}
              className="absolute right-2 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--model)] hover:text-[var(--accent)] focus:outline-none focus:ring-3 focus:ring-[color:rgba(185,17,236,0.14)]"
            >
              <CalendarDays size={19} />
            </button>
          </div>

          <FormError message={errors.dateOfBirth?.message} />
          <FormError message={errors.age?.message} />
        </div>

        {typeof currentAge === "number" ? (
          <div className="rounded-2xl border border-[color:rgba(185,17,236,0.14)] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(239,224,250,0.92))] px-4 py-3 shadow-[0_12px_30px_rgba(114,15,234,0.08)] dark:bg-[linear-gradient(135deg,rgba(22,21,22,0.92),rgba(44,18,54,0.94))]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
                  Age detected
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black leading-none text-[var(--text-primary)] sm:text-[2.6rem]">
                    {currentAge}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-secondary)] sm:text-base">
                    {currentAge === 1 ? "year old" : "years old"}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center rounded-full border border-[color:rgba(185,17,236,0.16)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-bold text-[var(--accent)] shadow-sm sm:text-sm">
                {getAgeDisplayLabel(currentAge)}
              </span>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--border-soft)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            Choose your birth date and we&apos;ll reveal your age here instantly.
          </p>
        )}
      </div>
    </div>
  );
}
