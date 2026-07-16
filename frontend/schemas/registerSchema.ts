import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    dateOfBirth: z.string(),
    gender: z.enum(["male", "female"]),
    city: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^(?:\+212|0)([5-7]\d{8})$/, "Invalid Moroccan phone number")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
