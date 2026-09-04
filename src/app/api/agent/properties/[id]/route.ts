import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { propertySchema } from "@/lib/validations";
import { updateProperty, deleteProperty } from "@/services/property-mutations";

export async function PUT(
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

  const parsed = propertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 400 }
    );
  }

  try {
    const property = await updateProperty(user.id, params.id, parsed.data);
    return NextResponse.json({ property });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update property" },
      { status: 403 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "AGENT" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await deleteProperty(user.id, params.id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete" },
      { status: 403 }
    );
  }
}
