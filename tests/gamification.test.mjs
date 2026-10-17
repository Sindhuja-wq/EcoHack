import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Level calculation tests
function calculateLevel(points) {
  const levels = [
    { level: 1, name: "Eco Seedling", min: 0, max: 150 },
    { level: 2, name: "Sprout Guardian", min: 150, max: 350 },
    { level: 3, name: "Waste Transformer", min: 350, max: 650 },
    { level: 4, name: "Circular Innovator", min: 650, max: 1000 },
    { level: 5, name: "Sustainability Master", min: 1000, max: 2000 },
  ];

  for (let i = 0; i < levels.length; i++) {
    const l = levels[i];
    if (points >= l.min && points < l.max) {
      const currentLevelPoints = points - l.min;
      const range = l.max - l.min;
      const progressPercent = Math.min(100, Math.round((currentLevelPoints / range) * 100));
      return { level: l.level, name: l.name, currentLevelPoints, nextLevelPoints: l.max, progressPercent };
    }
  }

  return {
    level: 6,
    name: "Planetary Champion",
    currentLevelPoints: points,
    nextLevelPoints: points + 500,
    progressPercent: 100,
  };
}

describe("Gamification & Level Calculations", () => {
  test("new user with 0 points is Level 1 Eco Seedling", () => {
    const res = calculateLevel(0);
    assert.equal(res.level, 1);
    assert.equal(res.name, "Eco Seedling");
    assert.equal(res.progressPercent, 0);
  });

  test("user with 150 points advances to Level 2 Sprout Guardian", () => {
    const res = calculateLevel(150);
    assert.equal(res.level, 2);
    assert.equal(res.name, "Sprout Guardian");
    assert.equal(res.progressPercent, 0);
  });

  test("user with 500 points is in Level 3 Waste Transformer", () => {
    const res = calculateLevel(500);
    assert.equal(res.level, 3);
    assert.equal(res.name, "Waste Transformer");
    assert.equal(res.progressPercent, 50); // (500-350)/(650-350) = 150/300 = 50%
  });

  test("user with 2500 points reaches top Level 6 Planetary Champion", () => {
    const res = calculateLevel(2500);
    assert.equal(res.level, 6);
    assert.equal(res.name, "Planetary Champion");
    assert.equal(res.progressPercent, 100);
  });
});
