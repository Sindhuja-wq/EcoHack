import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { checkUploadRateLimit } from "@/lib/ratelimit";
import { uploadEvidenceImage, detectImageMimeType } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Strict 4 MB maximum file size aligned with Vercel's 4.5 MB serverless execution boundary
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

export async function POST(request: Request) {
  try {
    // 1. Enforce user authentication
    let user;
    try {
      user = await requireAuth();
    } catch {
      return NextResponse.json(
        { error: "Authentication required to upload evidence photos. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Enforce per-user upload rate limiting (10 uploads / 60 seconds)
    const rateLimit = checkUploadRateLimit(`user:${user.id}`);
    if (!rateLimit.success) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const retryAfterSeconds = Math.max(1, rateLimit.reset - nowSeconds);

      return NextResponse.json(
        {
          error:
            "Upload rate limit exceeded. You can upload up to 10 photos per minute. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    // 3. Extract and validate multipart form payload
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in the upload request." },
        { status: 400 }
      );
    }

    // 4. File size check against Vercel serverless boundary
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File size exceeds the 4 MB limit. Please upload a compressed image under 4 MB.",
        },
        { status: 413 }
      );
    }

    // 5. Read buffer and verify non-empty content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty." },
        { status: 400 }
      );
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File size exceeds the 4 MB limit. Please upload a compressed image under 4 MB.",
        },
        { status: 413 }
      );
    }

    // 6. Magic byte binary verification (zero-trust header inspection)
    const detectedMime = detectImageMimeType(buffer);
    if (!detectedMime) {
      return NextResponse.json(
        {
          error:
            "Unsupported or corrupted file format. Only authentic JPEG, PNG, and WebP images are accepted.",
        },
        { status: 415 }
      );
    }

    // 7. Check for MIME spoofing or header mismatches
    const rawClientMime = (file.type || "").toLowerCase().trim();
    if (rawClientMime && !ALLOWED_MIME_TYPES.has(rawClientMime)) {
      return NextResponse.json(
        {
          error:
            "Unsupported declared file format. Only authentic JPEG, PNG, and WebP images are accepted.",
        },
        { status: 415 }
      );
    }

    const normalizedClientMime = rawClientMime === "image/jpg" ? "image/jpeg" : rawClientMime;
    if (normalizedClientMime && normalizedClientMime !== detectedMime) {
      return NextResponse.json(
        {
          error: `File signature mismatch: header claimed "${file.type}" but binary content is "${detectedMime}".`,
        },
        { status: 415 }
      );
    }

    // 8. Secure storage persistence using verified binary MIME type
    const uploadResult = await uploadEvidenceImage(
      buffer,
      detectedMime,
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
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { error: "Authentication required to upload evidence photos. Please sign in." },
        { status: 401 }
      );
    }

    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: "Failed to process upload. Please try again." },
      { status: 500 }
    );
  }
}
