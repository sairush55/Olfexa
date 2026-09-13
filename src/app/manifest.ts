import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OLFEXA — Fragrance Intelligence",
    short_name: "OLFEXA",
    description: "Decode your fragrance. Choose with confidence. Scan perfume and attar labels to understand ingredients, allergens, and suitability.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfdfc",
    theme_color: "#065f46",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["lifestyle", "utilities", "health"],
  };
}
