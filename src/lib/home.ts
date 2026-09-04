import { prisma } from "@/lib/prisma";
import type { PropertyCardData } from "@/types/property";

export interface HomeData {
  featured: PropertyCardData[];
  latest: PropertyCardData[];
  cityCounts: { city: string; count: number }[];
  totalProperties: number;
  totalAgents: number;
  totalCities: number;
}

export async function getHomeData(): Promise<HomeData> {
  const [featured, latest, cityCounts] = await Promise.all([
    prisma.property.findMany({
      where: {
        status: "ACTIVE",
        featured: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: propertyCardSelect,
    }),
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: propertyCardSelect,
    }),
    prisma.property.groupBy({
      by: ["city"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
  ]);

  const [totalProperties, totalAgents, totalCities] = await Promise.all([
    prisma.property.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "AGENT", isAgentApproved: true } }),
    prisma.property.groupBy({ by: ["city"], where: { status: "ACTIVE" } }).then(
      (r) => r.length
    ),
  ]);

  return {
    featured: featured as unknown as PropertyCardData[],
    latest: latest as unknown as PropertyCardData[],
    cityCounts: safeMap(cityCounts),
    totalProperties,
    totalAgents,
    totalCities,
  };
}

const propertyCardSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  listingType: true,
  propertyType: true,
  status: true,
  address: true,
  city: true,
  state: true,
  country: true,
  latitude: true,
  longitude: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  yearBuilt: true,
  furnished: true,
  parking: true,
  featured: true,
  createdAt: true,
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  agent: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
} as const;

function safeMap(
  groups: { city: string; _count: { _all: number } }[]
) {
  const map = new Map<string, number>();
  for (const g of groups) {
    if (!g.city) continue;
    map.set(g.city, (map.get(g.city) || 0) + g._count._all);
  }
  return Array.from(map.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}
