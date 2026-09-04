import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAgentInquiries } from "@/services/inquiries";
import { getAgentViewings } from "@/services/viewings";
import { AgentShell } from "@/components/dashboard/agent-shell";

export const metadata: Metadata = { title: "Agent Dashboard" };

export default async function AgentDashboardPage() {
  const user = await requireRole("AGENT", "ADMIN");
  if (!user) redirect("/login?callbackUrl=/agent");

  const userId = user.id;

  const [properties, inquiries, viewings, unreadCount] = await Promise.all([
    prisma.property.findMany({
      where: { agentId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { favorites: true, inquiries: true, viewings: true } },
      },
    }),
    getAgentInquiries(userId, 1, 50),
    getAgentViewings(userId),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  const approved = user.role === "ADMIN" ? true : user.isAgentApproved;

  return (
    <AgentShell
      user={user}
      isApproved={Boolean(approved)}
      initialProperties={properties as never[]}
      initialInquiries={inquiries.inquiries as never[]}
      initialViewings={viewings as never[]}
      unread={unreadCount}
    />
  );
}
