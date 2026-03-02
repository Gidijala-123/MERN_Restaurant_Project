import { z } from "zod";

export const signupSchema = z.object({
  uname: z.string()
    .min(7, "Name must contain at least 7 characters")
    .max(50, "Name is too long"),
  uemail: z.string()
    .email("Invalid email format"),
  upassword: z.string()
    .min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  uemail: z.string()
    .email("Invalid email format"),
  upassword: z.string()
    .min(1, "Password is required"),
});
