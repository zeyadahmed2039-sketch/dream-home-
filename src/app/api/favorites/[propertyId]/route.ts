import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { addFavorite, removeFavorite } from "@/services/favorites";

export async function POST(
  _req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;

  try {
    await addFavorite(user.id, params.propertyId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  const { user, response } = await getApiUser();
  if (!user) return response;

  await removeFavorite(user.id, params.propertyId);
  return NextResponse.json({ success: true });
}
