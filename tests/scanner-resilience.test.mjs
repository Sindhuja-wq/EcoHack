import test from "node:test";
import assert from "node:assert/strict";
import { GeminiWasteAnalysisProvider } from "../src/lib/ai/gemini-provider.ts";

test("Gemini Provider - Model candidate sanitization filters out unsupported pro, omni, and audio models", () => {
  const providerPro = new GeminiWasteAnalysisProvider("test-key", "gemini-3.8-pro");
  // @ts-ignore
  const candidatesPro = providerPro.getCandidateModels();
  assert.ok(!candidatesPro.some(m => m.includes("pro")), "Pro models must be excluded from vision analysis");
  assert.ok(!candidatesPro.some(m => m.includes("omni")), "Omni models with zero free tier quota must be excluded");
  assert.ok(!candidatesPro.some(m => m.includes("tts")), "TTS models must be excluded");
  assert.equal(candidatesPro[0], "gemini-3.5-flash-lite", "Default primary model should be high-speed gemini-3.5-flash-lite");

  const providerOmni = new GeminiWasteAnalysisProvider("test-key", "gemini-omni-1.1-flash");
  // @ts-ignore
  const candidatesOmni = providerOmni.getCandidateModels();
  assert.ok(!candidatesOmni.some(m => m.includes("omni")), "Omni models must be filtered out");
});

test("Gemini Provider - Fast fallback list includes high-speed models in order of priority", () => {
  const provider = new GeminiWasteAnalysisProvider("test-key", "gemini-3.5-flash-lite");
  // @ts-ignore
  const candidates = provider.getCandidateModels();
  assert.ok(candidates.includes("gemini-3.5-flash-lite"));
  assert.ok(candidates.includes("gemini-flash-lite-latest"));
  assert.ok(candidates.includes("gemini-3.5-flash"));
  assert.ok(candidates.includes("gemini-3.6-flash"));
});

test("Gemini Provider - Rejects empty or corrupt base64 before attempting API calls", async () => {
  const provider = new GeminiWasteAnalysisProvider("test-key", "gemini-3.5-flash");
  await assert.rejects(
    async () => {
      await provider.analyzeImage("", "image/jpeg");
    },
    (err) => {
      assert.match(err.message, /Invalid or empty image data/i);
      return true;
    }
  );

  await assert.rejects(
    async () => {
      await provider.analyzeImage("data:image/jpeg;base64,YWJj", "image/jpeg");
    },
    (err) => {
      assert.match(err.message, /Invalid or empty image data/i);
      return true;
    }
  );
});
