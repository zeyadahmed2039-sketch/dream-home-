import { NextRequest, NextResponse } from "next/server";
import { getApiUser, forbidden } from "@/lib/session";
import { Role } from "@/lib/enums";
import { deleteUser } from "@/services/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    role?: string;
    isAgentApproved?: boolean;
  };

  const data: { role?: Role; isAgentApproved?: boolean } = {};

  if (payload.role && ["USER", "AGENT", "ADMIN"].includes(payload.role)) {
    // Prevent admins from changing their own role
    if (user.id === params.id && payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }
    data.role = payload.role as Role;
    if (payload.role === "AGENT") data.isAgentApproved = true;
    if (payload.role === "USER") data.isAgentApproved = false;
  }

  if (typeof payload.isAgentApproved === "boolean") {
    data.isAgentApproved = payload.isAgentApproved;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();
  if (user.id === params.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    await deleteUser(params.id, Role.ADMIN);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
