import test from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  getClientIp,
  _resetMemoryStoreForTesting,
} from "../src/lib/ratelimit.ts";

test("Rate Limiter - x-real-ip takes precedence over spoofed x-forwarded-for", () => {
  // Attacker sends forged X-Forwarded-For header to try to bypass rate limits,
  // but Vercel Edge sets trusted x-real-ip
  const req = new Request("http://localhost/api/waste/analyze", {
    headers: {
      "x-real-ip": "198.51.100.42",
      "x-forwarded-for": "203.0.113.99, 10.0.0.1",
    },
  });

  const ip = getClientIp(req);
  assert.equal(
    ip,
    "198.51.100.42",
    "x-real-ip must take precedence over client-supplied x-forwarded-for"
  );
});

test("Rate Limiter - x-vercel-forwarded-for takes precedence over untrusted x-forwarded-for", () => {
  const req = new Request("http://localhost/api/waste/analyze", {
    headers: {
      "x-vercel-forwarded-for": "198.51.100.77",
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    },
  });

  const ip = getClientIp(req);
  assert.equal(ip, "198.51.100.77");
});

test("Rate Limiter - Validates and normalizes IP format with safe fallbacks", () => {
  // Valid IPv4
  const reqV4 = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": "192.0.2.1" },
  });
  assert.equal(getClientIp(reqV4), "192.0.2.1");

  // Valid IPv6
  const reqV6 = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": "2001:db8::8a2e:370:7334" },
  });
  assert.equal(getClientIp(reqV6), "2001:db8::8a2e:370:7334");

  // Invalid / injected IP characters in x-real-ip fall back to valid x-forwarded-for
  const reqInjection = new Request("http://localhost/api/waste/analyze", {
    headers: {
      "x-real-ip": "<script>alert(1)</script>",
      "x-forwarded-for": "198.51.100.33",
    },
  });
  assert.equal(getClientIp(reqInjection), "198.51.100.33");

  // Completely missing or garbage headers fall back to "local"
  const reqEmpty = new Request("http://localhost/api/waste/analyze");
  assert.equal(getClientIp(reqEmpty), "local");

  const reqGarbage = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": "invalid-ip-string-without-dots-or-colons" },
  });
  assert.equal(getClientIp(reqGarbage), "local");
});

test("Rate Limiter - Enforces strict 15 requests per minute limit", () => {
  _resetMemoryStoreForTesting();
  const testIp = `192.0.2.${Math.floor(Math.random() * 200) + 1}`;

  // Make 15 requests - all must succeed
  for (let i = 1; i <= 15; i++) {
    const req = new Request("http://localhost/api/waste/analyze", {
      headers: { "x-real-ip": testIp },
    });
    const result = checkRateLimit(req);
    assert.equal(result.success, true, `Request #${i} should succeed`);
    assert.equal(result.limit, 15);
    assert.equal(result.remaining, 15 - i);
    assert.ok(result.reset > 0);
  }

  // 16th request must be rejected
  const reqOverLimit = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": testIp },
  });
  const blockedResult = checkRateLimit(reqOverLimit);
  assert.equal(blockedResult.success, false, "Request #16 must be rejected");
  assert.equal(blockedResult.remaining, 0);
});

test("Rate Limiter - Distinct IPs maintain independent quotas", () => {
  _resetMemoryStoreForTesting();
  const ipA = `10.1.1.${Math.floor(Math.random() * 200) + 1}`;
  const ipB = `10.2.2.${Math.floor(Math.random() * 200) + 1}`;

  // Exhaust IP A
  for (let i = 0; i < 15; i++) {
    const reqA = new Request("http://localhost/api/waste/analyze", {
      headers: { "x-real-ip": ipA },
    });
    checkRateLimit(reqA);
  }

  // IP A should be blocked
  const blockedA = checkRateLimit(
    new Request("http://localhost/api/waste/analyze", {
      headers: { "x-real-ip": ipA },
    })
  );
  assert.equal(blockedA.success, false);

  // IP B should still be allowed with full fresh quota
  const allowedB = checkRateLimit(
    new Request("http://localhost/api/waste/analyze", {
      headers: { "x-real-ip": ipB },
    })
  );
  assert.equal(allowedB.success, true);
  assert.equal(allowedB.remaining, 14);
});

test("Rate Limiter - Fixed-window counter expires and resets quota cleanly", () => {
  _resetMemoryStoreForTesting();
  const testIp = `172.16.0.${Math.floor(Math.random() * 200) + 1}`;

  // Use 1 request
  const req1 = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": testIp },
  });
  const res1 = checkRateLimit(req1);
  assert.equal(res1.success, true);
  assert.equal(res1.remaining, 14);

  // Clear memory store to simulate window expiration (expiresAt < now)
  _resetMemoryStoreForTesting();

  // Next request should start a fresh 15-request window
  const req2 = new Request("http://localhost/api/waste/analyze", {
    headers: { "x-real-ip": testIp },
  });
  const res2 = checkRateLimit(req2);
  assert.equal(res2.success, true);
  assert.equal(res2.remaining, 14, "Quota should reset back to 15 (remaining 14 after request)");
  assert.equal(res2.limit, 15);
});
