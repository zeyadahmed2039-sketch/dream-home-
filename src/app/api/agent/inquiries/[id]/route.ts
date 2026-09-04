import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { updateInquiryStatus } from "@/services/inquiries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "AGENT" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = (body as { status?: string })?.status;
  if (!["PENDING", "READ", "RESPONDED", "CLOSED"].includes(status || "")) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const inquiry = await updateInquiryStatus(
      params.id,
      user.id,
      status as never
    );
    return NextResponse.json({ inquiry });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 403 }
    );
  }
}
