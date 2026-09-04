import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/session";
import { AdminShell } from "@/components/dashboard/admin-shell";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const user = await requireRole("ADMIN");
  if (!user) redirect("/login?callbackUrl=/admin");

  return <AdminShell />;
}
