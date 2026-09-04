import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/services/properties";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const pageSize = Math.min(50, Number(sp.get("pageSize")) || 12);

  const result = await getProperties({
    keyword: sp.get("keyword") || undefined,
    city: sp.get("city") || undefined,
    listingType: sp.get("listingType") || undefined,
    propertyType: sp.get("propertyType") || undefined,
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    minBedrooms: sp.get("bedrooms") ? Number(sp.get("bedrooms")) : undefined,
    minBathrooms: sp.get("bathrooms") ? Number(sp.get("bathrooms")) : undefined,
    sort: sp.get("sort") || "newest",
    amenities: sp.get("amenities")?.split(",").filter(Boolean),
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
