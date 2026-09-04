import { prisma } from "@/lib/prisma";
import { type ViewingStatus } from "@/lib/enums";

export async function createViewing(data: {
  userId: string;
  propertyId: string;
  date: string;
  time: string;
  notes?: string;
}) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { agentId: true, id: true },
  });
  if (!property) throw new Error("Property not found");

  const viewing = await prisma.viewing.create({
    data: {
      userId: data.userId,
      propertyId: data.propertyId,
      agentId: property.agentId,
      date: new Date(data.date),
      time: data.time,
      notes: data.notes,
    },
  });

  await prisma.notification.create({
    data: {
      userId: property.agentId,
      type: "INFO",
      title: "New viewing request",
      message: `A viewing has been requested for your property.`,
      link: `/agent/viewings?propertyId=${data.propertyId}`,
    },
  });

  return viewing;
}

export async function getUserViewings(userId: string) {
  return prisma.viewing.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: {
      property: { select: { id: true, title: true } },
    },
  });
}

export async function getAgentViewings(agentId: string) {
  return prisma.viewing.findMany({
    where: { agentId },
    orderBy: { date: "desc" },
    include: {
      property: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
}

export async function updateViewingStatus(
  viewingId: string,
  agentId: string,
  status: ViewingStatus
) {
  const viewing = await prisma.viewing.findFirst({
    where: { id: viewingId, agentId },
  });
  if (!viewing) throw new Error("Viewing not found or not yours");

  return prisma.viewing.update({
    where: { id: viewingId },
    data: { status },
  });
}
