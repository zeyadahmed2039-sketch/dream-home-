import { prisma } from "@/lib/prisma";

export async function getFavorites(userId: string, page = 1, pageSize = 12) {
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: {
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            agent: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return { favorites, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function isFavorite(userId: string, propertyId: string) {
  const fav = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
    select: { id: true },
  });
  return Boolean(fav);
}

export async function addFavorite(userId: string, propertyId: string) {
  // Validate property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) throw new Error("Property not found");

  return prisma.favorite.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    create: { userId, propertyId },
    update: {},
  });
}

export async function removeFavorite(userId: string, propertyId: string) {
  await prisma.favorite.deleteMany({
    where: { userId, propertyId },
  });
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const favs = await prisma.favorite.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return favs.map((f) => f.propertyId);
}
