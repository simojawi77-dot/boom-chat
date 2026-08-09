import { z } from "zod";

const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const optionalPhone = z
  .string()
  .regex(/^(?:\+212|0)([5-7]\d{8})$/, "Invalid Moroccan phone number")
  .or(z.literal(""))
  .optional();

const isAtLeast14 = (dateOfBirth: string) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasNotPassed =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());

  if (birthdayHasNotPassed) age -= 1;
  return age >= 14;
};

export const registerSchema = z
  .object({
    dateOfBirth: requiredString("Date of birth")
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
      .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future")
      .refine(isAtLeast14, "You must be at least 14 years old"),
    age: z
      .number({ message: "Age is calculated from date of birth" })
      .int()
      .min(14, "You must be at least 14 years old")
      .max(120, "Enter a realistic date of birth"),
    firstName: z.string().trim().min(3, "First name must be at least 3 characters"),
    lastName: z.string().trim().min(3, "Last name must be at least 3 characters"),
    gender: z.enum(["male", "female"]),
    city: requiredString("City"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: requiredString("Confirm password"),
    phone: optionalPhone,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;