import { describe, it, expect } from "vitest";
import {
  cn,
  slugify,
  formatCurrency,
  formatDate,
  getInitials,
  truncate,
} from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Modern Apartment in Austin")).toBe(
      "modern-apartment-in-austin"
    );
  });

  it("removes special characters", () => {
    expect(slugify("Cozy 2-Bedroom! House")).toBe("cozy-2-bedroom-house");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("A  B   C")).toBe("a-b-c");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });
});

describe("formatCurrency", () => {
  it("formats an integer amount as USD", () => {
    expect(formatCurrency(250000)).toBe("$250,000");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const d = formatDate("2024-01-15");
    expect(d).toContain("Jan");
    expect(d).toContain("15");
    expect(d).toContain("2024");
  });
});

describe("getInitials", () => {
  it("returns initials for a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("handles a single word", () => {
    expect(getInitials("Cher")).toBe("C");
  });

  it("returns empty string for empty input", () => {
    expect(getInitials("")).toBe("");
  });
});

describe("truncate", () => {
  it("truncates long strings with an ellipsis", () => {
    const result = truncate("abcdefghij", 5);
    expect(result).toBe("abcde...");
  });

  it("leaves short strings unchanged", () => {
    expect(truncate("abcd", 10)).toBe("abcd");
  });

  it("returns empty string for empty input", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("cn", () => {
  it("merges class names and ignores falsy values", () => {
    expect(cn("a", undefined, "b", false, "c")).toBe("a b c");
  });
});
