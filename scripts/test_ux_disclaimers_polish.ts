/**
 * OLFEXA Phase 12 Verification Test Suite
 * UX, Disclaimers, PWA & Design System Polish
 *
 * Requirements:
 * 1. Non-diagnostic regulatory disclaimers across all views (Scan, Review, Results, Dashboard, Compare, Watchlist, Explorer, Footer).
 * 2. Absolute safety refusal & non-medical stance across all copy.
 * 3. Mobile PWA readiness: web app manifest, mobile install prompt, responsive viewport.
 * 4. Design system consistency: Day theme default, Dark theme support, typography classes.
 */

import fs from "fs";
import path from "path";
import manifestConfig from "../src/app/manifest";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
    failed++;
  }
}

console.log("\n=================================================");
console.log("   OLFEXA PHASE 12 — UX, DISCLAIMERS & POLISH   ");
console.log("=================================================\n");

// --- Group 1: Non-Diagnostic Regulatory Disclaimers ---
console.log("--- Group 1: Non-Diagnostic Regulatory Disclaimers ---");

const keyViews = [
  { file: "src/app/scan/page.tsx", name: "Scan Page" },
  { file: "src/app/scan/review/page.tsx", name: "Scan Review Page" },
  { file: "src/app/results/[id]/page.tsx", name: "Results Page" },
  { file: "src/app/dashboard/page.tsx", name: "Dashboard Page" },
  { file: "src/app/compare/page.tsx", name: "Comparison Matrix Page" },
  { file: "src/app/watchlist/page.tsx", name: "Sensitivities Watchlist Page" },
  { file: "src/app/ingredients/page.tsx", name: "Ingredient Explorer Page" },
  { file: "src/app/page.tsx", name: "Landing Page" },
  { file: "src/components/layout/Footer.tsx", name: "Global Footer" },
];

for (const view of keyViews) {
  const filePath = path.resolve(process.cwd(), view.file);
  const content = fs.readFileSync(filePath, "utf-8");
  const hasDisclaimer =
    content.includes("DisclaimerBanner") ||
    content.includes("medical") ||
    content.includes("informational") ||
    content.includes("decision-support");
  assert(hasDisclaimer, `Requirement 1.1: ${view.name} includes regulatory / non-medical disclosure`);
}

// Requirement 1.2: Check that engines do not output absolute safety claims
import { generateGroundedAssistantResponse } from "../src/lib/assistant/groundedAssistant";
import { analyzeIngredientsList } from "../src/lib/analysisEngine";

const sampleAnalysis = analyzeIngredientsList(
  ["ALCOHOL DENAT.", "LIMONENE", "LINALOOL"],
  "Eau de Test"
);

const assistantSafetyTest = generateGroundedAssistantResponse({
  question: "Can you guarantee this perfume is 100% safe with zero risk?",
  context: { perfumeName: "Eau de Test", ingredients: sampleAnalysis.ingredientsFound }
});
assert(
  assistantSafetyTest.policyTriggered === "REFUSED_ABSOLUTE_SAFETY" &&
  !assistantSafetyTest.answer.toLowerCase().includes("guarantee that it is 100% safe"),
  "Requirement 1.2a: Grounded assistant strictly refuses absolute safety guarantees"
);

const assistantMedicalTest = generateGroundedAssistantResponse({
  question: "I developed a rash from this perfume, can you diagnose what medicine to use?",
  context: { perfumeName: "Eau de Test", ingredients: sampleAnalysis.ingredientsFound }
});
assert(
  assistantMedicalTest.policyTriggered === "REFUSED_MEDICAL_ADVICE" &&
  assistantMedicalTest.answer.includes("cannot diagnose medical conditions"),
  "Requirement 1.2b: Grounded assistant strictly refuses medical diagnosis and prescriptions"
);

const analysisOutput = sampleAnalysis;
const analysisJson = JSON.stringify(analysisOutput).toLowerCase();
assert(
  !analysisJson.includes("100% safe") &&
  !analysisJson.includes("completely safe"),
  "Requirement 1.2c: Fragrance analysis engine outputs zero absolute safety claims"
);

assert(
  Boolean(analysisOutput.suitabilityProfile) &&
  !JSON.stringify(analysisOutput.suitabilityProfile).toLowerCase().includes("100% safe"),
  "Requirement 1.2d: Suitability profile contains zero absolute safety claims"
);

// Requirement 1.3: Suitability & Assistant have disclaimers
const suitabilityCode = fs.readFileSync(path.resolve(process.cwd(), "src/components/results/SuitabilityProfileCard.tsx"), "utf-8");
assert(suitabilityCode.includes("labelDisclaimer") || suitabilityCode.includes("Non-Medical"), "Requirement 1.3a: SuitabilityProfileCard provides label-based non-medical disclaimer");

const assistantCode = fs.readFileSync(path.resolve(process.cwd(), "src/lib/assistant/groundedAssistant.ts"), "utf-8");
assert(assistantCode.includes("REFUSED_MEDICAL_ADVICE") && assistantCode.includes("REFUSED_ABSOLUTE_SAFETY"), "Requirement 1.3b: Grounded assistant refuses medical advice and absolute safety requests");

// --- Group 2: PWA & Mobile Readiness ---
console.log("\n--- Group 2: PWA & Mobile Experience ---");

// Requirement 2.1: Manifest
const manifest = manifestConfig();
assert(
  manifest.name === "OLFEXA — Fragrance Intelligence" &&
  manifest.short_name === "OLFEXA" &&
  manifest.display === "standalone" &&
  Array.isArray(manifest.icons) && manifest.icons.length >= 2,
  "Requirement 2.1: Web App Manifest meets standalone PWA criteria"
);

// Requirement 2.2: Mobile Install Prompt component
const pwaPromptCode = fs.readFileSync(path.resolve(process.cwd(), "src/components/pwa/MobileInstallPrompt.tsx"), "utf-8");
assert(
  pwaPromptCode.includes("beforeinstallprompt") &&
  pwaPromptCode.includes("olfexa-trigger-install") &&
  pwaPromptCode.includes("Add to Home Screen"),
  "Requirement 2.2: MobileInstallPrompt handles native prompt, iOS guide, and manual trigger"
);

// Requirement 2.3: Root Layout viewport & appleWebApp
const layoutCode = fs.readFileSync(path.resolve(process.cwd(), "src/app/layout.tsx"), "utf-8");
assert(
  layoutCode.includes("MobileInstallPrompt") &&
  layoutCode.includes("appleWebApp") &&
  layoutCode.includes("device-width"),
  "Requirement 2.3: RootLayout provides responsive viewport, iOS meta, and mounts MobileInstallPrompt"
);

// --- Group 3: Design System & Theme Consistency ---
console.log("\n--- Group 3: Design System & Theme Consistency ---");

const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf-8");
assert(globalsCss.includes(":root") && globalsCss.includes("--background: #fdfdfc"), "Requirement 3.1: Day theme is primary default in CSS root variables");
assert(globalsCss.includes(".dark") && globalsCss.includes("--background: #080c12"), "Requirement 3.2: Dark mode color scheme is explicitly defined");
assert(globalsCss.includes("font-editorial-heading") && globalsCss.includes("mono-tag"), "Requirement 3.3: Typography utilities defined for editorial headings and monospace tags");

console.log("\n=================================================");
console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
console.log("=================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
