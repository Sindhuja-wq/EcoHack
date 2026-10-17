import { test, describe } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode("test-secret-key-32-characters-long-safe");

describe("Auth & Cryptographic Security", () => {
  test("bcrypt correctly hashes and validates passwords", async () => {
    const rawPassword = "StrongEcoPassword2026!";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notEqual(rawPassword, hash);
    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.equal(isValid, true);

    const isWrong = await bcrypt.compare("WrongPassword", hash);
    assert.equal(isWrong, false);
  });

  test("jose signs and verifies tamper-proof session tokens", async () => {
    const payload = {
      userId: "user_test_123",
      email: "guardian@ecohack.earth",
      role: "USER",
      name: "Eco Guardian",
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(SECRET_KEY);

    assert.equal(typeof token, "string");
    assert.ok(token.length > 20);

    const { payload: verified } = await jwtVerify(token, SECRET_KEY);
    assert.equal(verified.userId, payload.userId);
    assert.equal(verified.email, payload.email);
    assert.equal(verified.role, payload.role);
  });

  test("tampered token is strictly rejected", async () => {
    const token = await new SignJWT({ userId: "user_1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(SECRET_KEY);

    const tampered = token.slice(0, -5) + "abcde";
    await assert.rejects(async () => {
      await jwtVerify(tampered, SECRET_KEY);
    });
  });
});
