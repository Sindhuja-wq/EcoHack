import path from "path";
import crypto from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { put } from "@vercel/blob";

export interface StorageUploadResult {
  url: string;
  fileName: string;
  provider: "vercel-blob" | "cloudinary" | "local" | "data-url";
  mimeType: string;
  size: number;
}

/**
 * Robust, production-ready storage provider for challenge evidence photos and media.
 * Supports:
 * 1. Vercel Blob (native Vercel persistent CDN storage via BLOB_READ_WRITE_TOKEN)
 * 2. Cloudinary (via CLOUDINARY_CLOUD_NAME & CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_URL)
 * 3. Local filesystem (for local development in public/uploads/)
 * 4. Inline Base64 Data URL (safe resilient fallback when running serverless before cloud storage is linked)
 */
export async function uploadEvidenceImage(
  buffer: Buffer,
  mimeType: string,
  originalFilename?: string
): Promise<StorageUploadResult> {
  let ext = ".jpg";
  if (mimeType === "image/png") ext = ".png";
  if (mimeType === "image/webp") ext = ".webp";
  if (mimeType === "image/gif") ext = ".gif";

  const uniqueId = crypto.randomBytes(16).toString("hex");
  const fileName = `evidence_${Date.now()}_${uniqueId}${ext}`;

  // 1. Check for Vercel Blob token (recommended for Vercel deployments)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`evidence/${fileName}`, buffer, {
        access: "public",
        contentType: mimeType,
      });

      return {
        url: blob.url,
        fileName,
        provider: "vercel-blob",
        mimeType,
        size: buffer.length,
      };
    } catch (err) {
      console.error("[Storage] Vercel Blob upload failed, trying next provider:", err);
    }
  }

  // 2. Check for Cloudinary configuration
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (cloudName && uploadPreset) {
    try {
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      const formData = new URLSearchParams();
      formData.append("file", dataUri);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "ecohack_evidence");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const json = await response.json();
        return {
          url: json.secure_url || json.url,
          fileName,
          provider: "cloudinary",
          mimeType,
          size: buffer.length,
        };
      }
    } catch (err) {
      console.error("[Storage] Cloudinary upload failed, trying next provider:", err);
    }
  }

  // 3. Check if local filesystem is writable (Local Development default)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.NETLIFY);

  if (!isServerless) {
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      return {
        url: `/uploads/${fileName}`,
        fileName,
        provider: "local",
        mimeType,
        size: buffer.length,
      };
    } catch (err) {
      console.warn("[Storage] Local filesystem write failed:", err);
    }
  }

  // 4. Safe fallback for serverless preview mode before cloud storage credentials are configured
  // Encodes as persistent Data URL in database, preventing unhandled 500 EROFS crashes
  console.warn(
    "[Storage] Running in serverless without BLOB_READ_WRITE_TOKEN or Cloudinary credentials. Falling back to persistent Data URI."
  );

  const base64Data = buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  return {
    url: dataUri,
    fileName,
    provider: "data-url",
    mimeType,
    size: buffer.length,
  };
}
