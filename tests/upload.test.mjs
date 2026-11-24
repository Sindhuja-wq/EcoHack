import test from "node:test";
import assert from "node:assert/strict";
import {
  checkUploadRateLimit,
  _resetUploadMemoryStoreForTesting,
  checkRateLimit,
  _resetMemoryStoreForTesting,
} from "../src/lib/ratelimit.ts";
import {
  detectImageMimeType,
  uploadEvidenceImage,
} from "../src/lib/storage.ts";

test("Magic Byte Detection - Successfully identifies authentic JPEG files", () => {
  // Standard JPEG with JFIF APP0 marker (FF D8 FF E0)
  const jpegJfif = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);
  assert.equal(detectImageMimeType(jpegJfif), "image/jpeg");

  // Standard JPEG with EXIF APP1 marker (FF D8 FF E1)
  const jpegExif = Buffer.from([
    0xff, 0xd8, 0xff, 0xe1, 0x00, 0x18, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  ]);
  assert.equal(detectImageMimeType(jpegExif), "image/jpeg");
});

test("Magic Byte Detection - Successfully identifies authentic PNG files", () => {
  // Standard 8-byte PNG signature: 89 50 4E 47 0D 0A 1A 0A followed by IHDR chunk
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  assert.equal(detectImageMimeType(pngHeader), "image/png");
});

test("Magic Byte Detection - Successfully identifies authentic WebP files", () => {
  // Standard WebP RIFF header: 'RIFF' + 4-byte size + 'WEBP'
  const webpHeader = Buffer.concat([
    Buffer.from("RIFF"),
    Buffer.from([0x20, 0x00, 0x00, 0x00]), // 32 bytes size
    Buffer.from("WEBP"),
  ]);
  assert.equal(detectImageMimeType(webpHeader), "image/webp");
});

test("Magic Byte Detection - Strictly rejects spoofed, script, and non-image files", () => {
  // HTML file claiming to be an image
  const htmlFile = Buffer.from("<html><head><script>alert(1)</script></head><body>evil</body></html>");
  assert.equal(detectImageMimeType(htmlFile), null, "HTML files must be rejected");

  // SVG file with embedded script (vector format disallowed for photo evidence)
  const svgFile = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
  assert.equal(detectImageMimeType(svgFile), null, "SVG files must be rejected");

  // Executable binary file (MZ DOS header)
  const exeFile = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
  assert.equal(detectImageMimeType(exeFile), null, "Binary executables must be rejected");

  // Plain text file
  const textFile = Buffer.from("This is a simple plain text note about sustainability.");
  assert.equal(detectImageMimeType(textFile), null, "Plain text must be rejected");

  // Empty or truncated buffer
  assert.equal(detectImageMimeType(Buffer.alloc(0)), null, "Empty buffer must be rejected");
  assert.equal(detectImageMimeType(Buffer.from([0xff, 0xd8])), null, "Truncated buffer must be rejected");
});

test("Upload Rate Limiter - Enforces 10 uploads per user per minute threshold", () => {
  _resetUploadMemoryStoreForTesting();
  const userId = `user:test-user-${Date.now()}`;

  // Requests 1 through 10 must succeed
  for (let i = 1; i <= 10; i++) {
    const result = checkUploadRateLimit(userId);
    assert.equal(result.success, true, `Upload #${i} should be permitted`);
    assert.equal(result.limit, 10);
    assert.equal(result.remaining, 10 - i);
    assert.ok(result.reset > 0);
  }

  // 11th request must be rejected with 429 semantics
  const blockedResult = checkUploadRateLimit(userId);
  assert.equal(blockedResult.success, false, "Upload #11 must be blocked");
  assert.equal(blockedResult.remaining, 0);
  assert.ok(blockedResult.reset > Math.floor(Date.now() / 1000));
});

test("Upload Rate Limiter - Different users maintain isolated quotas", () => {
  _resetUploadMemoryStoreForTesting();
  const userA = "user:eco-warrior-1";
  const userB = "user:eco-warrior-2";

  // Exhaust User A's quota
  for (let i = 0; i < 10; i++) {
    checkUploadRateLimit(userA);
  }
  const blockedA = checkUploadRateLimit(userA);
  assert.equal(blockedA.success, false, "User A must be rate limited");

  // User B should still have full quota
  const allowedB = checkUploadRateLimit(userB);
  assert.equal(allowedB.success, true, "User B must not be affected by User A's limit");
  assert.equal(allowedB.remaining, 9);
});

test("Upload Rate Limiter - Isolated from Waste Analysis AI Rate Limiter", () => {
  _resetUploadMemoryStoreForTesting();
  _resetMemoryStoreForTesting();

  const testKey = "user:shared-test-id";
  const testReq = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": "198.51.100.99" },
  });

  // Use upload quota
  checkUploadRateLimit(testKey);

  // Waste analysis quota should remain at 15 limit and untouched
  const analysisResult = checkRateLimit(testReq);
  assert.equal(analysisResult.success, true);
  assert.equal(analysisResult.limit, 15);
  assert.equal(analysisResult.remaining, 14);
});

test("Storage Provider - Generates correct verified extensions", async () => {
  const dummyBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);

  const jpegResult = await uploadEvidenceImage(dummyBuffer, "image/jpeg", "my-photo.png");
  assert.ok(jpegResult.fileName.endsWith(".jpg"), "Verified JPEG must result in .jpg filename");
  assert.equal(jpegResult.mimeType, "image/jpeg");

  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]);
  const pngResult = await uploadEvidenceImage(pngBuffer, "image/png", "photo.jpeg");
  assert.ok(pngResult.fileName.endsWith(".png"), "Verified PNG must result in .png filename");
  assert.equal(pngResult.mimeType, "image/png");
});
