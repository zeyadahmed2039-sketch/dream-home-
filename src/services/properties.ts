import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { PropertyStatus } from "@/lib/enums";
import { Prisma } from "@prisma/client";

export interface PropertyFilters {
  keyword?: string;
  city?: string;
  listingType?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  furnished?: boolean | string;
  amenities?: string[];
  sort?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  status?: PropertyStatus | "ALL";
}

export interface PropertyListResult {
  properties: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PropertyListResult> {
  const {
    keyword,
    city,
    listingType,
    propertyType,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    minArea,
    furnished,
    amenities,
    sort = "newest",
    featured,
    page = 1,
    pageSize = 12,
    status = "ACTIVE",
  } = filters;

  const where: Prisma.PropertyWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (featured !== undefined) {
    where.featured = featured;
  }

  // PostgreSQL `contains` is case-sensitive, so use `mode: "insensitive"` for
  // case-insensitive keyword search in production. SQLite is case-insensitive
  // by default and does not support `mode`, so gate it on the active provider.
  // PostgreSQL `contains` is case-sensitive, so use `mode: "insensitive"` for
  // case-insensitive keyword search in production. SQLite is case-insensitive by
  // default and does not support `mode`, so gate it on the datasource URL.
  const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");
  const caseFilter: Prisma.StringFilter = isPostgres
    ? { mode: Prisma.QueryMode.insensitive }
    : {};

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, ...caseFilter } },
      { description: { contains: keyword, ...caseFilter } },
      { address: { contains: keyword, ...caseFilter } },
      { city: { contains: keyword, ...caseFilter } },
      { state: { contains: keyword, ...caseFilter } },
    ];
  }

  if (city && city !== "all") {
    where.city = { equals: city };
  }

  if (listingType && listingType !== "all") {
    where.listingType = listingType as any;
  }

  if (propertyType && propertyType !== "all") {
    where.propertyType = propertyType as any;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (minBedrooms !== undefined && minBedrooms > 0) {
    where.bedrooms = { gte: minBedrooms };
  }

  if (minBathrooms !== undefined && minBathrooms > 0) {
    where.bathrooms = { gte: minBathrooms };
  }

  if (minArea !== undefined && minArea > 0) {
    where.area = { gte: minArea };
  }

  if (furnished !== undefined && furnished !== "") {
    const f = furnished === true || furnished === "true";
    where.furnished = f;
  }

  if (amenities && amenities.length > 0) {
    where.amenities = {
      some: { amenity: { name: { in: amenities } } },
    };
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = (() => {
    switch (sort) {
      case "price_asc":
        return [{ price: "asc" }];
      case "price_desc":
        return [{ price: "desc" }];
      case "oldest":
        return [{ createdAt: "asc" }];
      case "area_desc":
        return [{ area: "desc" }];
      default:
        return [{ createdAt: "desc" }];
    }
  })();

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        agent: {
          select: {
            id: true,
            name: true,
            avatar: true,
            phone: true,
            email: true,
            bio: true,
          },
        },
        amenities: { include: { amenity: true } },
        _count: { select: { favorites: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPropertyBySlug(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      agent: {
        select: {
          id: true,
          name: true,
          avatar: true,
          phone: true,
          email: true,
          bio: true,
        },
      },
      amenities: { include: { amenity: true }, orderBy: { amenity: { name: "asc" } } },
      favorites: { select: { userId: true } },
    },
  });
}

export async function getSimilarProperties(
  propertyId: string,
  city: string,
  propertyType: string,
  take = 3
) {
  return prisma.property.findMany({
    where: {
      id: { not: propertyId },
      status: "ACTIVE",
      city,
      OR: [{ propertyType: propertyType as any }],
    },
    take,
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      agent: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function listCities() {
  const cities = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: { city: true, state: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return cities;
}

export async function createSlug(title: string): Promise<string> {
  const base = slugify(title) || "property";
  let slug = base;
  let counter = 1;
  while (
    await prisma.property.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}
