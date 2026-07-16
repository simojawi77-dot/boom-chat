"use client";

import { useFormContext } from "react-hook-form";
import FormError from "../../components/FormError";

export default function Step2() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div>
      <label htmlFor="dateOfBirth">
        Date of Birth
      </label>

      <input
        type="date"
        id="dateOfBirth"
        className={`w-full rounded-md border p-2 ${
          errors.dateOfBirth
            ? "border-red-500"
            : "border-gray-300"
        }`}
        {...register("dateOfBirth")}
      />

      <FormError
        message={errors.dateOfBirth?.message}
      />


      <label htmlFor="gender">
        Gender <span className="text-red-500">*</span>
      </label>

      <select
        id="gender"
        className={`w-full rounded-md border p-2 ${
          errors.gender
            ? "border-red-500"
            : "border-gray-300"
        }`}
        {...register("gender")}
      >
        <option value="">
          Select Gender
        </option>

        <option value="male">
          Male
        </option>

        <option value="female">
          Female
        </option>
      </select>

      <FormError
        message={errors.gender?.message}
      />


      <label htmlFor="city">
        City <span className="text-red-500">*</span>
      </label>

      <select
        id="city"
        className={`w-full rounded-md border p-2 ${
          errors.city
            ? "border-red-500"
            : "border-gray-300"
        }`}
        {...register("city")}
      >
        <option value="">
          Select City
        </option>

        <option value="fes">
          Fes
        </option>

        <option value="marrakech">
          Marrakech
        </option>

        <option value="casablanca">
          Casablanca
        </option>
      </select>

      <FormError
        message={errors.city?.message}
      />
    </div>
  );
}