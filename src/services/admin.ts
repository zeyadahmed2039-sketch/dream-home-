import { prisma } from "@/lib/prisma";
import { Role, PropertyStatus } from "@/lib/enums";

export async function getAdminStats() {
  const [
    totalUsers,
    totalAgents,
    totalAdmins,
    totalProperties,
    activeListings,
    pendingListings,
    totalInquiries,
    totalViewings,
    totalFavorites,
    totalReports,
    openReports,
    revenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.USER } }),
    prisma.user.count({ where: { role: Role.AGENT } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
    prisma.property.count({ where: { status: PropertyStatus.PENDING } }),
    prisma.inquiry.count(),
    prisma.viewing.count(),
    prisma.favorite.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.property.aggregate({ _sum: { price: true } }),
  ]);

  return {
    totalUsers,
    totalAgents,
    totalAdmins,
    totalProperties,
    activeListings,
    pendingListings,
    totalInquiries,
    totalViewings,
    totalFavorites,
    totalReports,
    openReports,
    totalRevenue: revenue._sum.price ?? 0,
  };
}

export async function getUsersByRole(
  role: Role | "ALL",
  page = 1,
  pageSize = 10,
  search = ""
) {
  const where: any = {};
  if (role !== "ALL") where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        isAgentApproved: true,
        createdAt: true,
        _count: { select: { properties: true, favorites: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function updateUserRole(
  userId: string,
  role: Role,
  actorRole: Role
) {
  if (actorRole !== Role.ADMIN) throw new Error("Forbidden");
  return prisma.user.update({ where: { id: userId }, data: { role } });
}

export async function deleteUser(userId: string, actorRole: Role) {
  if (actorRole !== Role.ADMIN) throw new Error("Forbidden");
  await prisma.user.delete({ where: { id: userId } });
}

export async function getAdminProperties(
  status: PropertyStatus | "ALL",
  page = 1,
  pageSize = 10,
  search = ""
) {
  const where: any = {};
  if (status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { city: { contains: search } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        agent: { select: { id: true, name: true, avatar: true } },
        _count: { select: { favorites: true, inquiries: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus,
  actorRole: Role
) {
  if (actorRole !== Role.ADMIN) throw new Error("Forbidden");
  return prisma.property.update({ where: { id: propertyId }, data: { status } });
}

export async function deleteProperty(propertyId: string, actorRole: Role) {
  if (actorRole !== Role.ADMIN) throw new Error("Forbidden");
  await prisma.property.delete({ where: { id: propertyId } });
}

export async function getReports(page = 1, pageSize = 10) {
  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: {
          select: { id: true, title: true, status: true },
        },
      },
    }),
    prisma.report.count(),
  ]);
  return { reports, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function updateReportStatus(
  reportId: string,
  status: "OPEN" | "RESOLVED" | "DISMISSED",
  actorRole: Role
) {
  if (actorRole !== Role.ADMIN) throw new Error("Forbidden");
  return prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      ...(status !== "OPEN" ? { resolvedAt: new Date() } : {}),
    },
  });
}

export async function getAgentsWithStats() {
  return prisma.user.findMany({
    where: { role: Role.AGENT },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      createdAt: true,
      _count: { select: { properties: true, inquiriesForAgent: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
