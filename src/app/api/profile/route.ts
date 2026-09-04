import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/session";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const { user, response } = await getApiUser();
  if (!user) return response;

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
      createdAt: true,
    },
  });

  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || undefined,
      bio: parsed.data.bio || undefined,
      avatar: parsed.data.avatar || undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      role: true,
    },
  });

  return NextResponse.json({ profile: updated });
}
