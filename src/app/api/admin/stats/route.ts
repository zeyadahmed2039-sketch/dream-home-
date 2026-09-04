import { NextResponse } from "next/server";
import { getApiUser, forbidden } from "@/lib/session";
import { getAdminStats } from "@/services/admin";

export async function GET() {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  const stats = await getAdminStats();
  return NextResponse.json({ stats });
}
