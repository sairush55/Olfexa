/**
 * OLFEXA — EXPLICIT ATTAR MATCHING DATASET & DETERMINISTIC ENGINE
 * 
 * CORE PRINCIPLE:
 * Strictly for fragrance discovery and entertainment only.
 * This dataset is deterministic: No AI/LLM calls, no randomness, no commercial claims.
 * 
 * STRICT ARCHITECTURAL SEPARATION:
 * Vision, OCR, chemical analysis, allergen/irritant detection, and the Suitability Profile
 * must NEVER consume this dataset. Only the Fragrance Persona feature consumes it.
 */

export type CanonicalFragranceFamily =
  | "oud"
  | "woody"
  | "amber"
  | "musk"
  | "floral"
  | "fresh"
  | "citrus"
  | "spicy"
  | "green"
  | "aquatic"
  | "powdery"
  | "earthy"
  | "aromatic"
  | "herbal";

export type StandardOccasion =
  | "Daily wear"
  | "College"
  | "Office"
  | "Daytime"
  | "Evening"
  | "Special occasions"
  | "Formal occasions"
  | "Traditional wear"
  | "Festive occasions"
  | "Casual occasions"
  | "Travel";

export type AttarIntensity = "Soft" | "Moderate" | "Strong";

export interface AttarRecommendation {
  name: string;
  family: CanonicalFragranceFamily | string;
  profile: string[];
  description: string;
  occasions: StandardOccasion[];
  intensity: AttarIntensity;
}

export interface ZodiacRecommendationData {
  sign: string;
  symbol: string;
  dateRange: string;
  persona: string[];
  description: string;
  primaryFamilies: (CanonicalFragranceFamily | string)[];
  secondaryFamilies: (CanonicalFragranceFamily | string)[];
  attarRecommendations: AttarRecommendation[];
}

export const CANONICAL_FAMILIES: CanonicalFragranceFamily[] = [
  "oud",
  "woody",
  "amber",
  "musk",
  "floral",
  "fresh",
  "citrus",
  "spicy",
  "green",
  "aquatic",
  "powdery",
  "earthy",
  "aromatic",
  "herbal",
];

export const CANONICAL_FAMILY_LABELS: Record<CanonicalFragranceFamily, string> = {
  oud: "Oud & Agarwood",
  woody: "Woody",
  amber: "Amber & Resins",
  musk: "Musk",
  floral: "Floral",
  fresh: "Fresh",
  citrus: "Citrus",
  spicy: "Warm Spicy",
  green: "Green & Botanical",
  aquatic: "Aquatic & Marine",
  powdery: "Powdery",
  earthy: "Earthy (Mitti)",
  aromatic: "Aromatic",
  herbal: "Herbal",
};

export const STANDARDIZED_OCCASIONS: StandardOccasion[] = [
  "Daily wear",
  "College",
  "Office",
  "Daytime",
  "Evening",
  "Special occasions",
  "Formal occasions",
  "Traditional wear",
  "Festive occasions",
  "Casual occasions",
  "Travel",
];

export const zodiacRecommendations: ZodiacRecommendationData[] = [
  {
    sign: "aries",
    symbol: "♈",
    dateRange: "Mar 21 – Apr 19",

    persona: ["Bold", "Energetic", "Adventurous"],

    description:
      "A bold and energetic fragrance personality that suits expressive, noticeable scent profiles.",

    primaryFamilies: ["spicy", "woody", "oud"],

    secondaryFamilies: ["citrus", "amber"],

    attarRecommendations: [
      {
        name: "Saffron Oud Attar",
        family: "oud",
        profile: ["Oud", "Saffron", "Warm", "Woody"],
        description:
          "A rich and energetic oud profile with warm saffron character.",
        occasions: ["Evening", "Festive occasions", "Special occasions"],
        intensity: "Strong"
      },
      {
        name: "Spicy Woody Attar",
        family: "spicy",
        profile: ["Spicy", "Woody", "Warm"],
        description:
          "A warm spicy-woody profile with a confident character.",
        occasions: ["Evening", "Traditional wear"],
        intensity: "Strong"
      }
    ]
  },

  {
    sign: "taurus",
    symbol: "♉",
    dateRange: "Apr 20 – May 20",

    persona: ["Grounded", "Elegant", "Sensual"],

    description:
      "A preference for warm, earthy and refined fragrance profiles with a smooth character.",

    primaryFamilies: ["woody", "earthy", "musk"],

    secondaryFamilies: ["floral", "amber"],

    attarRecommendations: [
      {
        name: "Sandalwood Attar",
        family: "woody",
        profile: ["Sandalwood", "Creamy", "Woody", "Warm"],
        description:
          "A smooth sandalwood-inspired profile with a calm and refined character.",
        occasions: ["Daily wear", "Traditional wear", "Evening"],
        intensity: "Moderate"
      },
      {
        name: "Mitti Attar",
        family: "earthy",
        profile: ["Earthy", "Warm", "Mineral"],
        description:
          "An earthy fragrance style inspired by the scent of rain-soaked earth.",
        occasions: ["Daily wear", "Casual occasions"],
        intensity: "Moderate"
      }
    ]
  },

  {
    sign: "gemini",
    symbol: "♊",
    dateRange: "May 21 – Jun 20",

    persona: ["Curious", "Playful", "Versatile"],

    description:
      "A versatile fragrance personality suited to fresh, lively and easy-to-wear scent profiles.",

    primaryFamilies: ["citrus", "fresh", "green"],

    secondaryFamilies: ["floral", "aromatic"],

    attarRecommendations: [
      {
        name: "Citrus Fresh Attar",
        family: "citrus",
        profile: ["Citrus", "Fresh", "Bright"],
        description:
          "A bright citrus-inspired profile with a fresh character.",
        occasions: ["Daily wear", "College", "Casual occasions"],
        intensity: "Soft"
      },
      {
        name: "Green Fresh Attar",
        family: "green",
        profile: ["Green", "Fresh", "Aromatic"],
        description:
          "A clean green fragrance profile with a lively character.",
        occasions: ["Daily wear", "Daytime", "Casual occasions"],
        intensity: "Soft"
      }
    ]
  },

  {
    sign: "cancer",
    symbol: "♋",
    dateRange: "Jun 21 – Jul 22",

    persona: ["Gentle", "Comforting", "Intuitive"],

    description:
      "A soft and comforting fragrance personality suited to smooth, gentle scent profiles.",

    primaryFamilies: ["musk", "floral", "powdery"],

    secondaryFamilies: ["fresh", "amber"],

    attarRecommendations: [
      {
        name: "White Musk Attar",
        family: "musk",
        profile: ["Musk", "Clean", "Soft", "Powdery"],
        description:
          "A soft musk-inspired profile with a clean and comforting character.",
        occasions: ["Daily wear", "College", "Casual occasions"],
        intensity: "Soft"
      },
      {
        name: "Soft Floral Attar",
        family: "floral",
        profile: ["Floral", "Soft", "Fresh"],
        description:
          "A delicate floral profile designed around a gentle fragrance character.",
        occasions: ["Daytime", "Casual occasions"],
        intensity: "Soft"
      }
    ]
  },

  {
    sign: "leo",
    symbol: "♌",
    dateRange: "Jul 23 – Aug 22",

    persona: ["Bold", "Warm", "Luxurious"],

    description:
      "A confident fragrance personality suited to rich, warm and noticeable fragrance profiles.",

    primaryFamilies: ["oud", "amber", "woody", "spicy"],

    secondaryFamilies: ["musk", "floral"],

    attarRecommendations: [
      {
        name: "Oud Attar",
        family: "oud",
        profile: ["Oud", "Woody", "Warm", "Deep"],
        description:
          "A rich woody oud profile with a strong and luxurious character.",
        occasions: ["Evening", "Special occasions", "Traditional wear"],
        intensity: "Strong"
      },
      {
        name: "Amber Attar",
        family: "amber",
        profile: ["Amber", "Warm", "Sweet", "Resinous"],
        description:
          "A warm amber-inspired profile with a rich and inviting character.",
        occasions: ["Evening", "Festive occasions"],
        intensity: "Strong"
      }
    ]
  },

  {
    sign: "virgo",
    symbol: "♍",
    dateRange: "Aug 23 – Sep 22",

    persona: ["Refined", "Clean", "Thoughtful"],

    description:
      "A preference for clean, balanced and understated fragrance profiles.",

    primaryFamilies: ["green", "woody", "fresh"],

    secondaryFamilies: ["musk", "herbal"],

    attarRecommendations: [
      {
        name: "Vetiver Attar",
        family: "woody",
        profile: ["Vetiver", "Earthy", "Woody", "Fresh"],
        description:
          "A refined woody-earthy fragrance profile with a fresh character.",
        occasions: ["Daily wear", "Office", "Daytime"],
        intensity: "Moderate"
      },
      {
        name: "Green Herbal Attar",
        family: "green",
        profile: ["Green", "Herbal", "Fresh"],
        description:
          "A clean green profile with an understated aromatic character.",
        occasions: ["Daily wear", "College", "Daytime"],
        intensity: "Soft"
      }
    ]
  },

  {
    sign: "libra",
    symbol: "♎",
    dateRange: "Sep 23 – Oct 22",

    persona: ["Elegant", "Balanced", "Charming"],

    description:
      "A balanced fragrance personality suited to elegant floral, musk and warm fragrance profiles.",

    primaryFamilies: ["floral", "musk", "amber"],

    secondaryFamilies: ["woody", "powdery"],

    attarRecommendations: [
      {
        name: "Jasmine Attar",
        family: "floral",
        profile: ["Jasmine", "Floral", "Soft", "Elegant"],
        description:
          "A floral-inspired profile with a soft and elegant character.",
        occasions: ["Daytime", "Special occasions", "Traditional wear"],
        intensity: "Moderate"
      },
      {
        name: "Soft Musk Attar",
        family: "musk",
        profile: ["Musk", "Clean", "Soft", "Warm"],
        description:
          "A smooth musk profile designed around a subtle and elegant character.",
        occasions: ["Daily wear", "Evening"],
        intensity: "Soft"
      }
    ]
  },

  {
    sign: "scorpio",
    symbol: "♏",
    dateRange: "Oct 23 – Nov 21",

    persona: ["Mysterious", "Intense", "Magnetic"],

    description:
      "A preference for deep, rich and intense fragrance profiles with strong character.",

    primaryFamilies: ["oud", "musk", "amber", "spicy"],

    secondaryFamilies: ["woody", "saffron"],

    attarRecommendations: [
      {
        name: "Oud Musk Attar",
        family: "oud",
        profile: ["Oud", "Musk", "Woody", "Deep"],
        description:
          "A deep woody-musky profile with a distinctive character.",
        occasions: ["Evening", "Special occasions"],
        intensity: "Strong"
      },
      {
        name: "Amber Musk Attar",
        family: "amber",
        profile: ["Amber", "Musk", "Warm", "Sweet"],
        description:
          "A warm amber-musk profile with a rich fragrance character.",
        occasions: ["Evening", "Festive occasions"],
        intensity: "Strong"
      }
    ]
  },

  {
    sign: "sagittarius",
    symbol: "♐",
    dateRange: "Nov 22 – Dec 21",

    persona: ["Adventurous", "Free-spirited", "Optimistic"],

    description:
      "A lively fragrance personality suited to fresh, aromatic and energetic scent profiles.",

    primaryFamilies: ["citrus", "fresh", "aromatic", "spicy"],

    secondaryFamilies: ["woody", "green"],

    attarRecommendations: [
      {
        name: "Citrus Aromatic Attar",
        family: "citrus",
        profile: ["Citrus", "Aromatic", "Fresh", "Bright"],
        description:
          "A lively citrus-aromatic profile with a fresh character.",
        occasions: ["Daytime", "Travel", "Casual occasions"],
        intensity: "Soft"
      },
      {
        name: "Spicy Fresh Attar",
        family: "spicy",
        profile: ["Spicy", "Fresh", "Aromatic"],
        description:
          "A lively combination of freshness and warm spice.",
        occasions: ["Evening", "Casual occasions"],
        intensity: "Moderate"
      }
    ]
  },

  {
    sign: "capricorn",
    symbol: "♑",
    dateRange: "Dec 22 – Jan 19",

    persona: ["Classic", "Confident", "Reserved"],

    description:
      "A classic fragrance personality suited to structured, woody and sophisticated scent profiles.",

    primaryFamilies: ["woody", "oud", "amber"],

    secondaryFamilies: ["musk", "spicy"],

    attarRecommendations: [
      {
        name: "Classic Oud Attar",
        family: "oud",
        profile: ["Oud", "Woody", "Deep", "Classic"],
        description:
          "A classic woody oud profile with a sophisticated character.",
        occasions: ["Formal occasions", "Evening", "Traditional wear"],
        intensity: "Strong"
      },
      {
        name: "Woody Amber Attar",
        family: "amber",
        profile: ["Woody", "Amber", "Warm", "Rich"],
        description:
          "A refined woody-amber profile with a classic fragrance character.",
        occasions: ["Office", "Evening", "Formal occasions"],
        intensity: "Moderate"
      }
    ]
  },

  {
    sign: "aquarius",
    symbol: "♒",
    dateRange: "Jan 20 – Feb 18",

    persona: ["Modern", "Independent", "Unconventional"],

    description:
      "A modern fragrance personality suited to fresh, aromatic and less conventional scent profiles.",

    primaryFamilies: ["fresh", "citrus", "green", "aromatic"],

    secondaryFamilies: ["woody", "aquatic"],

    attarRecommendations: [
      {
        name: "Fresh Citrus Attar",
        family: "citrus",
        profile: ["Citrus", "Fresh", "Clean", "Bright"],
        description:
          "A modern fresh citrus profile with a clean character.",
        occasions: ["College", "Daily wear", "Daytime"],
        intensity: "Soft"
      },
      {
        name: "Green Aromatic Attar",
        family: "green",
        profile: ["Green", "Aromatic", "Fresh"],
        description:
          "A fresh green aromatic profile with a modern character.",
        occasions: ["Daily wear", "Casual occasions"],
        intensity: "Soft"
      }
    ]
  },

  {
    sign: "pisces",
    symbol: "♓",
    dateRange: "Feb 19 – Mar 20",

    persona: ["Dreamy", "Gentle", "Romantic"],

    description:
      "A soft and expressive fragrance personality suited to floral, aquatic and gentle musk profiles.",

    primaryFamilies: ["floral", "aquatic", "musk"],

    secondaryFamilies: ["soft amber", "powdery"],

    attarRecommendations: [
      {
        name: "Soft Floral Attar",
        family: "floral",
        profile: ["Floral", "Soft", "Romantic"],
        description:
          "A gentle floral-inspired profile with a soft and expressive character.",
        occasions: ["Daytime", "Casual occasions", "Special occasions"],
        intensity: "Soft"
      },
      {
        name: "Musk Floral Attar",
        family: "musk",
        profile: ["Musk", "Floral", "Soft", "Clean"],
        description:
          "A smooth musk-floral profile with a gentle fragrance character.",
        occasions: ["Daily wear", "Evening"],
        intensity: "Soft"
      }
    ]
  }
];

export const ZODIAC_ENTERTAINMENT_DISCLAIMER =
  "Zodiac recommendations are for entertainment and fragrance discovery only. They do not determine safety, suitability, or medical concerns.";

export const UNSUPPORTED_FAMILY_FALLBACK_MESSAGE =
  "We couldn't find a strong match for this fragrance direction. Here's your zodiac-inspired recommendation instead.";

/**
 * Normalizes input fragrance family string to canonical ID.
 * Rejects irregular alternatives like 'wood', 'woods', 'oudh', etc.
 */
export function normalizeFamilyId(raw?: string | null): CanonicalFragranceFamily | string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim().toLowerCase();

  const ALIAS_MAP: Record<string, CanonicalFragranceFamily> = {
    "wood": "woody",
    "woods": "woody",
    "woody-fragrance": "woody",
    "oudh": "oud",
    "musk-based": "musk",
    "citrusy": "citrus",
    "spices": "spicy",
    "spice": "spicy",
    "soft amber": "amber",
  };

  if (ALIAS_MAP[trimmed]) {
    return ALIAS_MAP[trimmed];
  }

  return trimmed;
}

export interface ZodiacAttarMatchResult {
  sign: string;
  signCapitalized: string;
  symbol: string;
  dateRange: string;
  persona: string[];
  description: string;
  primaryFamilies: string[];
  secondaryFamilies: string[];
  selectedFamily: string | null;
  isFallback: boolean;
  fallbackMessage?: string;
  recommendation: AttarRecommendation;
  allAttarRecommendations: AttarRecommendation[];
  score: number;
  disclaimer: string;
}

/**
 * Deterministic recommendation matching engine.
 * Priority:
 *   User-selected family
 *           ↓
 *   Matching attar style
 *           ↓
 *   Zodiac primary family
 *           ↓
 *   Zodiac default attar
 * 
 * Rules:
 * Case 1 — Zodiac only:
 *   Returns default attar (attarRecommendations[0]).
 * Case 2 — Zodiac + primary family:
 *   Returns attar matching primary family (score = 100 if first primary, else 90).
 * Case 3 — Zodiac + secondary family:
 *   If matching attar exists in sign recommendations, return it (score = 70).
 *   Otherwise return default attar.
 * Case 4 — Unsupported family:
 *   If no compatible attar exists:
 *   Show fallback guidance message and return zodiac default (attarRecommendations[0], score = 0).
 */
export function matchZodiacAttar(
  rawSign?: string,
  rawUserFamily?: string | null
): ZodiacAttarMatchResult {
  const cleanSign = (rawSign || "leo").trim().toLowerCase();
  const zodiac =
    zodiacRecommendations.find((z) => z.sign.toLowerCase() === cleanSign) ||
    zodiacRecommendations.find((z) => z.sign.toLowerCase() === "leo")!;

  const signCapitalized = zodiac.sign.charAt(0).toUpperCase() + zodiac.sign.slice(1);
  const normalizedFamily = normalizeFamilyId(rawUserFamily);

  // Case 1 — Zodiac only (no family selected)
  if (!normalizedFamily || normalizedFamily === "") {
    return {
      sign: zodiac.sign,
      signCapitalized,
      symbol: zodiac.symbol,
      dateRange: zodiac.dateRange,
      persona: zodiac.persona,
      description: zodiac.description,
      primaryFamilies: zodiac.primaryFamilies as string[],
      secondaryFamilies: zodiac.secondaryFamilies as string[],
      selectedFamily: null,
      isFallback: false,
      recommendation: zodiac.attarRecommendations[0],
      allAttarRecommendations: zodiac.attarRecommendations,
      score: 100,
      disclaimer: ZODIAC_ENTERTAINMENT_DISCLAIMER,
    };
  }

  // Case 2 & 3: Check if an attar recommendation directly matches the user's family
  const directMatch = zodiac.attarRecommendations.find(
    (attar) => attar.family.toLowerCase() === normalizedFamily
  );

  if (directMatch) {
    let score = 0;
    if (zodiac.primaryFamilies[0]?.toLowerCase() === normalizedFamily) {
      score = 100;
    } else if (zodiac.primaryFamilies.some((f) => f.toLowerCase() === normalizedFamily)) {
      score = 90;
    } else if (zodiac.secondaryFamilies.some((f) => f.toLowerCase() === normalizedFamily)) {
      score = 70;
    } else {
      score = 0;
    }

    return {
      sign: zodiac.sign,
      signCapitalized,
      symbol: zodiac.symbol,
      dateRange: zodiac.dateRange,
      persona: zodiac.persona,
      description: zodiac.description,
      primaryFamilies: zodiac.primaryFamilies as string[],
      secondaryFamilies: zodiac.secondaryFamilies as string[],
      selectedFamily: normalizedFamily,
      isFallback: false,
      recommendation: directMatch,
      allAttarRecommendations: zodiac.attarRecommendations,
      score,
      disclaimer: ZODIAC_ENTERTAINMENT_DISCLAIMER,
    };
  }

  // Check if family is in primary or secondary families even if no dedicated attar exists
  const isPrimary = zodiac.primaryFamilies.some((f) => f.toLowerCase() === normalizedFamily);
  const isSecondary = zodiac.secondaryFamilies.some((f) => f.toLowerCase() === normalizedFamily);

  if (isPrimary || isSecondary) {
    // Check if another attar profile includes this family keyword
    const profileMatch = zodiac.attarRecommendations.find((attar) =>
      attar.profile.some((p) => p.toLowerCase() === normalizedFamily)
    );

    const score = isPrimary
      ? zodiac.primaryFamilies[0]?.toLowerCase() === normalizedFamily
        ? 100
        : 90
      : 70;

    return {
      sign: zodiac.sign,
      signCapitalized,
      symbol: zodiac.symbol,
      dateRange: zodiac.dateRange,
      persona: zodiac.persona,
      description: zodiac.description,
      primaryFamilies: zodiac.primaryFamilies as string[],
      secondaryFamilies: zodiac.secondaryFamilies as string[],
      selectedFamily: normalizedFamily,
      isFallback: false,
      recommendation: profileMatch || zodiac.attarRecommendations[0],
      allAttarRecommendations: zodiac.attarRecommendations,
      score,
      disclaimer: ZODIAC_ENTERTAINMENT_DISCLAIMER,
    };
  }

  // Case 4 — Unsupported family
  // Show fallback guidance and return zodiac default (attarRecommendations[0])
  return {
    sign: zodiac.sign,
    signCapitalized,
    symbol: zodiac.symbol,
    dateRange: zodiac.dateRange,
    persona: zodiac.persona,
    description: zodiac.description,
    primaryFamilies: zodiac.primaryFamilies as string[],
    secondaryFamilies: zodiac.secondaryFamilies as string[],
    selectedFamily: normalizedFamily,
    isFallback: true,
    fallbackMessage: UNSUPPORTED_FAMILY_FALLBACK_MESSAGE,
    recommendation: zodiac.attarRecommendations[0],
    allAttarRecommendations: zodiac.attarRecommendations,
    score: 0,
    disclaimer: ZODIAC_ENTERTAINMENT_DISCLAIMER,
  };
}
