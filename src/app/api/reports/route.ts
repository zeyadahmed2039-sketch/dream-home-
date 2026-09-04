import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const { user } = await getApiUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 400 }
    );
  }

  try {
    const report = await prisma.report.create({
      data: {
        propertyId: parsed.data.propertyId,
        reporterId: user?.id,
        reason: parsed.data.reason,
        details: parsed.data.details,
      },
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 400 }
    );
  }
}
