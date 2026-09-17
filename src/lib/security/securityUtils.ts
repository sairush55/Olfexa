/**
 * OLFEXA Security & Sanitization Utilities
 * 
 * Production Protections:
 * 1. Image payload size & magic byte verification (Max 15MB, PNG/JPEG/WEBP/GIF only)
 * 2. OCR text sanitization (XSS neutralizer, SQL injection sanitizer, control character scrubber)
 * 3. In-memory sliding window rate limiter (anti-DoS / brute force defense)
 */

export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes
export const MAX_OCR_TEXT_LENGTH = 10000; // 10,000 characters

export interface ImageSafetyCheckResult {
  isSafe: boolean;
  format?: "jpeg" | "png" | "webp" | "gif";
  error?: string;
  byteLength: number;
}

/**
 * Validates image size and inspects file signature magic bytes.
 */
export function validateImageSafety(buffer: Buffer, maxBytes: number = MAX_IMAGE_SIZE_BYTES): ImageSafetyCheckResult {
  if (!buffer || buffer.length === 0) {
    return { isSafe: false, byteLength: 0, error: "Empty image payload." };
  }

  if (buffer.length > maxBytes) {
    return { 
      isSafe: false, 
      byteLength: buffer.length, 
      error: `Image size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum permitted limit of ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.` 
    };
  }

  // Check Magic Bytes
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { isSafe: true, format: "png", byteLength: buffer.length };
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { isSafe: true, format: "jpeg", byteLength: buffer.length };
  }

  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { isSafe: true, format: "webp", byteLength: buffer.length };
  }

  // GIF: GIF87a / GIF89a
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38
  ) {
    return { isSafe: true, format: "gif", byteLength: buffer.length };
  }

  return {
    isSafe: false,
    byteLength: buffer.length,
    error: "Invalid or unauthorized file format. Only JPEG, PNG, WEBP, and GIF images are permitted."
  };
}

/**
 * Sanitizes raw OCR text input to defend against XSS, SQL injection strings, and control character exploits.
 */
export function sanitizeOcrInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  let cleaned = input;

  // 1. Truncate to maximum permissible string length
  if (cleaned.length > MAX_OCR_TEXT_LENGTH) {
    cleaned = cleaned.substring(0, MAX_OCR_TEXT_LENGTH);
  }

  // 2. Scrub non-printable ASCII and dangerous control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 3. Neutralize script tags and HTML injection
  cleaned = cleaned
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "blocked-script:")
    .replace(/onerror\s*=/gi, "blocked-onerror=")
    .replace(/onload\s*=/gi, "blocked-onload=");

  // 4. Neutralize classic SQL injection delimiter meta-sequences
  cleaned = cleaned
    .replace(/;\s*DROP\s+TABLE\b/gi, "; BLOCKED_SQL")
    .replace(/UNION\s+ALL\s+SELECT\b/gi, "BLOCKED_SQL")
    .replace(/UNION\s+SELECT\b/gi, "BLOCKED_SQL")
    .replace(/'\s*OR\s*'1'\s*=\s*'1'/gi, "BLOCKED_SQL");

  return cleaned.trim();
}

/**
 * In-memory sliding window rate limiter
 */
interface RateLimitRecord {
  count: number;
  windowStartMs: number;
}

const RATE_LIMIT_STORE = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const record = RATE_LIMIT_STORE.get(key);

  if (!record || now - record.windowStartMs >= windowMs) {
    RATE_LIMIT_STORE.set(key, { count: 1, windowStartMs: now });
    return { allowed: true, remaining: maxRequests - 1, resetMs: windowMs };
  }

  if (record.count >= maxRequests) {
    const timeRemaining = windowMs - (now - record.windowStartMs);
    return { allowed: false, remaining: 0, resetMs: Math.max(timeRemaining, 0) };
  }

  record.count++;
  RATE_LIMIT_STORE.set(key, record);
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetMs: windowMs - (now - record.windowStartMs)
  };
}
