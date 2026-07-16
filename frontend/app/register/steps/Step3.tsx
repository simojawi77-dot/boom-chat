"use client";

import { useFormContext } from "react-hook-form";
import FormError from "../../components/FormError";

export default function Step3() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label htmlFor="password">
        Password <span className="text-red-500">*</span>
      </label>

      <input
        type="password"
        id="password"
        className={`w-full rounded-md border p-2 ${
          errors.password
            ? "border-red-500"
            : "border-gray-300"
        }`}
        {...register("password")}
      />

      <FormError
        message={errors.password?.message}
      />


      <label htmlFor="confirmPassword">
        Confirm Password <span className="text-red-500">*</span>
      </label>

      <input
        type="password"
        id="confirmPassword"
        className={`w-full rounded-md border p-2 ${
          errors.confirmPassword
            ? "border-red-500"
            : "border-gray-300"
        }`}
        {...register("confirmPassword")}
      />

      <FormError
        message={errors.confirmPassword?.message}
      />
    </div>
  );
}