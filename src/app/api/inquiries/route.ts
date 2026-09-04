import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { rateLimit, ipKey } from "@/lib/rate-limit";
import { inquirySchema } from "@/lib/validations";
import { createInquiry } from "@/services/inquiries";

export async function POST(req: NextRequest) {
  if (!rateLimit(`inquiry:${ipKey(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { user } = await getApiUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 400 }
    );
  }

  try {
    const inquiry = await createInquiry({
      ...parsed.data,
      userId: user?.id,
    });
    return NextResponse.json({ inquiry }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
