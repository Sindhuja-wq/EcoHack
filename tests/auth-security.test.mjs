import test from "node:test";
import assert from "node:assert/strict";
import {
  checkTargetedLoginRateLimit,
  checkGlobalLoginRateLimit,
  checkRegistrationRateLimit,
  _resetAuthMemoryStoreForTesting,
  checkUploadRateLimit,
  _resetUploadMemoryStoreForTesting,
  checkRateLimit,
  _resetMemoryStoreForTesting,
} from "../src/lib/ratelimit.ts";
import {
  getJwtSecretKey,
  DEV_FALLBACK_SECRET,
  signSessionToken,
  verifySessionToken,
} from "../src/lib/auth.ts";

// Helper to temporarily override environment variables safely
function withEnv(overrides, fn) {
  const original = {};
  for (const key of Object.keys(overrides)) {
    original[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }

  try {
    return fn();
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

async function withEnvAsync(overrides, fn) {
  const original = {};
  for (const key of Object.keys(overrides)) {
    original[key] = process.env[key];
    if (overrides[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = overrides[key];
    }
  }

  try {
    return await fn();
  } finally {
    for (const key of Object.keys(original)) {
      if (original[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = original[key];
      }
    }
  }
}

test("Targeted Login Limiter - Allows 5 attempts per (IP + email), blocks 6th", () => {
  _resetAuthMemoryStoreForTesting();
  const testIp = "192.0.2.10";
  const testEmail = "user1@ecohack.earth";

  // First 5 attempts must succeed
  for (let i = 1; i <= 5; i++) {
    const res = checkTargetedLoginRateLimit(testIp, testEmail);
    assert.equal(res.success, true, `Attempt #${i} should be allowed`);
    assert.equal(res.limit, 5);
    assert.equal(res.remaining, 5 - i);
    assert.ok(res.reset > 0);
  }

  // 6th attempt must be rejected
  const blocked = checkTargetedLoginRateLimit(testIp, testEmail);
  assert.equal(blocked.success, false, "6th targeted attempt must be blocked");
  assert.equal(blocked.remaining, 0);
});

test("Targeted Login Limiter - Isolated across different IPs (prevents account lockout DoS)", () => {
  _resetAuthMemoryStoreForTesting();
  const ipAttacker = "203.0.113.50";
  const ipVictim = "198.51.100.22";
  const targetEmail = "victim@ecohack.earth";

  // Attacker exhausts 5 attempts
  for (let i = 0; i < 5; i++) {
    checkTargetedLoginRateLimit(ipAttacker, targetEmail);
  }
  const attackerBlocked = checkTargetedLoginRateLimit(ipAttacker, targetEmail);
  assert.equal(attackerBlocked.success, false, "Attacker IP must be blocked");

  // Legitimate user from distinct IP must NOT be locked out
  const victimAllowed = checkTargetedLoginRateLimit(ipVictim, targetEmail);
  assert.equal(
    victimAllowed.success,
    true,
    "Innocent user from different IP must not be locked out"
  );
  assert.equal(victimAllowed.remaining, 4);
});

test("Targeted Login Limiter - Isolated across different emails from same IP", () => {
  _resetAuthMemoryStoreForTesting();
  const testIp = "192.0.2.99";

  // Exhaust email A
  for (let i = 0; i < 5; i++) {
    checkTargetedLoginRateLimit(testIp, "emailA@ecohack.earth");
  }
  assert.equal(
    checkTargetedLoginRateLimit(testIp, "emailA@ecohack.earth").success,
    false
  );

  // Email B from same IP has fresh quota
  const resB = checkTargetedLoginRateLimit(testIp, "emailB@ecohack.earth");
  assert.equal(resB.success, true);
  assert.equal(resB.remaining, 4);
});

test("Global Login IP Limiter - Enforces 15 attempts max per IP across all accounts", () => {
  _resetAuthMemoryStoreForTesting();
  const testIp = "192.0.2.77";

  // 15 attempts across various accounts
  for (let i = 1; i <= 15; i++) {
    const res = checkGlobalLoginRateLimit(testIp);
    assert.equal(res.success, true, `Global attempt #${i} should be allowed`);
    assert.equal(res.limit, 15);
    assert.equal(res.remaining, 15 - i);
  }

  // 16th attempt must be rejected
  const blocked = checkGlobalLoginRateLimit(testIp);
  assert.equal(blocked.success, false, "16th attempt from IP must be blocked");
  assert.equal(blocked.remaining, 0);
});

test("Global Login IP Limiter - Changing email addresses cannot bypass global IP limit", () => {
  _resetAuthMemoryStoreForTesting();
  const botIp = "198.51.100.88";

  // Attacker sprays 15 different accounts from the same IP
  for (let i = 1; i <= 15; i++) {
    const res = checkGlobalLoginRateLimit(botIp);
    assert.equal(res.success, true);
  }

  // Attempting a 16th distinct email from the same IP is blocked
  const sprayed = checkGlobalLoginRateLimit(botIp);
  assert.equal(
    sprayed.success,
    false,
    "Password spraying from single IP must be blocked regardless of email target"
  );
});

test("Registration Rate Limiter - Enforces 5 registrations per IP, blocks 6th", () => {
  _resetAuthMemoryStoreForTesting();
  const regIp = "192.0.2.15";

  for (let i = 1; i <= 5; i++) {
    const res = checkRegistrationRateLimit(regIp);
    assert.equal(res.success, true, `Registration #${i} should be allowed`);
    assert.equal(res.limit, 5);
    assert.equal(res.remaining, 5 - i);
  }

  const blocked = checkRegistrationRateLimit(regIp);
  assert.equal(blocked.success, false, "6th registration attempt must be blocked");
  assert.equal(blocked.remaining, 0);
});

test("Registration Rate Limiter - Isolated across different IPs", () => {
  _resetAuthMemoryStoreForTesting();
  const ip1 = "10.0.0.1";
  const ip2 = "10.0.0.2";

  for (let i = 0; i < 5; i++) {
    checkRegistrationRateLimit(ip1);
  }
  assert.equal(checkRegistrationRateLimit(ip1).success, false);

  const ip2Res = checkRegistrationRateLimit(ip2);
  assert.equal(ip2Res.success, true);
  assert.equal(ip2Res.remaining, 4);
});

test("Auth Rate Limiter - Window expiration resets quota cleanly", () => {
  _resetAuthMemoryStoreForTesting();
  const ip = "172.16.0.40";

  const res1 = checkRegistrationRateLimit(ip);
  assert.equal(res1.success, true);
  assert.equal(res1.remaining, 4);

  // Clear memory store to simulate window expiration
  _resetAuthMemoryStoreForTesting();

  const res2 = checkRegistrationRateLimit(ip);
  assert.equal(res2.success, true);
  assert.equal(res2.remaining, 4, "Quota should reset cleanly back to initial state");
});

test("Auth Rate Limiter - Independent from upload and waste-analysis rate limiters", () => {
  _resetAuthMemoryStoreForTesting();
  _resetUploadMemoryStoreForTesting();
  _resetMemoryStoreForTesting();

  const sharedIp = "192.168.1.100";
  const sharedReq = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": sharedIp },
  });

  // Consume auth login quota
  checkGlobalLoginRateLimit(sharedIp);

  // Upload quota must remain untouched
  const uploadRes = checkUploadRateLimit(`user:${sharedIp}`);
  assert.equal(uploadRes.success, true);
  assert.equal(uploadRes.remaining, 9);

  // Waste analysis quota must remain untouched
  const analysisRes = checkRateLimit(sharedReq);
  assert.equal(analysisRes.success, true);
  assert.equal(analysisRes.remaining, 14);
});

test("Strict JWT Secret - Production rejects missing JWT_SECRET", () => {
  withEnv({ NODE_ENV: "production", JWT_SECRET: undefined }, () => {
    assert.throws(
      () => getJwtSecretKey(),
      /FATAL SECURITY CONFIGURATION: JWT_SECRET environment variable is missing/
    );
  });
});

test("Strict JWT Secret - Production rejects blank / whitespace JWT_SECRET", () => {
  withEnv({ NODE_ENV: "production", JWT_SECRET: "   " }, () => {
    assert.throws(
      () => getJwtSecretKey(),
      /FATAL SECURITY CONFIGURATION: JWT_SECRET environment variable is missing/
    );
  });
});

test("Strict JWT Secret - Production rejects default development fallback secret", () => {
  withEnv({ NODE_ENV: "production", JWT_SECRET: DEV_FALLBACK_SECRET }, () => {
    assert.throws(
      () => getJwtSecretKey(),
      /FATAL SECURITY CONFIGURATION: The default development JWT_SECRET cannot be used in production/
    );
  });
});

test("Strict JWT Secret - Production rejects secret shorter than 32 characters", () => {
  withEnv({ NODE_ENV: "production", JWT_SECRET: "short-key-15-ch" }, () => {
    assert.throws(
      () => getJwtSecretKey(),
      /FATAL SECURITY CONFIGURATION: JWT_SECRET is too short/
    );
  });
});

test("Strict JWT Secret - Production accepts valid 32+ character secret", () => {
  const validSecret = "production-super-secret-key-that-is-at-least-32-chars-long!";
  withEnv({ NODE_ENV: "production", JWT_SECRET: validSecret }, () => {
    const key = getJwtSecretKey();
    assert.ok(key instanceof Uint8Array);
    assert.equal(key.length, Buffer.byteLength(validSecret));
  });
});

test("Strict JWT Secret - Development environment permits fallback secret safely", () => {
  withEnv({ NODE_ENV: "development", JWT_SECRET: undefined }, () => {
    const key = getJwtSecretKey();
    assert.ok(key instanceof Uint8Array);
    assert.equal(key.length, Buffer.byteLength(DEV_FALLBACK_SECRET));
  });
});

test("JWT Session Token - Signs and verifies round-trip safely with getJwtSecretKey", async () => {
  await withEnvAsync(
    {
      NODE_ENV: "test",
      JWT_SECRET: "custom-test-secret-key-with-over-32-characters-for-testing",
    },
    async () => {
      const payload = {
        userId: "user_test_999",
        email: "test@ecohack.earth",
        role: "ADMIN",
        name: "Test Admin",
      };

      const token = await signSessionToken(payload, false);
      assert.equal(typeof token, "string");
      assert.ok(token.length > 20);

      const verified = await verifySessionToken(token);
      assert.notEqual(verified, null);
      assert.equal(verified?.userId, payload.userId);
      assert.equal(verified?.email, payload.email);
      assert.equal(verified?.role, payload.role);
      assert.equal(verified?.name, payload.name);
    }
  );
});
