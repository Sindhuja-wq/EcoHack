import test from "node:test";
import assert from "node:assert/strict";
import { buildSmartDisposalGuide } from "../src/lib/ai/smart-disposal-guide.ts";
import { MockWasteAnalysisProvider } from "../src/lib/ai/mock-provider.ts";

test("Smart Disposal Guide - Batteries require special handling with terminal taping and fire warnings", () => {
  const guide = buildSmartDisposalGuide("electronics", "Lithium-Ion AA Battery");

  assert.equal(guide.recoveryStatus, "Special Disposal Required");
  assert.equal(guide.requiresSpecialHandling, true);
  assert.match(guide.primaryGuidance, /hazardous/i);
  assert.match(guide.primaryGuidance, /never/i);

  // Must include terminal taping instruction
  assert.ok(guide.safeDisposalSteps.some((step) => /tape|terminals/i.test(step)));

  // Must include fire hazard warning
  assert.ok(guide.safetyWarnings?.some((warn) => /fire/i.test(warn)));

  // Must not invent phone numbers or local address names
  assert.ok(!/[0-9]{3}-[0-9]{3}-[0-9]{4}/.test(guide.primaryGuidance));
  assert.ok(!/[0-9]{3}-[0-9]{3}-[0-9]{4}/.test(guide.municipalDiscretionNote));
});

test("Smart Disposal Guide - Medical waste requires biomedical routing and prohibits household bins", () => {
  const guide = buildSmartDisposalGuide("medical", "Insulin Syringe & Needle");

  assert.equal(guide.recoveryStatus, "Special Disposal Required");
  assert.equal(guide.requiresSpecialHandling, true);
  assert.match(guide.primaryGuidance, /biomedical|clinical/i);

  // Must prohibit household bins
  assert.ok(guide.safeDisposalSteps.some((step) => /sharps|puncture/i.test(step)));
  assert.ok(guide.safetyWarnings?.some((warn) => /biohazard|puncture/i.test(warn)));
});

test("Smart Disposal Guide - Chemical waste strictly forbids pouring into sinks, drains, or soil", () => {
  const guide = buildSmartDisposalGuide("chemical", "Leftover Oil-Based Paint & Solvent Can");

  assert.equal(guide.recoveryStatus, "Special Disposal Required");
  assert.equal(guide.requiresSpecialHandling, true);
  assert.match(guide.primaryGuidance, /household hazardous waste|hhw/i);

  // Forbids pouring into drains or soil
  assert.ok(guide.safeDisposalSteps.some((step) => /hazardous|depot/i.test(step)));
  assert.ok(guide.safetyWarnings?.some((warn) => /drain|waterway|groundwater/i.test(warn)));
});

test("Smart Disposal Guide - E-waste recommends authorized collection and warns against amateur dismantling", () => {
  const guide = buildSmartDisposalGuide("electronics", "Old Smartphone with Cracked Screen", {
    isRepairable: false,
  });

  assert.equal(guide.recoveryStatus, "Special Disposal Required");
  assert.equal(guide.requiresSpecialHandling, true);
  assert.match(guide.primaryGuidance, /e-waste/i);

  // Must warn against dangerous dismantling
  assert.ok(guide.safetyWarnings?.some((warn) => /smash|disassemble|toxicity/i.test(warn)));
});

test("Smart Disposal Guide - Glass provides safe wrapping instructions for broken shards", () => {
  const brokenGlassGuide = buildSmartDisposalGuide("glass", "Broken Shattered Glass Jar", {
    isReusable: false,
  });

  assert.equal(brokenGlassGuide.recoveryStatus, "Special Disposal Required");
  assert.equal(brokenGlassGuide.requiresSpecialHandling, true);
  assert.ok(brokenGlassGuide.safeDisposalSteps.some((step) => /wrap|puncture|paper/i.test(step)));
});

test("Smart Disposal Guide - Unknown items report uncertainty without inventing fake facilities", () => {
  const unknownGuide = buildSmartDisposalGuide("unknown", "Unidentified Composite Object", {
    isImageClear: false,
    confidence: 0.3,
  });

  assert.equal(unknownGuide.recoveryStatus, "No Safe Recovery Option Identified");
  assert.equal(unknownGuide.requiresSpecialHandling, true);
  assert.match(unknownGuide.primaryGuidance, /confidence|uncertain/i);

  // Explains municipal rules vary rather than naming a fake local centre
  assert.match(unknownGuide.municipalDiscretionNote, /municipal|authority|portal/i);
  assert.ok(!unknownGuide.primaryGuidance.includes("123 Main St"));
});

test("Mock Waste Engine - Enhanced results include all 7 required sections and recoveryStatus", async () => {
  const provider = new MockWasteAnalysisProvider();
  const sampleData = "data:image/png;base64," + Buffer.from("PET Plastic Bottle beverage container").toString("base64");
  const result = await provider.analyzeImage(sampleData, "image/png");

  // 1. Waste Identification
  assert.ok(result.detectedItem && result.detectedItem.length > 3);
  assert.equal(result.materialCategory, "plastic");

  // 2. Reuse Possibilities
  assert.ok(Array.isArray(result.reusePossibilities) && result.reusePossibilities.length >= 2);

  // 3. Repair Possibilities
  assert.ok(Array.isArray(result.repairPossibilities) && result.repairPossibilities.length >= 1);

  // 4. Recycling Possibilities
  assert.ok(Array.isArray(result.recyclingPossibilities) && result.recyclingPossibilities.length >= 1);
  assert.equal(result.confirmedRecycling, true);

  // 5. Environmental Benefits
  assert.ok(Array.isArray(result.environmentalBenefits) && result.environmentalBenefits.length >= 2);

  // 6. Environmental Disadvantages
  assert.ok(Array.isArray(result.environmentalDisadvantages) && result.environmentalDisadvantages.length >= 1);

  // 7. Smart Waste Disposal Guide
  assert.ok(result.smartDisposalGuide);
  assert.ok(result.smartDisposalGuide.categoryTitle);
  assert.ok(Array.isArray(result.smartDisposalGuide.safeDisposalSteps) && result.smartDisposalGuide.safeDisposalSteps.length >= 2);

  // Waste-recovery status
  const validStatuses = [
    "Reusable",
    "Repairable",
    "Recyclable",
    "Special Disposal Required",
    "No Safe Recovery Option Identified",
  ];
  assert.ok(validStatuses.includes(result.recoveryStatus));
});

