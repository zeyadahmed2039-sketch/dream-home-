import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredFile {
  url: string;
  publicId?: string;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB per chunk for AWS/Cloudinary-style upload (not used for local)

/**
 * Validate an uploaded file: returns an error message or null.
 */
export function validateUpload(file: {
  size: number;
  type: string;
}): string | null {
  const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
  const ALLOWED = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];

  if (!ALLOWED.includes(file.type)) {
    return "Unsupported file type. Please upload a JPEG, PNG, WebP, GIF, or AVIF image.";
  }

  if (file.size > MAX_SIZE) {
    return "File is too large. Maximum size is 8 MB.";
  }

  return null;
}

/**
 * Save an uploaded file. In local mode it writes to /public/uploads.
 * The storage service is intentionally abstracted so Cloudinary / S3 can be
 * swapped in by supplying the matching environment variables.
 */
export async function saveFile(
  file: { data: Buffer; name: string; type: string },
  folder = "properties"
): Promise<StoredFile> {
  const driver = process.env.STORAGE_DRIVER || "local";

  if (driver === "cloudinary") {
    return saveToCloudinary(file);
  }

  return saveLocal(file, folder);
}

async function saveLocal(
  file: { data: Buffer; name: string; type: string },
  folder: string
): Promise<StoredFile> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(
    /[^a-z0-9]/g,
    ""
  );
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)
    ? ext
    : "jpg";
  const id = crypto.randomBytes(16).toString("hex");
  const filename = `${id}.${safeExt}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(uploadDir, { recursive: true });

  const fullPath = path.join(uploadDir, filename);
  await fs.writeFile(fullPath, file.data);

  return {
    url: `/uploads/${folder}/${filename}`,
    publicId: `${folder}/${filename}`,
  };
}

async function saveToCloudinary(file: {
  data: Buffer;
  name: string;
  type: string;
}): Promise<StoredFile> {
  const cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "dream-home-online" },
      (error: unknown, result: { secure_url: string; public_id: string }) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.write(file.data);
    stream.end();
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFile(publicId: string): Promise<void> {
  // Local driver: files are static; removal is optional. Cloudinary deletion is
  // provided as the reference implementation you can extend.
  if (process.env.STORAGE_DRIVER === "cloudinary" && publicId) {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    await cloudinary.uploader.destroy(publicId);
  }
}

export { CHUNK_SIZE };
