"use client";

import { useFormContext } from "react-hook-form";
import FormError from "../../components/FormError";

export default function Step4() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label htmlFor="email">
        Email <span style={{ color: "red" }}>*</span>
      </label>

      <input
        type="email"
        className={`form-control ${
          errors.email ? "is-invalid" : ""
        }`}
        id="email"
        {...register("email")}
      />

      <FormError
        message={errors.email?.message as string}
      />
    </div>
  );
}