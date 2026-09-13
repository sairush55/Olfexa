import { FragrancePersona } from "@/types";
import { 
  matchZodiacAttar, 
  zodiacRecommendations, 
  CANONICAL_FAMILIES, 
  CANONICAL_FAMILY_LABELS,
  ZODIAC_ENTERTAINMENT_DISCLAIMER 
} from "./zodiacAttarData";

export * from "./zodiacAttarData";

export const ZODIAC_PROFILES: Record<string, {
  element: "Fire" | "Earth" | "Air" | "Water";
  families: string[];
  vibe: string;
  intensity: FragrancePersona["intensityPreference"];
  occasions: string[];
  attar: string;
  perfume: string;
}> = {
  Aries: {
    element: "Fire",
    families: ["Warm Spicy", "Aromatic Citrus", "Smoky Woods"],
    vibe: "Bold, invigorating, energetic and direct.",
    intensity: "projective",
    occasions: ["Morning kickoff", "High-energy evenings", "Outdoor adventures"],
    attar: "Spiced Amber & Black Pepper Shamama",
    perfume: "Red Pepper, Vetiver & Cardamom Eau de Parfum"
  },
  Taurus: {
    element: "Earth",
    families: ["Rich Gourmand", "Velvety Rose", "Creamy Sandalwood"],
    vibe: "Luxurious, grounded, comforting and sensual.",
    intensity: "moderate",
    occasions: ["Intimate dinners", "Cozy autumn evenings", "Daily signature"],
    attar: "Mysore Sandalwood & Damask Rose Ruh",
    perfume: "Tonka Bean, Vanilla Bourbon & Iris Extrait"
  },
  Gemini: {
    element: "Air",
    families: ["Sparkling Citrus", "Crisp Green", "Light Aromatic Florals"],
    vibe: "Curious, versatile, breezy and playful.",
    intensity: "moderate",
    occasions: ["Social gatherings", "Workplace brainstorming", "Spring afternoons"],
    attar: "Neroli & Bergamot White Musk",
    perfume: "Grapefruit, Mint Leaf & Vetiver Eau Fraîche"
  },
  Cancer: {
    element: "Water",
    families: ["Lactonic White Florals", "Soft Musks", "Calming Marine Notes"],
    vibe: "Introspective, nurturing, deep and protective.",
    intensity: "subtle",
    occasions: ["Quiet evenings at home", "Rainy days", "Bedtime relaxation"],
    attar: "Mitti Attar (Baked Earth) & White Jasmine",
    perfume: "Orris Root, Salty Sea Spray & Cedarwood Cologne"
  },
  Leo: {
    element: "Fire",
    families: ["Golden Amber", "Solar Citrus", "Regal Frankincense"],
    vibe: "Radiant, magnetic, regal and unforgettable.",
    intensity: "intense",
    occasions: ["Red carpet events", "Celebrations", "Statement evenings"],
    attar: "Royal Oudh & Saffron Mukhallat",
    perfume: "Blood Orange, Ambergris & Cistus Labdanum"
  },
  Virgo: {
    element: "Earth",
    families: ["Clean Linen", "Herbal Lavender", "Dry Cedarwood"],
    vibe: "Polished, meticulous, refreshing and poised.",
    intensity: "subtle",
    occasions: ["Professional office settings", "Wellness mornings", "Mindful study"],
    attar: "Pure French Lavender & Green Vetiver Khus",
    perfume: "Bergamot, Clary Sage & White Cedar Eau de Toilette"
  },
  Libra: {
    element: "Air",
    families: ["Powdery Violet", "Airy Floral Chypre", "Harmonious Peony"],
    vibe: "Charming, artistic, balanced and romantic.",
    intensity: "moderate",
    occasions: ["Gallery openings", "Romantic date nights", "Sunday brunches"],
    attar: "Rose & Magnolia Attar in Jojoba Base",
    perfume: "Sparkling Pear, Jasmine Sambac & Light Patchouli"
  },
  Scorpio: {
    element: "Water",
    families: ["Dark Resins", "Smoky Incense", "Animalic Oudh", "Black Pepper"],
    vibe: "Enigmatic, hypnotic, magnetic and profound.",
    intensity: "intense",
    occasions: ["Late-night affairs", "Intimate winter gatherings", "Mysterious encounters"],
    attar: "Aged Cambodi Oudh & Dark Amber Resins",
    perfume: "Black Leather, Plum, Tobacco & Smoky Birch"
  },
  Sagittarius: {
    element: "Fire",
    families: ["Exotic Balsams", "Mediterranean Cypress", "Zesty Juniper"],
    vibe: "Adventurous, uplifting, free-spirited and optimistic.",
    intensity: "projective",
    occasions: ["International travels", "Festivals", "Weekend road trips"],
    attar: "Himalayan Juniper & Cedar Needle Attar",
    perfume: "Cardamom, Bitter Orange, Pine & Benzoin"
  },
  Capricorn: {
    element: "Earth",
    families: ["Structured Woody Chypre", "Smoked Oak", "Dry Leather"],
    vibe: "Disciplined, timeless, stately and authoritative.",
    intensity: "moderate",
    occasions: ["Boardroom negotiations", "Formal galas", "Signature everyday wear"],
    attar: "Vetiver Roots (Ruh Khus) & Dark Oakwood",
    perfume: "Florentine Iris, Vetiver, Cedar & Black Pepper"
  },
  Aquarius: {
    element: "Air",
    families: ["Ozonic Modern Florals", "Molecular Musks", "Mineralic Stone"],
    vibe: "Unconventional, visionary, futuristic and airy.",
    intensity: "moderate",
    occasions: ["Creative workshops", "Nighttime stargazing", "Indie cinema outings"],
    attar: "Mineralic Rain Mist & Synthetic Ambergris",
    perfume: "Iso E Super, Sea Salt, Sage & Modern Ambroxan"
  },
  Pisces: {
    element: "Water",
    families: ["Aquatic Lotus", "Dreamy Heliotrope", "Ethereal Sandalwood"],
    vibe: "Imaginative, compassionate, mystical and soothing.",
    intensity: "subtle",
    occasions: ["Meditative rituals", "Artistic creation", "Walks by the sea"],
    attar: "Blue Lotus & Golden Champa in Pure Sandalwood",
    perfume: "Water Lily, Coconut Water, Driftwood & Sheer Musk"
  }
};

/**
 * Generates an entertainment/discovery fragrance persona and attar recommendation.
 * Uses the deterministic zodiacAttarData engine.
 * Explicitly disclaimed from safety, allergen risk, or medical suitability.
 */
export function generateFragrancePersona(
  zodiacSign?: string,
  userFamily?: string | null,
  intensity?: FragrancePersona["intensityPreference"]
): FragrancePersona {
  const match = matchZodiacAttar(zodiacSign, userFamily);
  const sign = match.signCapitalized;

  const intensityMap: Record<string, FragrancePersona["intensityPreference"]> = {
    Strong: "intense",
    Moderate: "moderate",
    Soft: "subtle"
  };

  return {
    zodiacSign: sign,
    symbol: match.symbol,
    dateRange: match.dateRange,
    personaTraits: match.persona,
    description: match.description,
    scentFamilies: match.primaryFamilies,
    secondaryFamilies: match.secondaryFamilies,
    vibe: match.persona.join(" • "),
    intensityPreference: intensity || intensityMap[match.recommendation.intensity] || "moderate",
    attarIntensity: match.recommendation.intensity,
    suggestedOccasions: match.recommendation.occasions,
    attarRecommendation: match.recommendation.name,
    attarProfile: match.recommendation.profile,
    attarDescription: match.recommendation.description,
    selectedFamily: match.selectedFamily,
    isFallback: match.isFallback,
    fallbackMessage: match.fallbackMessage,
    disclaimer: ZODIAC_ENTERTAINMENT_DISCLAIMER
  };
}
