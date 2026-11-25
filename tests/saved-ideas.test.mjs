import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Mirroring the implementation from src/app/api/waste/save-idea/route.ts
function safeJsonParse(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") return val;
  if (typeof val === "string") {
    try {
      let parsed = JSON.parse(val);
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // retain initial parsed
        }
      }
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// Mirroring client-side defensive parser from src/app/saved-ideas/page.tsx
function parseArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string") {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) return doubleParsed;
      }
    } catch {
      return [];
    }
  }
  return [];
}

describe("Saved Ideas: safeJsonParse unit tests", () => {
  test("returns fallback when input is null or undefined", () => {
    assert.deepEqual(safeJsonParse(null, []), []);
    assert.deepEqual(safeJsonParse(undefined, []), []);
    assert.deepEqual(safeJsonParse(null, { default: true }), { default: true });
  });

  test("returns object/array untouched if already parsed", () => {
    const rawArray = ["scissors", "glue gun"];
    const rawObj = { step: 1, text: "wash" };
    assert.equal(safeJsonParse(rawArray, []), rawArray);
    assert.equal(safeJsonParse(rawObj, {}), rawObj);
  });

  test("correctly parses valid JSON string array", () => {
    const jsonStr = JSON.stringify(["plastic bottle", "utility knife", "acrylic paint"]);
    const res = safeJsonParse(jsonStr, []);
    assert.deepEqual(res, ["plastic bottle", "utility knife", "acrylic paint"]);
    assert.equal(Array.isArray(res), true);
  });

  test("correctly parses step-by-step object array", () => {
    const steps = [
      { step: 1, instruction: "Rinse and dry the container" },
      { step: 2, instruction: "Cut along the marked line" },
    ];
    const res = safeJsonParse(JSON.stringify(steps), []);
    assert.deepEqual(res, steps);
    assert.equal(res[0].step, 1);
  });

  test("handles double-stringified JSON gracefully", () => {
    const doubleEncoded = JSON.stringify(JSON.stringify(["item 1", "item 2"]));
    const res = safeJsonParse(doubleEncoded, []);
    assert.deepEqual(res, ["item 1", "item 2"]);
  });

  test("gracefully returns fallback on malformed JSON string", () => {
    const broken = "[{broken json,,,";
    assert.deepEqual(safeJsonParse(broken, []), []);
  });

  test("handles non-string primitives by returning fallback", () => {
    assert.deepEqual(safeJsonParse(12345, []), []);
    assert.deepEqual(safeJsonParse(true, []), []);
  });
});

describe("Saved Ideas: client-side parseArray defensive tests", () => {
  test("returns array when input is already an array", () => {
    assert.deepEqual(parseArray(["item1", "item2"]), ["item1", "item2"]);
  });

  test("parses valid JSON string array", () => {
    assert.deepEqual(parseArray('["brush", "sandpaper"]'), ["brush", "sandpaper"]);
  });

  test("returns empty array for invalid JSON or non-array structures", () => {
    assert.deepEqual(parseArray("invalid"), []);
    assert.deepEqual(parseArray('{"not": "an array"}'), []);
    assert.deepEqual(parseArray(null), []);
    assert.deepEqual(parseArray(undefined), []);
    assert.deepEqual(parseArray(42), []);
  });
});

describe("Saved Ideas: Data mapper & relation transformation", () => {
  const mockDbRecords = [
    {
      id: "saved_1",
      userId: "user_123",
      transformationOptionId: "opt_1",
      createdAt: new Date("2026-11-20T10:00:00Z"),
      transformationOption: {
        id: "opt_1",
        analysisId: "analysis_1",
        title: "Self-Watering Planter",
        shortExplanation: "Transform plastic bottle into a self-watering herb planter.",
        difficulty: "Easy",
        estimatedTime: "25 mins",
        materialsTools: JSON.stringify(["Plastic bottle", "Cotton string", "Potting soil"]),
        estimatedCost: "$0",
        stepByStep: JSON.stringify([
          { step: 1, instruction: "Cut bottle in half." },
          { step: 2, instruction: "Thread cotton wick through bottle cap." },
        ]),
        analysis: {
          id: "analysis_1",
          imageUrl: "https://blob.vercel-storage.com/waste-sample.jpg",
          detectedItem: "plastic water bottle",
          materialCategory: "plastic",
        },
      },
    },
    {
      id: "saved_2",
      userId: "user_123",
      transformationOptionId: "opt_2",
      createdAt: new Date("2026-11-21T10:00:00Z"),
      transformationOption: null, // edge case: deleted option
    },
  ];

  test("transforms raw database records with parsed JSON fields", () => {
    const parsedIdeas = mockDbRecords.map((item) => {
      if (!item.transformationOption) return item;
      return {
        ...item,
        transformationOption: {
          ...item.transformationOption,
          materialsTools: safeJsonParse(item.transformationOption.materialsTools, []),
          stepByStep: safeJsonParse(item.transformationOption.stepByStep, []),
        },
      };
    });

    assert.equal(parsedIdeas.length, 2);
    const first = parsedIdeas[0];
    assert.equal(first.id, "saved_1");
    assert.equal(Array.isArray(first.transformationOption.materialsTools), true);
    assert.equal(first.transformationOption.materialsTools.length, 3);
    assert.equal(first.transformationOption.materialsTools[0], "Plastic bottle");

    assert.equal(Array.isArray(first.transformationOption.stepByStep), true);
    assert.equal(first.transformationOption.stepByStep.length, 2);
    assert.equal(first.transformationOption.stepByStep[0].step, 1);

    // Analysis relations preserved
    assert.equal(first.transformationOption.analysis.detectedItem, "plastic water bottle");
    assert.equal(first.transformationOption.analysis.imageUrl, "https://blob.vercel-storage.com/waste-sample.jpg");

    // Null transformation option safely preserved
    assert.equal(parsedIdeas[1].transformationOption, null);
  });

  test("difficulty filters filter items correctly", () => {
    const items = [
      { id: "1", transformationOption: { difficulty: "Easy" } },
      { id: "2", transformationOption: { difficulty: "Medium" } },
      { id: "3", transformationOption: { difficulty: "Advanced" } },
    ];

    const filter = (diff) =>
      items.filter((s) => {
        if (diff === "ALL") return true;
        return (s.transformationOption?.difficulty || "").toLowerCase() === diff.toLowerCase();
      });

    assert.equal(filter("ALL").length, 3);
    assert.equal(filter("Easy").length, 1);
    assert.equal(filter("medium").length, 1);
    assert.equal(filter("Advanced").length, 1);
    assert.equal(filter("Expert").length, 0);
  });
});
