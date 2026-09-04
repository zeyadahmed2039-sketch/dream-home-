import type { ListingType, PropertyType, PropertyStatus } from "@/lib/enums";

export interface PropertyAgent {
  id: string;
  name: string;
  avatar: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
}

export interface PropertyImageSummary {
  id: string;
  url: string;
  publicId: string | null;
  sortOrder: number;
}

export interface PropertyAmenitySummary {
  amenity: { id: string; name: string };
}

export interface PropertyCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  area: number;
  yearBuilt: number | null;
  furnished: boolean;
  parking: number;
  featured: boolean;
  images: PropertyImageSummary[];
  amenities?: PropertyAmenitySummary[];
  agent?: PropertyAgent;
  createdAt?: Date;
  _count?: { favorites?: number };
}
