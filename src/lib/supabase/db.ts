import { supabase, isSupabaseConfigured } from "./client";
import { AnalysisResult, ScanHistoryItem, WatchlistItem, UserProfile } from "@/types";

/**
 * Persists an analyzed fragrance dossier to Supabase if configured and authenticated.
 * Falls back to browser local storage.
 */
export async function saveScan(
  scan: AnalysisResult,
  userId?: string | null
): Promise<{ success: boolean; id: string; error?: string }> {
  // Always cache locally in browser storage for instant retrieval
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`olfexa_scan_${scan.id}`, JSON.stringify(scan));
      
      const localHistoryKey = "olfexa_local_scans";
      const existingRaw = localStorage.getItem(localHistoryKey);
      const existing: ScanHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      
      const historyItem: ScanHistoryItem = {
        id: scan.id,
        perfumeName: scan.perfumeName,
        brandName: scan.brandName,
        date: scan.scanDate || new Date().toISOString(),
        alcoholStatus: scan.alcoholStatus,
        allergenCount: scan.potentialAllergens?.length || 0,
        irritantCount: scan.potentialIrritants?.length || 0,
        watchlistMatchCount: scan.watchlistMatches?.length || 0,
        transparencyRating: scan.transparencyRating,
        imageUrl: scan.imageUrl,
      };

      const updated = [historyItem, ...existing.filter((s) => s.id !== scan.id)];
      localStorage.setItem(localHistoryKey, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not cache scan to local storage:", e);
    }
  }

  // If Supabase is configured and a user is signed in, persist to PostgreSQL
  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase.from("scans").upsert(
        {
          id: scan.id,
          user_id: userId,
          perfume_name: scan.perfumeName,
          brand_name: scan.brandName || null,
          image_url: scan.imageUrl || null,
          alcohol_status: scan.alcoholStatus,
          transparency_rating: scan.transparencyRating,
          allergen_count: scan.potentialAllergens?.length || 0,
          irritant_count: scan.potentialIrritants?.length || 0,
          watchlist_match_count: scan.watchlistMatches?.length || 0,
          full_data: scan,
          created_at: scan.scanDate || new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error("Supabase scan insert error:", error);
        return { success: false, id: scan.id, error: error.message };
      }
      return { success: true, id: scan.id };
    } catch (err: any) {
      console.error("Failed to persist scan to Supabase:", err);
      return { success: false, id: scan.id, error: err.message };
    }
  }

  return { success: true, id: scan.id };
}

/**
 * Retrieves past scans for a user from Supabase, or falls back to local storage.
 */
export async function getUserScans(userId?: string | null): Promise<ScanHistoryItem[]> {
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("id, perfume_name, brand_name, created_at, alcohol_status, allergen_count, irritant_count, watchlist_match_count, transparency_rating, image_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          perfumeName: row.perfume_name,
          brandName: row.brand_name,
          date: row.created_at,
          alcoholStatus: row.alcohol_status,
          allergenCount: row.allergen_count || 0,
          irritantCount: row.irritant_count || 0,
          watchlistMatchCount: row.watchlist_match_count || 0,
          transparencyRating: row.transparency_rating || "HIGH",
          imageUrl: row.image_url,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch scans from Supabase, falling back to local:", err);
    }
  }

  // Fallback to local storage
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem("olfexa_local_scans");
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.warn("Could not read local scans:", e);
    }
  }

  return [];
}

/**
 * Loads the complete AnalysisResult for a specific scan ID.
 */
export async function getScanById(id: string): Promise<AnalysisResult | null> {
  // 1. Check browser session storage first for fastest load
  if (typeof window !== "undefined") {
    try {
      const cached = sessionStorage.getItem(`olfexa_scan_${id}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Session storage lookup failed:", e);
    }
  }

  // 2. Fetch from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("full_data")
        .eq("id", id)
        .single();

      if (!error && data?.full_data) {
        return data.full_data as AnalysisResult;
      }
    } catch (err) {
      console.warn("Supabase scan lookup failed:", err);
    }
  }

  return null;
}

/**
 * Loads the user's personal ingredient watchlist from Supabase or local storage.
 */
export async function getWatchlist(userId?: string | null): Promise<WatchlistItem[]> {
  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("id, ingredient_name, reason, sensitivity_level, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          ingredientName: row.ingredient_name,
          reason: row.reason,
          sensitivityLevel: row.sensitivity_level,
          addedAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn("Failed to load watchlist from Supabase:", err);
    }
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("olfexa_watchlist");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load local watchlist:", e);
    }
  }

  return [];
}

/**
 * Adds an ingredient to the user's watchlist.
 */
export async function addToWatchlist(
  item: { ingredientName: string; reason?: string; sensitivityLevel: "mild" | "moderate" | "strict" },
  userId?: string | null
): Promise<WatchlistItem> {
  const newItem: WatchlistItem = {
    id: `w-${Date.now()}`,
    ingredientName: item.ingredientName.toUpperCase().trim(),
    reason: item.reason || "",
    sensitivityLevel: item.sensitivityLevel,
    addedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .insert({
          user_id: userId,
          ingredient_name: newItem.ingredientName,
          reason: newItem.reason,
          sensitivity_level: newItem.sensitivityLevel,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          ingredientName: data.ingredient_name,
          reason: data.reason,
          sensitivityLevel: data.sensitivity_level,
          addedAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn("Failed to add to Supabase watchlist:", err);
    }
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("olfexa_watchlist");
      const list: WatchlistItem[] = saved ? JSON.parse(saved) : [];
      const updated = [newItem, ...list.filter((w) => w.ingredientName !== newItem.ingredientName)];
      localStorage.setItem("olfexa_watchlist", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save local watchlist:", e);
    }
  }

  return newItem;
}

/**
 * Removes an ingredient from the user's watchlist.
 */
export async function removeFromWatchlist(id: string, userId?: string | null): Promise<boolean> {
  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (!error) return true;
    } catch (err) {
      console.warn("Failed to remove from Supabase watchlist:", err);
    }
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("olfexa_watchlist");
      if (saved) {
        const list: WatchlistItem[] = JSON.parse(saved);
        const updated = list.filter((w) => w.id !== id);
        localStorage.setItem("olfexa_watchlist", JSON.stringify(updated));
        return true;
      }
    } catch (e) {
      console.warn("Failed to update local watchlist:", e);
    }
  }

  return true;
}

/**
 * Loads user profile from Supabase.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name || "",
        fragranceExperience: data.fragrance_experience || "enthusiast",
        sensitivities: data.sensitivities || [],
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn("Failed to load user profile:", err);
  }

  return null;
}
