// Canonical application-level enums (stored as String columns in the DB so the
// schema works on both SQLite and PostgreSQL). These replace the Prisma client
// enums and keep strong type safety in the application layer.

export const Role = {
  USER: "USER",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ListingType = {
  SALE: "SALE",
  RENT: "RENT",
} as const;
export type ListingType = (typeof ListingType)[keyof typeof ListingType];

export const PropertyType = {
  HOUSE: "HOUSE",
  APARTMENT: "APARTMENT",
  CONDO: "CONDO",
  VILLA: "VILLA",
  TOWNHOUSE: "TOWNHOUSE",
  OFFICE: "OFFICE",
  LAND: "LAND",
  COMMERCIAL: "COMMERCIAL",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const PropertyStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  REJECTED: "REJECTED",
  SOLD: "SOLD",
  RENTED: "RENTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type PropertyStatus = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export const InquiryStatus = {
  NEW: "NEW",
  READ: "READ",
  REPLIED: "REPLIED",
  CLOSED: "CLOSED",
} as const;
export type InquiryStatus = (typeof InquiryStatus)[keyof typeof InquiryStatus];

export const ViewingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type ViewingStatus = (typeof ViewingStatus)[keyof typeof ViewingStatus];

export const NotificationType = {
  INFO: "INFO",
  SUCCESS: "SUCCESS",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const ReportStatus = {
  OPEN: "OPEN",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ROLES: Role[] = [Role.USER, Role.AGENT, Role.ADMIN];

export function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}
