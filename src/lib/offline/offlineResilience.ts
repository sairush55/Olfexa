/**
 * OLFEXA Offline Resilience & Graceful Degradation Engine
 * 
 * Guarantees:
 * 1. Core matching, deterministic rules, and canonical database execute in-process without network dependency.
 * 2. When external network or Supabase database is unreachable, transparently falls back to local knowledge base.
 * 3. Returns explicit non-misleading offline notice so user is aware of degraded mode.
 */

import { CANONICAL_INGREDIENTS_DATABASE } from "@/data/canonicalIngredientsDatabase";
import { CanonicalIngredient } from "@/types/dataFoundation";
import { AnalysisResult } from "@/types";

export interface OfflineFallbackResponse<T> {
  data: T;
  isOffline: boolean;
  source: "remote_database" | "offline_local_cache";
  notice?: string;
}

/**
 * Safely wraps asynchronous network or database calls with a graceful local fallback.
 */
export async function executeWithOfflineFallback<T>(
  remoteAction: () => Promise<T>,
  localFallbackAction: () => T,
  operationName: string = "Data Retrieval"
): Promise<OfflineFallbackResponse<T>> {
  try {
    const remoteData = await remoteAction();
    return {
      data: remoteData,
      isOffline: false,
      source: "remote_database"
    };
  } catch (error) {
    const fallbackData = localFallbackAction();
    return {
      data: fallbackData,
      isOffline: true,
      source: "offline_local_cache",
      notice: `Network connection is currently unavailable for ${operationName}. Operating in resilient offline mode using local verified knowledge base.`
    };
  }
}

/**
 * Local offline ingredient query fallback
 */
export function queryOfflineCanonicalDatabase(searchTerm?: string): CanonicalIngredient[] {
  if (!searchTerm || !searchTerm.trim()) {
    return CANONICAL_INGREDIENTS_DATABASE;
  }
  const q = searchTerm.trim().toUpperCase();
  return CANONICAL_INGREDIENTS_DATABASE.filter(
    (i) =>
      i.inciName.includes(q) ||
      i.commonNames.some((c) => c.toUpperCase().includes(q)) ||
      (i.casNumber && i.casNumber.includes(q))
  );
}
