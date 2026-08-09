"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import {
  fieldLabelClassName,
  getFieldControlClassName,
  stepIntroClassName,
} from "../components/formStyles";

export default function Step4() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RegisterData>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const password = useWatch({ control, name: "password" }) ?? "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) ?? "";
  const passwordsMatch = Boolean(confirmPassword) && password === confirmPassword;
  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] sm:text-4xl">
          Secure your account
        </h1>
        <p className={stepIntroClassName}>
          Create a strong password to keep your account secure.
        </p>
      </div>

      <div>
        <label htmlFor="password" className={fieldLabelClassName}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            placeholder="Create a strong password" minLength={8} required
            className={`${getFieldControlClassName(Boolean(errors.password))} pr-12`}
            {...passwordField}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--model)] hover:text-[var(--accent)]"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <FormError message={errors.password?.message} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={fieldLabelClassName}>Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm your password" required
            className={`${getFieldControlClassName(Boolean(errors.confirmPassword))} pr-12 ${!errors.confirmPassword && confirmPassword ? (passwordsMatch ? "!border-emerald-500 !ring-2 !ring-emerald-500/15" : "!border-orange-500 !ring-2 !ring-orange-500/15") : ""}`}
            {...confirmPasswordField}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            aria-pressed={showConfirmPassword}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--model)] hover:text-[var(--accent)]"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <FormError message={errors.confirmPassword?.message} />
      </div>
    </div>
  );
}