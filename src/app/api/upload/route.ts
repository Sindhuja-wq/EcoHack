import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSession } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in the upload request." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Please upload a JPEG, PNG, or WebP image.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File is too large. Maximum supported size is 8 megabytes.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine safe extension
    let ext = ".jpg";
    if (file.type === "image/png") ext = ".png";
    if (file.type === "image/webp") ext = ".webp";
    if (file.type === "image/gif") ext = ".gif";

    const uniqueId = crypto.randomBytes(16).toString("hex");
    const fileName = `upload_${Date.now()}_${uniqueId}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
