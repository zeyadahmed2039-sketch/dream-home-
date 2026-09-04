import { Suspense } from "react";
import type { Metadata } from "next";
import { getProperties } from "@/services/properties";
import { getFavoriteIds } from "@/services/favorites";
import { getSession } from "@/lib/session";
import { PropertyCard } from "@/components/property-card";
import { PropertyCardGridSkeleton } from "@/components/property-card-skeleton";
import { PropertyFilters } from "@/components/properties/filters";
import { SortSelect } from "@/components/properties/sort-select";
import { Pagination } from "@/components/pagination";
import type { PropertyCardData } from "@/types/property";

export const metadata: Metadata = {
  title: "Browse Properties",
  description:
    "Search and filter properties for sale and rent across top locations.",
};

const PAGE_SIZE = 12;

function parseNum(value: string | string[] | undefined): number | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseStr(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}

async function PropertiesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();
  const page = parseNum(searchParams.page) || 1;
  const pageSize = PAGE_SIZE;

  const filters = {
    keyword: parseStr(searchParams.keyword),
    city: parseStr(searchParams.city),
    listingType: parseStr(searchParams.listingType),
    propertyType: parseStr(searchParams.propertyType),
    minPrice: parseNum(searchParams.minPrice),
    maxPrice: parseNum(searchParams.maxPrice),
    minBedrooms: parseNum(searchParams.bedrooms),
    minBathrooms: parseNum(searchParams.bathrooms),
    sort: parseStr(searchParams.sort) || "newest",
    amenities: parseStr(searchParams.amenities)?.split(",").filter(Boolean),
    page,
    pageSize,
  };

  const [{ properties, total, totalPages }, favoriteIds] = await Promise.all([
    getProperties(filters),
    session?.user ? getFavoriteIds(session.user.id) : Promise.resolve([]),
  ]);

  const favSet = new Set(favoriteIds);

  function buildHref(p: number) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined) continue;
      if (Array.isArray(v)) continue;
      if (k === "page") continue;
      q.set(k, v);
    }
    q.set("page", String(p));
    return `/properties?${q.toString()}`;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Browse Properties</h1>
        <p className="text-muted-foreground">
          {total} {total === 1 ? "property" : "properties"} found
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<div className="text-sm">Loading filters…</div>}>
          <PropertyFilters />
        </Suspense>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div />
            <SortSelect defaultValue={filters.sort!} />
          </div>

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
              <h3 className="text-lg font-semibold">No properties found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or searching for a different location.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property as PropertyCardData}
                  isFavorite={favSet.has(property.id)}
                />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
        </div>
      </div>
    </div>
  );
}

export default function PageWrapper({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<PropertyCardGridSkeleton count={8} />}>
      <PropertiesPage searchParams={searchParams} />
    </Suspense>
  );
}
