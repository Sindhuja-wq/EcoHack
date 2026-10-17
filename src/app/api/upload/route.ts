import { NextResponse } from "next/server";
import { uploadEvidenceImage } from "@/lib/storage";

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

    const uploadResult = await uploadEvidenceImage(
      buffer,
      file.type,
      file.name
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileName: uploadResult.fileName,
      mimeType: uploadResult.mimeType,
      size: uploadResult.size,
      storageProvider: uploadResult.provider,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}

