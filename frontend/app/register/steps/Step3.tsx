"use client";

import { useFormContext } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import {
  fieldLabelClassName,
  getFieldControlClassName,
  stepIntroClassName,
} from "../components/formStyles";

export default function Step3() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] sm:text-4xl">
          How can we reach you?
        </h1>

        <p className={stepIntroClassName}>
          Add the email address you want to use for your Boom account.
        </p>
      </div>

      <div>
        <label htmlFor="email" className={fieldLabelClassName}>
          Email
        </label>

        <input
          type="email"
          id="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={getFieldControlClassName(Boolean(errors.email))}
          {...register("email")}
        />

        <FormError message={errors.email?.message} />
      </div>
    </div>
  );
}
