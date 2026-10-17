import test from "node:test";
import assert from "node:assert/strict";
import { MockWasteAnalysisProvider } from "../src/lib/ai/mock-provider.ts";
import { GeminiWasteAnalysisProvider } from "../src/lib/ai/gemini-provider.ts";

test("AI Provider Guard - Gemini provider throws clear error when GEMINI_API_KEY is missing", async () => {
  const provider = new GeminiWasteAnalysisProvider("", "gemini-3.8-flash");
  await assert.rejects(
    async () => {
      await provider.analyzeImage("data:image/jpeg;base64,dGVzdA==", "image/jpeg");
    },
    (err) => {
      assert.match(err.message, /GEMINI_API_KEY is not configured/);
      return true;
    }
  );
});

test("Mock Waste Engine - Plastic Bottle produces distinct PET repurposing blueprints", async () => {
  const provider = new MockWasteAnalysisProvider();
  const sampleData = "data:image/png;base64," + Buffer.from("PET Plastic Bottle beverage container").toString("base64");
  const result = await provider.analyzeImage(sampleData, "image/png");

  assert.equal(result.materialCategory, "plastic");
  assert.match(result.detectedItem, /PET/i);
  assert.equal(result.isDemoSample, true);
  assert.equal(result.transformationOptions.length >= 3, true);
  
  const titles = result.transformationOptions.map((o) => o.title);
  assert.ok(titles.some((t) => t.includes("Self-Watering")));
  assert.ok(titles.some((t) => t.includes("Irrigation")));
});

test("Mock Waste Engine - Cardboard Box produces distinct sheet mulch & cat scratcher blueprints", async () => {
  const provider = new MockWasteAnalysisProvider();
  const sampleData = "data:image/svg+xml;base64," + Buffer.from("<svg>Cardboard Shipping Box packaging</svg>").toString("base64");
  const result = await provider.analyzeImage(sampleData, "image/svg+xml");

  assert.equal(result.materialCategory, "cardboard");
  assert.match(result.detectedItem, /Cardboard/i);
  assert.equal(result.isCompostable, true);
  assert.equal(result.isDemoSample, true);

  const titles = result.transformationOptions.map((o) => o.title);
  assert.ok(titles.some((t) => t.includes("Mulch") || t.includes("Seedling") || t.includes("Scratcher")));
  // Ensure it is completely distinct from plastic bottle
  assert.ok(!titles.some((t) => t.includes("Self-Watering Herb Planter")));
});

test("Mock Waste Engine - Cotton T-Shirt produces distinct fabric & tote bag blueprints", async () => {
  const provider = new MockWasteAnalysisProvider();
  const sampleData = "data:image/svg+xml;base64," + Buffer.from("<svg>Cotton Denim T-Shirt Fabric</svg>").toString("base64");
  const result = await provider.analyzeImage(sampleData, "image/svg+xml");

  assert.equal(result.materialCategory, "fabric");
  assert.match(result.detectedItem, /Cotton/i);
  assert.equal(result.isRepairable, true);
  assert.equal(result.isDemoSample, true);

  const titles = result.transformationOptions.map((o) => o.title);
  assert.ok(titles.some((t) => t.includes("Bag") || t.includes("Rags") || t.includes("Plant Holder")));
  // Ensure it is completely distinct from plastic and cardboard
  assert.ok(!titles.some((t) => t.includes("Self-Watering Herb Planter")));
  assert.ok(!titles.some((t) => t.includes("Weed Suppression")));
});

test("Mock Waste Engine - Glass Jar produces distinct airtight pantry & terrarium blueprints", async () => {
  const provider = new MockWasteAnalysisProvider();
  const sampleData = "data:image/svg+xml;base64," + Buffer.from("<svg>Glass Jam Jar with lid</svg>").toString("base64");
  const result = await provider.analyzeImage(sampleData, "image/svg+xml");

  assert.equal(result.materialCategory, "glass");
  assert.match(result.detectedItem, /Glass/i);
  assert.equal(result.isReusable, true);
  assert.equal(result.isDemoSample, true);

  const titles = result.transformationOptions.map((o) => o.title);
  assert.ok(titles.some((t) => t.includes("Pantry") || t.includes("Terrarium") || t.includes("Organizer")));
  assert.ok(!titles.some((t) => t.includes("Self-Watering Herb Planter")));
});

test("Mock Waste Engine - Vegetable Scraps produce distinct compost & broth stock blueprints", async () => {
  const provider = new MockWasteAnalysisProvider();
  const sampleData = "data:image/svg+xml;base64," + Buffer.from("<svg>Organic Coffee Grounds & vegetable scraps</svg>").toString("base64");
  const result = await provider.analyzeImage(sampleData, "image/svg+xml");

  assert.equal(result.materialCategory, "organic");
  assert.match(result.detectedItem, /Vegetable|Scraps|Organic/i);
  assert.equal(result.isCompostable, true);
  assert.equal(result.isDemoSample, true);

  const titles = result.transformationOptions.map((o) => o.title);
  assert.ok(titles.some((t) => t.includes("Broth") || t.includes("Compost") || t.includes("Scallions")));
  assert.ok(!titles.some((t) => t.includes("Self-Watering Herb Planter")));
});

test("Image Upload Flow - 5 distinct waste items with binary payloads produce distinct appropriate analyses", async () => {
  const provider = new MockWasteAnalysisProvider();

  // 1. Plastic Bottle
  const bottlePayload = "data:image/png;base64," + Buffer.alloc(100, 0x50).toString("base64");
  const bottleResult = await provider.analyzeImage(bottlePayload, "image/png", "Seattle", "plastic_beverage_water_bottle.png");
  assert.equal(bottleResult.materialCategory, "plastic");
  assert.match(bottleResult.detectedItem, /PET|Bottle/i);
  assert.equal(bottleResult.transformationOptions.length >= 3, true);
  for (const opt of bottleResult.transformationOptions) {
    assert.ok(opt.title && opt.title.length > 5);
    assert.ok(Array.isArray(opt.materialsTools) && opt.materialsTools.length > 0);
    assert.ok(Array.isArray(opt.stepByStep) && opt.stepByStep.length >= 2);
    assert.ok(opt.difficulty && opt.estimatedTime);
    assert.ok(opt.safetyPrecautions);
  }

  // 2. Cardboard Box
  const cardboardPayload = "data:image/jpeg;base64," + Buffer.alloc(100, 0x43).toString("base64");
  const cardboardResult = await provider.analyzeImage(cardboardPayload, "image/jpeg", "Mumbai", "corrugated_shipping_cardboard_box.jpg");
  assert.equal(cardboardResult.materialCategory, "cardboard");
  assert.match(cardboardResult.detectedItem, /Cardboard/i);
  assert.equal(cardboardResult.isCompostable, true);
  assert.notEqual(cardboardResult.detectedItem, bottleResult.detectedItem);
  assert.notEqual(cardboardResult.transformationOptions[0].title, bottleResult.transformationOptions[0].title);

  // 3. Cotton T-Shirt
  const tshirtPayload = "data:image/png;base64," + Buffer.alloc(100, 0x46).toString("base64");
  const tshirtResult = await provider.analyzeImage(tshirtPayload, "image/png", "London", "worn_crewneck_cotton_tshirt.png");
  assert.equal(tshirtResult.materialCategory, "fabric");
  assert.match(tshirtResult.detectedItem, /Cotton|Shirt/i);
  assert.equal(tshirtResult.isRepairable, true);
  assert.notEqual(tshirtResult.detectedItem, cardboardResult.detectedItem);
  assert.notEqual(tshirtResult.transformationOptions[0].title, cardboardResult.transformationOptions[0].title);

  // 4. Glass Jar
  const jarPayload = "data:image/jpeg;base64," + Buffer.alloc(100, 0x47).toString("base64");
  const jarResult = await provider.analyzeImage(jarPayload, "image/jpeg", "Toronto", "glass_pickle_food_jar.jpg");
  assert.equal(jarResult.materialCategory, "glass");
  assert.match(jarResult.detectedItem, /Glass|Jar/i);
  assert.equal(jarResult.isReusable, true);
  assert.notEqual(jarResult.detectedItem, tshirtResult.detectedItem);
  assert.notEqual(jarResult.transformationOptions[0].title, tshirtResult.transformationOptions[0].title);

  // 5. Vegetable Scraps
  const scrapsPayload = "data:image/png;base64," + Buffer.alloc(100, 0x4F).toString("base64");
  const scrapsResult = await provider.analyzeImage(scrapsPayload, "image/png", "Austin", "kitchen_vegetable_food_scraps.png");
  assert.equal(scrapsResult.materialCategory, "organic");
  assert.match(scrapsResult.detectedItem, /Vegetable|Scraps/i);
  assert.equal(scrapsResult.isCompostable, true);
  assert.notEqual(scrapsResult.detectedItem, jarResult.detectedItem);
  assert.notEqual(scrapsResult.transformationOptions[0].title, jarResult.transformationOptions[0].title);
});

test("Ambiguous or Unrecognized Discard - Reports uncertainty and does NOT return hardcoded plastic bottle", async () => {
  const provider = new MockWasteAnalysisProvider();
  const ambiguousPayload = "data:image/jpeg;base64," + Buffer.alloc(120, 0xAA).toString("base64");
  const result = await provider.analyzeImage(ambiguousPayload, "image/jpeg", undefined, "blurry_unidentifiable_item.jpg");

  // Must report uncertainty
  assert.equal(result.materialCategory, "unknown");
  assert.equal(result.isImageClear, false);
  assert.ok(result.confidence < 0.5, "Confidence should be low for ambiguous image");
  assert.ok(result.unclearPromptNote && result.unclearPromptNote.length > 10);
  assert.ok(result.uncertaintyNotes && result.uncertaintyNotes.length > 10);

  // Must not masquerade as a plastic bottle
  assert.notEqual(result.detectedItem, "Polyethylene Terephthalate (PET #1) Beverage Bottle & Cap");
  assert.ok(!result.transformationOptions.some((o) => o.title.includes("Self-Watering Herb Planter")));

  // Must still provide safe sorting guidance options
  assert.equal(result.transformationOptions.length >= 3, true);
  const titles = result.transformationOptions.map((o) => o.title);
  assert.ok(titles.some((t) => t.includes("Inspection") || t.includes("Stamp") || t.includes("Sorting")));
});

test("Gemini Provider - Validates image payload length and rejects invalid inputs cleanly", async () => {
  const provider = new GeminiWasteAnalysisProvider("mock-api-key", "gemini-3.8-flash");

  // Rejects empty or tiny payload (< 50 chars)
  await assert.rejects(
    async () => {
      await provider.analyzeImage("data:image/jpeg;base64,tiny", "image/jpeg");
    },
    (err) => {
      assert.match(err.message, /Invalid or empty image data/i);
      return true;
    }
  );
});
