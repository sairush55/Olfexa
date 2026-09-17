/**
 * OLFEXA Checkpoint 11: Performance, Offline & Security Test Suite
 * 
 * Verifies:
 * 1. Rapid response on repeated lookups (cache hit performance)
 * 2. App functions when network is simulated offline (graceful local degradation)
 * 3. Malicious / huge image rejected safely (size limit & magic bytes defense)
 * 4. SSRF attack URLs blocked (localhost, private subnets, cloud metadata, pseudoprotocols)
 * 5. SQL injection / XSS payloads sanitized from OCR input
 */

import { matchIngredientToken, getMatchCacheSize, clearMatchCache } from "../src/lib/matching-engine/matchingEngine";
import { executeWithOfflineFallback, queryOfflineCanonicalDatabase } from "../src/lib/offline/offlineResilience";
import { validateImageSafety, sanitizeOcrInput, checkRateLimit, MAX_IMAGE_SIZE_BYTES } from "../src/lib/security/securityUtils";
import { validateProductUrl } from "../src/lib/product-link/urlValidator";

async function runSecurityPerfOfflineTests() {
  console.log("=================================================");
  console.log("   OLFEXA PHASE 11 — SECURITY, PERF & OFFLINE    ");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${name}`);
      if (details) console.error(`    Details: ${details}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Rapid Response on Repeated Lookups (Cache Hit)
  // -------------------------------------------------------------
  console.log("\n--- Group 1: Lookup Caching & High-Speed Retrieval ---");

  clearMatchCache();
  const initialCacheSize = getMatchCacheSize();

  // First cold lookup
  const coldStart = performance.now();
  const coldResult = matchIngredientToken("LIMONENE");
  const coldDuration = performance.now() - coldStart;

  assert(
    "Requirement 1.1: Cold lookup populates in-memory cache",
    getMatchCacheSize() === initialCacheSize + 1 && coldResult.isKnown === true
  );

  // 1,000 warm cache-hit lookups
  const warmStart = performance.now();
  for (let i = 0; i < 1000; i++) {
    matchIngredientToken("LIMONENE");
  }
  const warmTotalDuration = performance.now() - warmStart;
  const avgWarmLookupMs = warmTotalDuration / 1000;

  assert(
    "Requirement 1.2: 1,000 warm cached lookups execute in sub-millisecond time (< 0.05ms avg)",
    avgWarmLookupMs < 0.05,
    `1,000 lookups completed in ${warmTotalDuration.toFixed(2)}ms (${avgWarmLookupMs.toFixed(4)}ms avg/op)`
  );

  // -------------------------------------------------------------
  // TEST 2: Offline Resilience & Graceful Degradation
  // -------------------------------------------------------------
  console.log("\n--- Group 2: Offline Resilience & Local Fallback ---");

  // Simulate network failure
  const failingRemoteFetch = async () => {
    throw new Error("ENOTFOUND: Simulated connection refused (Network is offline)");
  };

  const offlineResponse = await executeWithOfflineFallback(
    failingRemoteFetch,
    () => queryOfflineCanonicalDatabase("CITRAL"),
    "Regulatory Monograph Retrieval"
  );

  assert(
    "Requirement 2.1: Degrades gracefully when network fails without throwing unhandled error",
    offlineResponse.isOffline === true && offlineResponse.source === "offline_local_cache"
  );

  assert(
    "Requirement 2.2: Returns valid local canonical data during offline outage",
    offlineResponse.data.length > 0 && offlineResponse.data[0].inciName === "CITRAL"
  );

  assert(
    "Requirement 2.3: Includes non-misleading transparency notice informing user of offline mode",
    Boolean(offlineResponse.notice && offlineResponse.notice.includes("resilient offline mode"))
  );

  // -------------------------------------------------------------
  // TEST 3: Image Size Limits & File Type Security
  // -------------------------------------------------------------
  console.log("\n--- Group 3: Image Upload Size & Magic Byte Security ---");

  // 3a. Oversized image payload (20MB buffer)
  const hugeBuffer = Buffer.alloc(20 * 1024 * 1024);
  const hugeCheck = validateImageSafety(hugeBuffer);

  assert(
    "Requirement 3.1: Rejects oversized image buffer (> 15MB limit)",
    hugeCheck.isSafe === false && Boolean(hugeCheck.error?.includes("exceeds maximum permitted limit"))
  );

  // 3b. Malicious non-image executable (PE/ELF header simulation)
  const fakeExeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]); // "MZ" header
  const exeCheck = validateImageSafety(fakeExeBuffer);

  assert(
    "Requirement 3.2: Rejects unauthorized file format / binary executable",
    exeCheck.isSafe === false && Boolean(exeCheck.error?.includes("Only JPEG, PNG, WEBP, and GIF"))
  );

  // 3c. Valid PNG image magic bytes
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
  const pngCheck = validateImageSafety(validPngBuffer);

  assert(
    "Requirement 3.3: Accepts valid PNG image signature within size limits",
    pngCheck.isSafe === true && pngCheck.format === "png"
  );

  // -------------------------------------------------------------
  // TEST 4: SSRF Defense
  // -------------------------------------------------------------
  console.log("\n--- Group 4: SSRF Attack Protection ---");

  const ssrfAttacks = [
    "http://127.0.0.1/admin",
    "http://localhost:8080/metrics",
    "http://169.254.169.254/latest/meta-data", // Cloud metadata service
    "http://10.0.0.1/internal-api",
    "http://192.168.1.1/gateway",
    "javascript:alert(document.cookie)",
    "file:///etc/passwd",
    "gopher://evil.internal"
  ];

  let allSsrfBlocked = true;
  for (const url of ssrfAttacks) {
    const val = validateProductUrl(url);
    if (val.isValid) {
      allSsrfBlocked = false;
      console.error(`SSRF vulnerability: URL was NOT blocked: ${url}`);
    }
  }

  assert(
    "Requirement 4.1: Successfully blocks all SSRF, private subnet, and pseudo-protocol vectors",
    allSsrfBlocked
  );

  const validProductUrl = "https://www.fragrancex.com/products/chanel/bleu-de-chanel.html";
  assert(
    "Requirement 4.2: Valid public HTTPS product URL passes validation",
    validateProductUrl(validProductUrl).isValid === true
  );

  // -------------------------------------------------------------
  // TEST 5: Input Sanitization (XSS & SQL Injection Defense)
  // -------------------------------------------------------------
  console.log("\n--- Group 5: Input Sanitization & Anti-Injection ---");

  const maliciousInput = "<script>alert('XSS Attack!')</script> ALCOHOL DENAT. '; DROP TABLE users; -- <iframe src='evil.com'></iframe>";
  const sanitized = sanitizeOcrInput(maliciousInput);

  assert(
    "Requirement 5.1: Strips dangerous <script> and <iframe> tags from OCR input",
    !sanitized.includes("<script>") && !sanitized.includes("<iframe>")
  );

  assert(
    "Requirement 5.2: Neutralizes SQL injection delimiter sequence (DROP TABLE)",
    !sanitized.includes("; DROP TABLE") && sanitized.includes("BLOCKED_SQL")
  );

  assert(
    "Requirement 5.3: Preserves genuine cosmetic ingredient token",
    sanitized.includes("ALCOHOL DENAT.")
  );

  // -------------------------------------------------------------
  // TEST 6: Rate Limiting
  // -------------------------------------------------------------
  console.log("\n--- Group 6: API Rate Limiter ---");

  const testIp = "test-client-ip-99";
  let rateLimitTripped = false;

  for (let i = 0; i < 65; i++) {
    const rl = checkRateLimit(testIp, 60, 60000);
    if (!rl.allowed) {
      rateLimitTripped = true;
      break;
    }
  }

  assert(
    "Requirement 6.1: Rate limiter successfully trips after exceeding threshold (60 req/min)",
    rateLimitTripped
  );

  console.log("=================================================");
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityPerfOfflineTests();
