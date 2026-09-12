# OLFEXA — Fragrance Ingredient Intelligence Platform

> **Understand what you wear.**  
> Evidence-based cosmetic & fragrance ingredient intelligence.

---

## Overview

OLFEXA is a consumer decision-support and ingredient intelligence platform designed to decode complex fragrance packaging declarations into transparent, scientifically verified insights.

OLFEXA strictly avoids universal medical claims (e.g. *"This perfume is completely safe"* or *"This perfume is toxic to all"*). Instead, it communicates clear, evidence-grounded status definitions:
- *"Potential concern"*
- *"Ingredient detected"*
- *"No recognized alcohol ingredient detected in the provided ingredient information"*
- *"Unable to confirm"*
- *"Pay particular attention if you have a known sensitivity"*
- *"See evidence/source"*

---

## Core System Architecture

1. **Intake & OCR Layer (`/scan`)**:
   - Accepts image uploads (JPG, PNG, WEBP), camera captures, or manual ingredient inputs.
   - Extracts raw text using vision recognition without blindly trusting OCR artifacts.

2. **Ingredient Review Checkpoint (`/scan/review`)**:
   - Allows users to review, edit, remove misread tokens, and add missing declared ingredients prior to analysis.

3. **Deterministic Analysis Engine (`/lib/analysisEngine.ts`)**:
   - **Structured Alcohol Detection**: Chemically differentiates volatile ethyl alcohol and denatured alcohol (`Alcohol Denat.`) from non-drying conditioning fatty alcohols (`Cetyl Alcohol`, `Stearyl Alcohol`).
   - **EU Annex III Fragrance Allergens**: Flags recognized fragrance allergens subject to quantitative disclosure thresholds.
   - **Formula Transparency Score**: Evaluates declared chemical breakdowns against blanket umbrella declarations (`Parfum / Fragrance`).
   - **Personal Watchlist Matching**: Cross-references against user-specified sensitivity alerts.

4. **Results Dossier (`/results/[id]`)**:
   - Comprehensive status cards, formula composition fingerprint, expandable ingredient cards with why-flagged explanations, and direct links to peer-reviewed scientific citations (IFRA, EU SCCS, CIR).
   - Grounded AI explanation assistant answering queries without medical diagnostics.

5. **Cross-Fragrance Comparison (`/compare`)**:
   - Aligns two analyzed fragrances side-by-side to highlight common vs. unique constituents, alcohol profiles, and allergen overlaps.

6. **Sensitivity Watchlist (`/watchlist`) & Explorer (`/ingredients`)**:
   - Personal trigger management and an INCI regulatory reference dictionary.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## Regulatory Provenance & Evidence Standards

OLFEXA grounds all ingredient classifications in published international standards and monographs:
- **IFRA (International Fragrance Association)**: 51st Amendment Standards and quantitative limits.
- **European Commission Regulation (EC) No 1223/2009**: Annex III fragrance allergen listing.
- **EU Scientific Committee on Consumer Safety (SCCS)**: Opinion on Fragrance Allergens (SCCS/1459/11).
- **Cosmetic Ingredient Review (CIR)**: Independent expert panel safety assessments.

---

## Regulatory Stance & Disclaimer
OLFEXA is an evidence-based consumer decision-support platform designed to evaluate declared cosmetic ingredient disclosures. Analysis is strictly informational and does not constitute medical advice, allergy diagnostics, or absolute safety claims. Always review physical packaging and consult a certified healthcare professional if you have diagnosed contact allergies.
