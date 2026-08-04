"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { RegisterData } from "@/schemas/registerSchema";
import FormError from "../../components/FormError";
import {
  fieldLabelClassName,
  getFieldControlClassName,
  stepIntroClassName,
} from "../components/formStyles";
import type { PasswordAvatarState } from "../registerWizard";

type Step4Props = {
  onPasswordAvatarStateChange: (state: PasswordAvatarState) => void;
};

const EYE_TRANSITION_MS = 140;

export default function Step4({ onPasswordAvatarStateChange }: Step4Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterData>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");

  const closeAvatarEyes = () => {
    onPasswordAvatarStateChange("half");
    window.setTimeout(
      () => onPasswordAvatarStateChange("closed"),
      EYE_TRANSITION_MS,
    );
  };

  const openAvatarEyes = () => {
    onPasswordAvatarStateChange("half");
    window.setTimeout(
      () => onPasswordAvatarStateChange("open"),
      EYE_TRANSITION_MS,
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword((current) => {
      const next = !current;
      if (next) {
        // Password is visible -> avatar looks away (closes eyes)
        closeAvatarEyes();
      } else {
        // Password is hidden again -> avatar looks back (opens eyes)
        openAvatarEyes();
      }
      return next;
    });
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((current) => {
      const next = !current;
      if (next) {
        closeAvatarEyes();
      } else {
        openAvatarEyes();
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)] sm:text-4xl">
          Secure your account
        </h1>

        <p className={stepIntroClassName}>
          Create a strong password. The avatar will look away while you type.
        </p>
      </div>

      <div>
        <label htmlFor="password" className={fieldLabelClassName}>
          Password
        </label>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            className={`${getFieldControlClassName(Boolean(errors.password))} pr-12`}
            {...passwordField}
            onFocus={closeAvatarEyes}
            onBlur={(event) => {
              passwordField.onBlur(event);
              openAvatarEyes();
            }}
          />

          <button
            type="button"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--model)] hover:text-[var(--accent)]"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <FormError message={errors.password?.message} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={fieldLabelClassName}>
          Confirm Password
        </label>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm your password"
            className={`${getFieldControlClassName(Boolean(errors.confirmPassword))} pr-12`}
            {...confirmPasswordField}
            onFocus={closeAvatarEyes}
            onBlur={(event) => {
              confirmPasswordField.onBlur(event);
              openAvatarEyes();
            }}
          />

          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
            aria-pressed={showConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-secondary)] transition duration-200 hover:bg-[var(--model)] hover:text-[var(--accent)]"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <FormError message={errors.confirmPassword?.message} />
      </div>
    </div>
  );
}
