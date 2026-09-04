import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { saveFile, validateUpload } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const { user, response } = await getApiUser();
  if (!user) return response;

  if (user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const validationError = validateUpload({
      size: buffer.byteLength,
      type: file.type,
    });
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const stored = await saveFile(
      {
        data: buffer,
        name: file.name,
        type: file.type,
      },
      "properties"
    );

    return NextResponse.json(stored, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
