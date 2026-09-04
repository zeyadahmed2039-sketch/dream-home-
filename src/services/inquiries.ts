import { prisma } from "@/lib/prisma";
import { type InquiryStatus } from "@/lib/enums";

export async function createInquiry(data: {
  propertyId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    select: { agentId: true, id: true },
  });
  if (!property) throw new Error("Property not found");

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: data.propertyId,
      agentId: property.agentId,
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    },
  });

  // Notify the agent
  await prisma.notification.create({
    data: {
      userId: property.agentId,
      type: "INFO",
      title: "New inquiry received",
      message: `${data.name} sent you an inquiry.`,
      link: `/agent/inquiries?propertyId=${data.propertyId}`,
    },
  });

  return inquiry;
}

export async function getAgentInquiries(
  agentId: string,
  page = 1,
  pageSize = 10,
  propertyId?: string
) {
  const where = {
    agentId,
    ...(propertyId ? { propertyId } : {}),
  } as any;

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        property: { select: { id: true, title: true } },
      },
    }),
    prisma.inquiry.count({ where }),
  ]);

  return { inquiries, total, page, totalPages: Math.ceil(total / pageSize) };
}

export async function updateInquiryStatus(
  inquiryId: string,
  agentId: string,
  status: InquiryStatus
) {
  const inquiry = await prisma.inquiry.findFirst({
    where: { id: inquiryId, agentId },
  });
  if (!inquiry) throw new Error("Inquiry not found or not yours");

  return prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status },
  });
}

export async function getUserInquiries(userId: string) {
  return prisma.inquiry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { property: { select: { id: true, title: true } } },
  });
}
