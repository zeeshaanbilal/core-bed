"use client";

export type SupabaseBrowserClient = {
  auth: {
    signInWithPassword(credentials: { email: string; password: string }): Promise<{ error: { message: string } | null }>;
    signUp(payload: {
      email: string;
      password: string;
      options?: {
        emailRedirectTo?: string;
      };
    }): Promise<{ error: { message: string } | null }>;
    getUser(): Promise<{
      data: {
        user: {
          email?: string;
          app_metadata?: Record<string, unknown>;
          user_metadata?: Record<string, unknown>;
        } | null;
      };
    }>;
    signOut(): Promise<void>;
  };
} | null;

let browserClient: SupabaseBrowserClient = null;

export function getSupabaseBrowserClient(): SupabaseBrowserClient {
  return browserClient;
}
