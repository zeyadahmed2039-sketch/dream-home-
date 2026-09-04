import { type ListingType, type PropertyType } from "@/lib/enums";

// Canonical public URL of the app. Resolution order:
//   1. NEXT_PUBLIC_APP_URL (explicitly configured)
//   2. RENDER_EXTERNAL_URL (auto-provided by Render on web services)
//   3. localhost fallback
export const appUrl: string =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  "http://localhost:3000";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDO", label: "Condo" },
  { value: "VILLA", label: "Villa" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "OFFICE", label: "Office" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

export const POPULAR_LOCATIONS = [
  { city: "New York", state: "NY", image: "/images/cities/newyork.jpg" },
  { city: "Los Angeles", state: "CA", image: "/images/cities/losangeles.jpg" },
  { city: "Miami", state: "FL", image: "/images/cities/miami.jpg" },
  { city: "Chicago", state: "IL", image: "/images/cities/chicago.jpg" },
  { city: "Austin", state: "TX", image: "/images/cities/austin.jpg" },
  { city: "Seattle", state: "WA", image: "/images/cities/seattle.jpg" },
];

export const CITIES = [
  "New York",
  "Los Angeles",
  "Miami",
  "Chicago",
  "Austin",
  "Seattle",
  "San Francisco",
  "Denver",
  "Boston",
  "Atlanta",
];

export const AMENITIES = [
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
];

export const defaultAgentAvatar =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80";

export const placeholders = {
  hero: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1920&q=80",
  about:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
};

export function typeToLabel(t: string): string {
  return t.charAt(0) + t.slice(1).toLowerCase();
}
