# OLFEXA Ingredient Intelligence — Dataset Attribution & Licensing

This document records the provenance, licensing terms, and regulatory sources utilized in the OLFEXA structured ingredient intelligence layer.

---

## 1. European Commission CosIng Database
- **Provider**: European Commission — Directorate-General for Internal Market, Industry, Entrepreneurship and SMEs (DG GROW)
- **Content**: Cosmetic Ingredient Database (CosIng), European cosmetic nomenclature, functions, CAS numbers, EC numbers, and Annex II–VI restrictions under Regulation (EC) No 1223/2009.
- **License / Terms**: European Commission Legal Notice on reuse of public information (Decision 2011/833/EU).
- **Source URL**: [https://ec.europa.eu/growth/tools-databases/cosing/](https://ec.europa.eu/growth/tools-databases/cosing/)
- **Usage in OLFEXA**: Canonical INCI names, chemical identifiers (CAS / EC), cosmetic functions, and declared 26+ fragrance contact allergen classifications.

---

## 2. Open Beauty Facts
- **Provider**: Open Food Facts Non-Profit Association
- **Content**: Crowdsourced open cosmetic ingredient lists, product package scans, real-world formulation benchmarks, and alternative ingredient nomenclature.
- **License**: Open Database License (ODbL) v1.0 / Database Contents License (DbCL) 1.0.
- **Source URL**: [https://world.openbeautyfacts.org/](https://world.openbeautyfacts.org/)
- **Usage in OLFEXA**: Real-world packaging ingredient list validation, alternative multi-lingual ingredient declarations, and fragrance product comparisons.

---

## 3. INCIDB & Chemical Nomenclature Repositories
- **Provider**: Standard INCI dictionaries & PubChem (National Library of Medicine / NIH)
- **Content**: Canonical International Nomenclature of Cosmetic Ingredients (INCI), chemical synonyms, molecular formulas, and IUPAC names.
- **License / Terms**: Public domain / US Government Work (PubChem).
- **Source URL**: [https://pubchem.ncbi.nlm.nih.gov/](https://pubchem.ncbi.nlm.nih.gov/)
- **Usage in OLFEXA**: Normalization mapping from raw packaging tokens and chemical synonyms to canonical INCI standards.

---

## 4. International Fragrance Association (IFRA) Standards
- **Provider**: IFRA (International Fragrance Association)
- **Content**: 51st Amendment to the IFRA Standards (published June 2023).
- **License / Terms**: Publicly accessible safe-use concentration standards and quantitative risk assessments (QRA).
- **Source URL**: [https://ifrafragrance.org/safe-use/standards-documentation](https://ifrafragrance.org/safe-use/standards-documentation)
- **Usage in OLFEXA**: Quantitative risk and sensitization evidence for restricted fragrance compounds (e.g. atranol in Oakmoss, Isoeugenol, Cinnamal).

---

## 5. CDSCO / Bureau of Indian Standards (BIS)
- **Provider**: Central Drugs Standard Control Organisation (CDSCO), Ministry of Health and Family Welfare, Government of India
- **Content**: Drugs and Cosmetics Act & Rules, BIS Standard IS 4707 (Part 1: Classification of raw materials and applied restrictions; Part 2: List of raw materials generally safe and restricted).
- **Source URL**: [https://cdsco.gov.in/](https://cdsco.gov.in/)
- **Usage in OLFEXA**: Regional regulatory status and labeling requirements for consumer fragrance and cosmetic products marketed in India.

---

## 6. U.S. Food and Drug Administration (FDA)
- **Provider**: United States Food and Drug Administration (FDA) — Center for Food Safety and Applied Nutrition (CFSAN)
- **Content**: Federal Food, Drug, and Cosmetic Act (FD&C Act), Fair Packaging and Labeling Act (FPLA), and Modernization of Cosmetics Regulation Act (MoCRA).
- **Source URL**: [https://www.fda.gov/cosmetics](https://www.fda.gov/cosmetics)
- **Usage in OLFEXA**: U.S. fragrance declaration guidelines (blanket "Fragrance" labeling vs voluntary allergen disclosures) and alcohol denaturation specifications (SD Alcohol 40-B).

---

## Architectural Principle: Traceability & No Fabrication
1. Every canonical ingredient record in OLFEXA is tied to at least one verified regulatory source above.
2. If regulatory concentration thresholds or toxicological data are not published for a compound, OLFEXA explicitly marks the field as `INSUFFICIENT_DATA` or `NOT_SPECIFIED_ON_LABEL` rather than inventing speculative metrics.
