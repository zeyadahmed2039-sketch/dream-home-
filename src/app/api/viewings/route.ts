import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { viewingSchema } from "@/lib/validations";
import { createViewing } from "@/services/viewings";

export async function POST(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = viewingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 400 }
    );
  }

  try {
    const viewing = await createViewing({ ...parsed.data, userId: user.id });
    return NextResponse.json({ viewing }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}
