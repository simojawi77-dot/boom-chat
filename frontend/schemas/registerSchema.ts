import { z } from "zod";

const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const optionalPhone = z
  .string()
  .regex(/^(?:\+212|0)([5-7]\d{8})$/, "Invalid Moroccan phone number")
  .or(z.literal(""))
  .optional();

export const registerSchema = z
  .object({
    dateOfBirth: requiredString("Date of birth")
      .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
      .refine((value) => new Date(value) <= new Date(), "Date of birth cannot be in the future"),
    age: z
      .number({
        message: "Age is calculated from date of birth",
      })
      .int()
      .min(0, "Age is calculated from date of birth")
      .max(120, "Enter a realistic date of birth"),
    firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
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
