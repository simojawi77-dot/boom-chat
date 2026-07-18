"use client";

import { useFormContext } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import {
  fieldHintClassName,
  fieldLabelClassName,
  getFieldControlClassName,
  stepIntroClassName,
} from "../components/formStyles";

export default function Step5() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)]">
          Optional details
        </h1>

        <p className={stepIntroClassName}>
          Add a phone number if you want account recovery by phone.
        </p>
      </div>

      <div>
        <label htmlFor="phone" className={fieldLabelClassName}>
          Phone Number
        </label>

        <input
          type="tel"
          id="phone"
          autoComplete="tel"
          placeholder="06 12 34 56 78"
          className={getFieldControlClassName(Boolean(errors.phone))}
          {...register("phone")}
        />

        <FormError message={errors.phone?.message} />

        <p className={fieldHintClassName}>
          This field is optional. Moroccan mobile numbers can start with 0 or +212.
        </p>
      </div>
    </div>
  );
}
