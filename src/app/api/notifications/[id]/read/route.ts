import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { markOneRead } from "@/services/notifications";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  await markOneRead(params.id, user.id);
  return NextResponse.json({ success: true });
}
