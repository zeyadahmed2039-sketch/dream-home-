import { NextRequest, NextResponse } from "next/server";
import { getApiUser, forbidden } from "@/lib/session";
import { Role, isRole } from "@/lib/enums";
import { getUsersByRole } from "@/services/admin";

export async function GET(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  const sp = req.nextUrl.searchParams;
  const roleParam = sp.get("role") || "ALL";
  const role = isRole(roleParam) ? roleParam : "ALL";
  const search = sp.get("search") || "";
  const page = Math.max(1, Number(sp.get("page")) || 1);

  const result = await getUsersByRole(role as Role | "ALL", page, 10, search);
  return NextResponse.json(result);
}
