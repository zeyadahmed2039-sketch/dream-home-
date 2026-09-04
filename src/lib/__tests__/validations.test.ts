import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  propertySchema,
  inquirySchema,
  viewingSchema,
  changePasswordSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
      role: "USER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords do not match");
    }
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
  });

  it("rejects missing password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "" }).success
    ).toBe(false);
  });
});

describe("propertySchema", () => {
  const base = {
    title: "Beautiful Modern House",
    description: "A spacious and beautifully renovated house in a great neighborhood.",
    listingType: "SALE",
    propertyType: "HOUSE",
    price: 500000,
    address: "123 Main St",
    city: "Austin",
    state: "TX",
    country: "United States",
    bedrooms: 3,
    bathrooms: 2,
    area: 2200,
    amenities: ["Parking"],
    images: ["https://example.com/img.jpg"],
  };

  it("accepts a valid property", () => {
    expect(propertySchema.safeParse(base).success).toBe(true);
  });

  it("rejects a negative price", () => {
    const bad = { ...base, price: -10 };
    expect(propertySchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a listing with no images", () => {
    const bad = { ...base, images: [] };
    expect(propertySchema.safeParse(bad).success).toBe(false);
  });

  it("converts string numbers via coerce", () => {
    const bad = { ...base, price: "500000", bedrooms: "4" };
    const result = propertySchema.safeParse(bad);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(500000);
      expect(result.data.bedrooms).toBe(4);
    }
  });
});

describe("inquirySchema", () => {
  it("accepts a valid inquiry", () => {
    expect(
      inquirySchema.safeParse({
        propertyId: "abc",
        name: "Jane",
        email: "jane@example.com",
        message: "This is a valid message over ten characters",
      }).success
    ).toBe(true);
  });

  it("rejects a short message", () => {
    expect(
      inquirySchema.safeParse({
        propertyId: "abc",
        name: "Jane",
        email: "jane@example.com",
        message: "too short",
      }).success
    ).toBe(false);
  });
});

describe("viewingSchema", () => {
  it("requires date and time", () => {
    expect(
      viewingSchema.safeParse({ propertyId: "abc", date: "", time: "" }).success
    ).toBe(false);
  });

  it("accepts a full schedule", () => {
    expect(
      viewingSchema.safeParse({
        propertyId: "abc",
        date: "2024-05-01",
        time: "10:00",
      }).success
    ).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  it("rejects mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
      confirmNewPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("accepts matching new passwords", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "oldpass123",
        newPassword: "newpass123",
        confirmNewPassword: "newpass123",
      }).success
    ).toBe(true);
  });
});
