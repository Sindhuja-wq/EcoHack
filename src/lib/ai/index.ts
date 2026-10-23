import type { IWasteAnalysisProvider } from "./types.ts";
import { GeminiWasteAnalysisProvider } from "./gemini-provider.ts";
import { MockWasteAnalysisProvider } from "./mock-provider.ts";

export type * from "./types.ts";

export function getWasteAnalysisProvider(): {
  provider: IWasteAnalysisProvider;
  isMock: boolean;
  providerName: string;
} {
  const providerType = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;

  if (providerType === "gemini") {
    if (!apiKey || apiKey.trim() === "") {
      throw new Error(
        "GEMINI_API_KEY is not configured in .env. Please configure your GEMINI_API_KEY in .env to enable live AI vision analysis. If you wish to test in demonstration mode without an API key, set AI_PROVIDER='mock' in .env."
      );
    }

    return {
      provider: new GeminiWasteAnalysisProvider(apiKey, process.env.GEMINI_MODEL),
      isMock: false,
      providerName: `Google Gemini (${process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"})`,
    };
  }

  if (providerType === "mock") {
    return {
      provider: new MockWasteAnalysisProvider(),
      isMock: true,
      providerName: "EcoHack Educational Demonstration Engine",
    };
  }

  throw new Error(`Unsupported AI_PROVIDER: '${providerType}'. Supported providers are 'gemini' and 'mock'.`);
}
