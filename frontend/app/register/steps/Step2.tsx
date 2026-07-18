"use client";

import { useFormContext } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import {
  fieldLabelClassName,
  getFieldControlClassName,
  stepIntroClassName,
} from "../components/formStyles";

export default function Step2() {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterData>();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)]">
          Tell us about you
        </h1>

        <p className={stepIntroClassName}>
          Add the basics for your profile.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={fieldLabelClassName}>
            First Name
          </label>

          <input
            type="text"
            id="firstName"
            autoComplete="given-name"
            placeholder="Enter your first name"
            className={getFieldControlClassName(Boolean(errors.firstName))}
            {...register("firstName")}
          />

          <FormError message={errors.firstName?.message} />
        </div>

        <div>
          <label htmlFor="lastName" className={fieldLabelClassName}>
            Last Name
          </label>

          <input
            type="text"
            id="lastName"
            autoComplete="family-name"
            placeholder="Enter your last name"
            className={getFieldControlClassName(Boolean(errors.lastName))}
            {...register("lastName")}
          />

          <FormError message={errors.lastName?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gender" className={fieldLabelClassName}>
            Gender
          </label>

          <select
            id="gender"
            className={getFieldControlClassName(Boolean(errors.gender))}
            {...register("gender")}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <FormError message={errors.gender?.message} />
        </div>

        <div>
          <label htmlFor="city" className={fieldLabelClassName}>
            City
          </label>

          <select
            id="city"
            className={getFieldControlClassName(Boolean(errors.city))}
            {...register("city")}
          >
            <option value="">Select city</option>
            <option value="fes">Fes</option>
            <option value="marrakech">Marrakech</option>
            <option value="casablanca">Casablanca</option>
          </select>

          <FormError message={errors.city?.message} />
        </div>
      </div>
    </div>
  );
}
