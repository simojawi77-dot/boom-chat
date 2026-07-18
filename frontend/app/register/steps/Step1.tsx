"use client";

import { useFormContext } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    register("dateOfBirth").onChange(e);

    if (dateStr) {
      const birthDate = new Date(dateStr);
      if (!Number.isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const birthdayHasNotPassed =
          today.getMonth() < birthDate.getMonth() ||
          (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate());

        if (birthdayHasNotPassed) {
          age -= 1;
        }

        setValue("age", age >= 0 ? age : (undefined as unknown as RegisterData["age"]), {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  };

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
          {...register("dateOfBirth", {
            onChange: handleDateChange,
          })}
        />

        <FormError message={errors.dateOfBirth?.message} />
        <FormError message={errors.age?.message} />

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          We never ask you to enter your age manually.
        </p>
      </div>
    </div>
  );
}
