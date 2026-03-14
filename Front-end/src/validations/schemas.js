import * as yup from "yup";

export const signupSchema = yup.object().shape({
  uname: yup.string()
    .min(7, "Name must contain at least 7 characters")
    .max(50, "Name is too long")
    .required("Full Name is required"),
  uemail: yup.string()
    .email("Invalid email format")
    .required("Email Address is required"),
  upassword: yup.string()
    .min(8, "Password must contain at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
});

export const loginSchema = yup.object().shape({
  uemail: yup.string()
    .email("Invalid email format")
    .required("Email Address is required"),
  upassword: yup.string()
    .min(1, "Password is required")
    .required("Password is required"),
});
