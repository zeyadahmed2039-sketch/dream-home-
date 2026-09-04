import { NextRequest, NextResponse } from "next/server";
import { getApiUser, forbidden } from "@/lib/session";
import { PropertyStatus, Role } from "@/lib/enums";
import {
  getAdminProperties,
  updatePropertyStatus,
  deleteProperty,
} from "@/services/admin";

export async function GET(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  const sp = req.nextUrl.searchParams;
  const statusParam = sp.get("status") || "ALL";
  const status =
    Object.values(PropertyStatus).includes(statusParam as PropertyStatus)
      ? (statusParam as PropertyStatus)
      : "ALL";
  const search = sp.get("search") || "";
  const page = Math.max(1, Number(sp.get("page")) || 1);

  const result = await getAdminProperties(status as never, page, 10, search);
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { propertyId, status } = body as { propertyId?: string; status?: string };
  if (!propertyId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const property = await updatePropertyStatus(
      propertyId,
      status as PropertyStatus,
      Role.ADMIN
    );
    return NextResponse.json({ property });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  const { propertyId } = (await req.json()) as { propertyId?: string };
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId" }, { status: 400 });
  }

  try {
    await deleteProperty(propertyId, Role.ADMIN);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
