import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Checks if live Supabase credentials are validly supplied
 * and not default placeholder strings.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes("your-project") || supabaseAnonKey.includes("your-anon-key")) {
    return false;
  }
  return supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;
};

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client instance if configured,
 * or creates a fallback client with safe stubs.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (clientInstance) {
    return clientInstance;
  }

  if (isSupabaseConfigured()) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return clientInstance;
  }

  // Graceful fallback dummy instance if credentials aren't yet configured
  // Allows the UI to compile, render, and guide the user without runtime exceptions
  clientInstance = createClient("https://placeholder-project.supabase.co", "placeholder-key-for-offline-mode", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return clientInstance;
};

export const supabase = getSupabaseClient();
