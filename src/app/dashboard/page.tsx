import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/session";
import { getFavorites } from "@/services/favorites";
import { getUserInquiries } from "@/services/inquiries";
import { getUserViewings } from "@/services/viewings";
import { getNotifications, getUnreadCount } from "@/services/notifications";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = { title: "My Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const [favorites, inquiries, viewings, notifications] = await Promise.all([
    getFavorites(user.id, 1, 100),
    getUserInquiries(user.id),
    getUserViewings(user.id),
    getNotifications(user.id, 50),
  ]);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      role: true,
      isAgentApproved: true,
      password: true,
    },
  });

  const profileWithMeta = profile
    ? { ...profile, hasPassword: Boolean(profile.password) }
    : null;

  const unread = await getUnreadCount(user.id);

  return (
    <DashboardShell
      user={user}
      profile={profileWithMeta}
      favorites={favorites.favorites}
      inquiries={inquiries}
      viewings={viewings}
      notifications={notifications}
      unread={unread}
    />
  );
}
