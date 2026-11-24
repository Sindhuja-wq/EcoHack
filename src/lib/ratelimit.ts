/**
 * EcoHack In-Memory Rate Limiting
 *
 * Implements a strict 15 requests-per-minute threshold for high-cost AI vision analysis.
 *
 * Current Architecture & Constraints:
 * - Operates entirely in-memory as a per-instance Fixed-Window Counter (15 requests per 60-second window).
 * - Per-instance limitation: In serverless environments (e.g. Vercel Functions), each execution
 *   container maintains its own in-memory map. Cold starts reset the counter, and concurrent
 *   containers do not share rate limit state. This implementation does NOT provide distributed
 *   protection across multiple serverless instances.
 * - Zero database overhead: Operates purely in application memory without storing ephemeral counters
 *   in the Neon PostgreSQL database, avoiding connection pool starvation and write amplification.
 * - Future distributed architecture: Can be upgraded to a distributed Redis store (e.g. Upstash Redis
 *   via REST) if multi-instance synchronization is required.
 */

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds (1 minute window)
const MAX_REQUESTS_PER_WINDOW = 15; // 15 requests per window

// In-memory fixed-window bucket store
const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Periodically purge expired rate limit entries to prevent unbounded memory growth.
 */
function pruneExpiredEntries(): void {
  const now = Date.now();
  for (const [key, record] of memoryStore.entries()) {
    if (record.expiresAt < now) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Basic IP format validator (IPv4 or IPv6)
 */
function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  // IPv4 check: 4 octets 0-255
  const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (ipv4Regex.test(ip)) return true;
  // IPv6 check: contains hex colons
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (ip.includes(":") && ipv6Regex.test(ip)) return true;
  return false;
}

/**
 * Extracts, validates, and normalizes the client IP address.
 *
 * Precedence:
 * 1. `x-real-ip`: Trusted edge-injected header from Vercel Edge / Cloudflare; cannot be
 *    overwritten or spoofed by client headers.
 * 2. `x-vercel-forwarded-for`: Vercel-specific forwarded header if available.
 * 3. `x-forwarded-for`: Fallback for local proxies / non-Vercel environments (takes the first token).
 * 4. Fallback to "local".
 */
export function getClientIp(request: Request): string {
  // 1. Prioritize trusted edge headers
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  const vercelForwarded = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelForwarded && isValidIp(vercelForwarded)) {
    return vercelForwarded;
  }

  // 2. Fallback to X-Forwarded-For (documented fallback only)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp && isValidIp(firstIp)) {
      return firstIp;
    }
  }

  // 3. Unrecognized or missing header fallback
  return "local";
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds when current fixed window expires
}

/**
 * Fixed-window rate limit checker for waste analysis.
 * Enforces a maximum of 15 requests per 60-second window per client IP.
 */
export function checkRateLimit(request: Request): RateLimitResult {
  const ip = getClientIp(request);
  const now = Date.now();

  // Prune expired entries when store exceeds 1000 keys
  if (memoryStore.size > 1000) {
    pruneExpiredEntries();
  }

  const record = memoryStore.get(ip);

  // New client or expired fixed window
  if (!record || record.expiresAt < now) {
    const expiresAt = now + RATE_LIMIT_WINDOW_MS;
    memoryStore.set(ip, { count: 1, expiresAt });
    return {
      success: true,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      reset: Math.ceil(expiresAt / 1000),
    };
  }

  // Fixed window limit reached
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      success: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      reset: Math.ceil(record.expiresAt / 1000),
    };
  }

  // Increment counter within current fixed window
  record.count += 1;
  return {
    success: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - record.count),
    reset: Math.ceil(record.expiresAt / 1000),
  };
}

/**
 * Reset memory store for test suite isolation
 */
export function _resetMemoryStoreForTesting(): void {
  memoryStore.clear();
}

const UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds (1 minute window)
const MAX_UPLOADS_PER_WINDOW = 10; // 10 uploads per window

// Dedicated upload memory store to isolate upload quotas
const uploadMemoryStore = new Map<string, RateLimitRecord>();

function pruneExpiredUploadEntries(): void {
  const now = Date.now();
  for (const [key, record] of uploadMemoryStore.entries()) {
    if (record.expiresAt < now) {
      uploadMemoryStore.delete(key);
    }
  }
}

/**
 * Fixed-window rate limit checker for authenticated file uploads.
 * Enforces a maximum of 10 uploads per 60-second window per user identifier.
 */
export function checkUploadRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();

  if (uploadMemoryStore.size > 1000) {
    pruneExpiredUploadEntries();
  }

  const record = uploadMemoryStore.get(identifier);

  // New client or expired fixed window
  if (!record || record.expiresAt < now) {
    const expiresAt = now + UPLOAD_RATE_LIMIT_WINDOW_MS;
    uploadMemoryStore.set(identifier, { count: 1, expiresAt });
    return {
      success: true,
      limit: MAX_UPLOADS_PER_WINDOW,
      remaining: MAX_UPLOADS_PER_WINDOW - 1,
      reset: Math.ceil(expiresAt / 1000),
    };
  }

  // Fixed window limit reached
  if (record.count >= MAX_UPLOADS_PER_WINDOW) {
    return {
      success: false,
      limit: MAX_UPLOADS_PER_WINDOW,
      remaining: 0,
      reset: Math.ceil(record.expiresAt / 1000),
    };
  }

  // Increment counter within current fixed window
  record.count += 1;
  return {
    success: true,
    limit: MAX_UPLOADS_PER_WINDOW,
    remaining: Math.max(0, MAX_UPLOADS_PER_WINDOW - record.count),
    reset: Math.ceil(record.expiresAt / 1000),
  };
}

/**
 * Reset upload memory store for test suite isolation
 */
export function _resetUploadMemoryStoreForTesting(): void {
  uploadMemoryStore.clear();
}

const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds (1 minute window)
const MAX_TARGETED_LOGIN_ATTEMPTS = 5; // 5 attempts per (IP + email) pair
const MAX_GLOBAL_LOGIN_ATTEMPTS = 15; // 15 attempts per IP across all accounts
const MAX_REGISTRATION_ATTEMPTS = 5; // 5 registrations per IP

// Dedicated auth memory store to isolate authentication rate limiting from upload & analysis quotas
const authMemoryStore = new Map<string, RateLimitRecord>();

function pruneExpiredAuthEntries(): void {
  const now = Date.now();
  for (const [key, record] of authMemoryStore.entries()) {
    if (record.expiresAt < now) {
      authMemoryStore.delete(key);
    }
  }
}

/**
 * Fixed-window rate limit checker for authentication operations.
 *
 * @param key Unique rate limiting key (e.g. `login:target:...`, `login:ip:...`, `register:ip:...`)
 * @param limit Maximum permitted attempts within the window
 * @param windowMs Window duration in milliseconds (defaults to 60,000ms / 1 minute)
 */
export function checkAuthRateLimit(
  key: string,
  limit: number,
  windowMs: number = AUTH_RATE_LIMIT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();

  if (authMemoryStore.size > 2000) {
    pruneExpiredAuthEntries();
  }

  const record = authMemoryStore.get(key);

  // New key or expired window
  if (!record || record.expiresAt < now) {
    const expiresAt = now + windowMs;
    authMemoryStore.set(key, { count: 1, expiresAt });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil(expiresAt / 1000),
    };
  }

  // Limit reached
  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(record.expiresAt / 1000),
    };
  }

  // Increment attempt counter within current window
  record.count += 1;
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - record.count),
    reset: Math.ceil(record.expiresAt / 1000),
  };
}

/**
 * Enforces targeted login limit: max 5 attempts per 60 seconds per (IP + normalized email).
 * Scoped by both IP and email to prevent distributed Denial-of-Service / account lockout attacks.
 */
export function checkTargetedLoginRateLimit(
  clientIp: string,
  normalizedEmail: string
): RateLimitResult {
  const key = `login:target:${clientIp.trim()}:${normalizedEmail.trim().toLowerCase()}`;
  return checkAuthRateLimit(key, MAX_TARGETED_LOGIN_ATTEMPTS);
}

/**
 * Enforces global login IP limit: max 15 attempts per 60 seconds per client IP across all emails.
 * Prevents password spraying across multiple user accounts from a single IP.
 */
export function checkGlobalLoginRateLimit(clientIp: string): RateLimitResult {
  const key = `login:ip:${clientIp.trim()}`;
  return checkAuthRateLimit(key, MAX_GLOBAL_LOGIN_ATTEMPTS);
}

/**
 * Enforces registration limit: max 5 account creation attempts per 60 seconds per client IP.
 * Prevents automated account creation spam while allowing genuine users to register or retry.
 */
export function checkRegistrationRateLimit(clientIp: string): RateLimitResult {
  const key = `register:ip:${clientIp.trim()}`;
  return checkAuthRateLimit(key, MAX_REGISTRATION_ATTEMPTS);
}

/**
 * Reset auth memory store for test suite isolation
 */
export function _resetAuthMemoryStoreForTesting(): void {
  authMemoryStore.clear();
}
