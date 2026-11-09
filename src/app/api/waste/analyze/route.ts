import { NextResponse } from "next/server";
import { z } from "zod";
import { getWasteAnalysisProvider } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AnalyzeRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(20, "Valid image data is required")
    .max(10 * 1024 * 1024, "Image payload is too large. Please upload an image under 8MB."),
  mimeType: z.string().default("image/jpeg"),
  imageUrl: z.string().optional(),
  userCity: z.string().max(100).optional(),
  imageName: z.string().max(255).optional(),
});

export async function POST(request: Request) {
  try {
    // 15 requests per minute per IP rate limiting with header injection prevention
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error:
            "Too many scan requests. Please wait a minute before analyzing another item.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    const body = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid request payload" },
        { status: 400 }
      );
    }

    const { imageBase64, mimeType, imageUrl, userCity, imageName } = parsed.data;

    // Check optional authenticated user
    const session = await getSession();
    const userId = session?.user?.id || null;

    // Execute provider
    const { provider, isMock, providerName } = getWasteAnalysisProvider();
    const result = await provider.analyzeImage(imageBase64, mimeType, userCity, imageName);

    // Save to database
    const savedAnalysis = await prisma.wasteAnalysis.create({
      data: {
        userId,
        imageUrl: imageUrl || "/uploads/sample-placeholder.jpg",
        detectedItem: result.detectedItem,
        materialCategory: result.materialCategory,
        confidence: result.confidence,
        isReusable: result.isReusable,
        isRepairable: result.isRepairable,
        isRecyclable: result.isRecyclable,
        isCompostable: result.isCompostable,
        isUnsuitable: result.isUnsuitable,
        safetyConcerns: result.safetyConcerns,
        qualitativeImpact: JSON.stringify(result.environmentalImpact),
        localNotes: result.localRecyclingCaveats,
        isDemoSample: isMock || Boolean(result.isDemoSample),
        options: {
          create: result.transformationOptions.map((opt) => ({
            title: opt.title,
            shortExplanation: opt.shortExplanation,
            difficulty: opt.difficulty,
            estimatedTime: opt.estimatedTime,
            materialsTools: JSON.stringify(opt.materialsTools),
            estimatedCost: opt.estimatedCost,
            stepByStep: JSON.stringify(opt.stepByStep),
            safetyPrecautions: opt.safetyPrecautions,
            expectedResult: opt.expectedResult,
            environmentalBenefits: opt.environmentalBenefits,
            limitations: opt.limitations,
            disposalMethod: opt.disposalMethod,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Attach saved IDs to transformation options so frontend can save or complete them
    const mappedOptions = result.transformationOptions.map((opt, idx) => ({
      ...opt,
      id: savedAnalysis.options[idx]?.id,
    }));

    return NextResponse.json({
      success: true,
      analysisId: savedAnalysis.id,
      result: {
        ...result,
        transformationOptions: mappedOptions,
        isDemoSample: isMock || Boolean(result.isDemoSample),
      },
      isMock,
      providerName,
    });
  } catch (error: any) {
    console.error("Waste analysis API error:", error?.message || error);
    const msg: string = error?.message || "";
    const lower = msg.toLowerCase();

    let status = 500;
    let errorType = "SERVER_ERROR";
    let userFacingMessage = "An error occurred during AI analysis. Please try again.";

    // 1. Missing or invalid Gemini API Key
    if (
      lower.includes("gemini_api_key is not configured") ||
      lower.includes("api key not valid") ||
      lower.includes("api_key_invalid") ||
      lower.includes("api key validation failed") ||
      error?.status === 401 ||
      (error?.status === 403 && lower.includes("key"))
    ) {
      status = 401;
      errorType = "AUTH_ERROR";
      userFacingMessage =
        "Gemini API key is missing or invalid. Please check the GEMINI_API_KEY configured in your .env file.";
    }
    // 2. Model not found or unsupported for vision/generateContent
    else if (
      lower.includes("not found") ||
      lower.includes("is not supported for generatecontent") ||
      error?.status === 404
    ) {
      status = 404;
      errorType = "MODEL_ERROR";
      userFacingMessage =
        "The configured Gemini model is unavailable or unsupported for vision analysis. EcoHack recommends gemini-3.5-flash-lite.";
    }
    // 3. Quota or rate limit exceeded
    else if (
      lower.includes("quota exceeded") ||
      lower.includes("resource_exhausted") ||
      lower.includes("too many requests") ||
      error?.status === 429
    ) {
      status = 429;
      errorType = "RATE_LIMIT";
      userFacingMessage =
        "Gemini API quota or rate limit exceeded. Please wait a minute before analyzing another item.";
    }
    // 4. Temporary service overload / demand spikes (503)
    else if (
      lower.includes("503") ||
      lower.includes("overloaded") ||
      lower.includes("spikes in demand") ||
      lower.includes("service unavailable") ||
      error?.status === 503
    ) {
      status = 503;
      errorType = "SERVICE_UNAVAILABLE";
      userFacingMessage =
        "Google's Gemini vision service is temporarily overloaded due to demand spikes. Please retry in a few moments.";
    }
    // 5. Invalid / empty image payload
    else if (
      lower.includes("invalid or empty image") ||
      lower.includes("image data received") ||
      lower.includes("payload")
    ) {
      status = 400;
      errorType = "PAYLOAD_ERROR";
      userFacingMessage =
        "The uploaded photo payload was invalid or unreadable. Please upload a standard JPEG, PNG, or WebP photo.";
    }
    // 6. Request Timeout
    else if (
      error?.name === "AbortError" ||
      lower.includes("timed out") ||
      lower.includes("timeout") ||
      lower.includes("etimedout")
    ) {
      status = 504;
      errorType = "TIMEOUT";
      userFacingMessage =
        "AI vision analysis timed out communicating with the service. Please check your internet connection and try again.";
    }
    // 7. General error with message
    else if (msg.length > 0) {
      userFacingMessage = msg;
    }

    return NextResponse.json(
      {
        success: false,
        errorType,
        error: userFacingMessage,
      },
      { status }
    );
  }
}
