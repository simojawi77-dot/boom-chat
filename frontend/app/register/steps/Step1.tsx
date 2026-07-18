"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import { calculateAge } from "../registerWizard";
import {
  fieldHintClassName,
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

  const dateOfBirth = useWatch({
    control,
    name: "dateOfBirth",
  });

  const calculatedAge = calculateAge(dateOfBirth);

  useEffect(() => {
    setValue(
      "age",
      calculatedAge ?? (undefined as unknown as RegisterData["age"]),
      {
        shouldDirty: Boolean(dateOfBirth),
        shouldValidate: Boolean(dateOfBirth),
      },
    );
  }, [calculatedAge, dateOfBirth, setValue]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] sm:text-4xl">
          When were you born?
        </h1>

        <p className={stepIntroClassName}>
          Your date of birth helps us personalize your onboarding. Your age is calculated automatically.
        </p>
      </div>

      <div>
        <label htmlFor="dateOfBirth" className={fieldLabelClassName}>
          Date of Birth
        </label>

        <input
          type="date"
          id="dateOfBirth"
          className={getFieldControlClassName(Boolean(errors.dateOfBirth))}
          max={new Date().toISOString().split("T")[0]}
          {...register("dateOfBirth")}
        />

        <FormError message={errors.dateOfBirth?.message} />
        <FormError message={errors.age?.message} />

        <p className={fieldHintClassName}>
          We never ask you to enter your age manually.
        </p>
      </div>
    </div>
  );
}
