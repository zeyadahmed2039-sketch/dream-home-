import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { getNotifications, markAllRead } from "@/services/notifications";

export async function GET() {
  const { user, response } = await getApiUser();
  if (!user) return response;
  const notifications = await getNotifications(user.id);
  return NextResponse.json({ notifications });
}

export async function PATCH() {
  const { user, response } = await getApiUser();
  if (!user) return response;
  await markAllRead(user.id);
  return NextResponse.json({ success: true });
}
