"use client";

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

export default function Step4({ onPasswordAvatarStateChange }: Step4Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterData>();

  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");

  const closeAvatarEyes = () => {
    onPasswordAvatarStateChange("half");
    window.setTimeout(() => onPasswordAvatarStateChange("closed"), 140);
  };

  const openAvatarEyes = () => {
    onPasswordAvatarStateChange("half");
    window.setTimeout(() => onPasswordAvatarStateChange("open"), 140);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black tracking-normal text-[var(--text-primary)]">
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

        <input
          type="password"
          id="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          className={getFieldControlClassName(Boolean(errors.password))}
          {...passwordField}
          onFocus={closeAvatarEyes}
          onBlur={(event) => {
            passwordField.onBlur(event);
            openAvatarEyes();
          }}
        />

        <FormError message={errors.password?.message} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={fieldLabelClassName}>
          Confirm Password
        </label>

        <input
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm your password"
          className={getFieldControlClassName(Boolean(errors.confirmPassword))}
          {...confirmPasswordField}
          onFocus={closeAvatarEyes}
          onBlur={(event) => {
            confirmPasswordField.onBlur(event);
            openAvatarEyes();
          }}
        />

        <FormError message={errors.confirmPassword?.message} />
      </div>
    </div>
  );
}
