import { NextRequest, NextResponse } from "next/server";
import { getApiUser, forbidden } from "@/lib/session";
import { getReports, updateReportStatus } from "@/services/admin";

export async function GET(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;
  if (user.role !== "ADMIN") return forbidden();

  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const result = await getReports(page, 10);
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

  const { reportId, status } = body as {
    reportId?: string;
    status?: "OPEN" | "RESOLVED" | "DISMISSED";
  };
  if (!reportId || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const report = await updateReportStatus(reportId, status, "ADMIN" as never);
    return NextResponse.json({ report });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
