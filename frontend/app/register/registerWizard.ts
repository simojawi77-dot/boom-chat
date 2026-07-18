import type { RegisterData } from "@/schemas/registerSchema";

export type RegisterStep = 1 | 2 | 3 | 4 | 5 | 6;

export const TOTAL_STEPS = 6;

export const stepLabels: Record<RegisterStep, string> = {
  1: "Birth date",
  2: "Personal details",
  3: "Email",
  4: "Password",
  5: "Optional details",
  6: "Review",
};

export const stepFields: Record<RegisterStep, (keyof RegisterData)[]> = {
  1: ["dateOfBirth", "age"],
  2: ["firstName", "lastName", "gender", "city"],
  3: ["email"],
  4: ["password", "confirmPassword"],
  5: ["phone"],
  6: [],
};

export const calculateAge = (dateOfBirth: string) => {
  if (!dateOfBirth) {
    return undefined;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasNotPassed =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

  if (birthdayHasNotPassed) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
};

export type PasswordAvatarState = "open" | "half" | "closed";

type AvatarStage = {
  maxAge: number;
  label: string;
  source: string;
};

const avatarStages: AvatarStage[] = [
  { maxAge: 1, label: "1 year", source: "/Avatars/1year.png" },
  { maxAge: 2, label: "2 years", source: "/Avatars/2years.png" },
  { maxAge: 11, label: "11 years", source: "/Avatars/11years.png" },
  { maxAge: 18, label: "18 years", source: "/Avatars/18years.png" },
  { maxAge: 25, label: "18-25", source: "/Avatars/25years.png" },
  { maxAge: Number.POSITIVE_INFINITY, label: "27+", source: "/Avatars/27plus.png" },
];

// Get avatar stage index based on age
const getTargetAvatarStageIndex = (age?: number) => {
  if (typeof age !== "number") {
    return 0; // Start from 1year if no age is selected
  }

  return avatarStages.findIndex((stage) => age <= stage.maxAge);
};

// Get avatar stage index based on registration step (progressive growth)
const getStepStageIndex = (step: RegisterStep): number => {
  return Math.min(step - 1, avatarStages.length - 1);
};

export const getAvatarDisplay = (
  step: RegisterStep,
  age?: number,
  passwordState: PasswordAvatarState = "open",
) => {
  const stepStageIndex = getStepStageIndex(step);
  const targetStageIndex = getTargetAvatarStageIndex(age);

  // Select the minimum stage between step stage and age stage
  // Avatar grows with each step but never exceeds the user's age
  const stageIndex = Math.min(stepStageIndex, targetStageIndex);
  const stage = avatarStages[stageIndex];

  // Apply password state only to 18-year stage (Step 4)
  if (stage.maxAge === 18 && step === 4) {
    if (passwordState === "half") {
      return { ...stage, source: "/Avatars/18-half.png" };
    }

    if (passwordState === "closed") {
      return { ...stage, source: "/Avatars/18-close.png" };
    }
  }

  return stage;
};

// Helper function to get avatar source only (for backward compatibility)
export const getAvatarSource = (age?: number): string => {
  // This function is kept for compatibility
  return getAvatarDisplay(1, age).source;
};
