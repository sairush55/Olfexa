"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/supabase/db";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isConfigured: false,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Load user profile when user changes
  const loadProfile = async (userId: string) => {
    try {
      const p = await getUserProfile(userId);
      if (p) setProfile(p);
    } catch (e) {
      console.warn("Could not fetch user profile:", e);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      // In offline/demo mode, check if a simulated user session exists
      if (typeof window !== "undefined") {
        const demoUser = localStorage.getItem("olfexa_demo_user");
        if (demoUser) {
          try {
            const parsed = JSON.parse(demoUser);
            setUser(parsed as any);
          } catch (e) {
            console.warn(e);
          }
        }
      }
      setIsLoading(false);
      return;
    }

    // Live Supabase Authentication listener
    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          loadProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error("Supabase getSession error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      // Simulated login fallback for local demo
      const simulatedUser = {
        id: "demo-user-1",
        email,
        user_metadata: { full_name: email.split("@")[0] },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("olfexa_demo_user", JSON.stringify(simulatedUser));
      }
      setUser(simulatedUser as any);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      setUser(data.user);
      setSession(data.session);
      if (data.user) loadProfile(data.user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isConfigured) {
      const simulatedUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("olfexa_demo_user", JSON.stringify(simulatedUser));
      }
      setUser(simulatedUser as any);
      return { error: null, needsEmailConfirmation: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      const needsEmailConfirmation = !data.session;
      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
      }

      return { error: null, needsEmailConfirmation };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Sign out error:", e);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("olfexa_demo_user");
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
