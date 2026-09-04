import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, ipKey } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validations";
import { appUrl } from "@/lib/constants";

export async function POST(req: NextRequest) {
  if (!rateLimit(`forgot:${ipKey(req)}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return a generic success message to avoid leaking account existence.
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  // Invalidate previous tokens and create a new one
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expires },
  });

  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  // NOTE: No SMTP provider is configured by default. In local development the
  // reset link is returned so the flow can be tested end-to-end. In production
  // you would send `resetUrl` via email instead.
  const devLink =
    process.env.NODE_ENV !== "production"
      ? { devResetLink: resetUrl }
      : {};

  return NextResponse.json({ success: true, ...devLink });
}
