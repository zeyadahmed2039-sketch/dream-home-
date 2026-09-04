import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || /^[+\d][\d\s-]{6,20}$/.test(v),
        "Invalid phone number"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
    role: z.enum(["USER", "AGENT"]).default("USER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[+\d][\d\s-]{6,20}$/.test(v),
      "Invalid phone number"
    ),
  bio: z.string().max(500).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

export const amenityNames = [
  "Pool",
  "Gym",
  "Parking",
  "Garden",
  "Air Conditioning",
  "Heating",
  "Balcony",
  "Garage",
  "Security",
  "Elevator",
  "Furnished",
  "Pets Allowed",
  "Fireplace",
  "Laundry",
  "Internet",
  "Waterfront",
  "Gated Community",
  "Smart Home",
] as const;

export const propertySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  listingType: z.enum(["SALE", "RENT"]),
  propertyType: z.enum([
    "HOUSE",
    "APARTMENT",
    "CONDO",
    "VILLA",
    "TOWNHOUSE",
    "OFFICE",
    "LAND",
    "COMMERCIAL",
  ]),
  price: z.coerce.number().int().positive("Price must be positive").max(1_000_000_000),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  area: z.coerce.number().int().positive("Area must be positive").max(10_000_000),
  yearBuilt: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  furnished: z.boolean().default(false),
  parking: z.coerce.number().int().min(0).max(100).default(0),
  amenities: z.array(z.string()).default([]),
  images: z
    .array(z.string().url())
    .min(1, "Please add at least one image")
    .max(20),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const inquirySchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const viewingSchema = z.object({
  propertyId: z.string().min(1),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type ViewingInput = z.infer<typeof viewingSchema>;

export const reportSchema = z.object({
  propertyId: z.string().min(1),
  reason: z.string().min(3, "Reason is required").max(200),
  details: z.string().max(2000).optional().or(z.literal("")),
});
