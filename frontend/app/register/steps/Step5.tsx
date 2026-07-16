"use client";

import { useFormContext } from "react-hook-form";
import FormError from "../../components/FormError";

export default function Step5() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label htmlFor="phone">
        Phone Number
      </label>

      <input
        type="text"
        className={`form-control ${
          errors.phone ? "is-invalid" : ""
        }`}
        id="phone"
        {...register("phone")}
      />

      <FormError
        message={errors.phone?.message}
      />
    </div>
  );
}