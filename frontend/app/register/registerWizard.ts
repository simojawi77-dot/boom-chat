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
  if (!dateOfBirth) return undefined;

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return undefined;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasNotPassed =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

  if (birthdayHasNotPassed) age -= 1;
  return age >= 0 ? age : undefined;
};

export const getAgeDisplayLabel = (age?: number) => {
  if (typeof age !== "number") return "Age will appear here";
  return age === 1 ? "1 year old" : `${age} years old`;
};

type AvatarStage = {
  maxAge: number;
  label: string;
  source: string;
};

const avatarStages: AvatarStage[] = [
  { maxAge: 1, label: "1 year", source: "/avatars/1year.png" },
  { maxAge: 2, label: "2 years", source: "/avatars/2years.png" },
  { maxAge: 11, label: "11 years", source: "/avatars/11years.png" },
  { maxAge: 18, label: "18 years", source: "/avatars/18years.png" },
  { maxAge: 25, label: "18-25", source: "/avatars/25years.png" },
  { maxAge: Number.POSITIVE_INFINITY, label: "27+", source: "/avatars/27plus.png" },
];

const getTargetAvatarStageIndex = (age?: number) => {
  if (typeof age !== "number") return 0;
  return avatarStages.findIndex((stage) => age <= stage.maxAge);
};

const getStepStageIndex = (step: RegisterStep) =>
  Math.min(step - 1, avatarStages.length - 1);

export const getAvatarDisplay = (step: RegisterStep, age?: number) => {
  const stageIndex = Math.min(getStepStageIndex(step), getTargetAvatarStageIndex(age));
  return avatarStages[stageIndex];
};

export const getAvatarSource = (age?: number): string =>
  getAvatarDisplay(1, age).source;