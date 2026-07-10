import { getAdminEmails } from "@/lib/supabase/config";
import { getSupabaseUser } from "@/lib/supabase/server";

export async function getCurrentUser() {
  return getSupabaseUser();
}

export async function isAdminUser() {
  const user = await getCurrentUser();
  if (!user?.email) {
    return false;
  }

  return (
    getAdminEmails().includes(user.email.toLowerCase()) ||
    String(user.app_metadata?.role ?? user.user_metadata?.role ?? "").toLowerCase() === "admin"
  );
}

export async function requireAdminUser() {
  const user = await getCurrentUser();

  if (!user?.email) {
    return null;
  }

  const isAdmin =
    getAdminEmails().includes(user.email.toLowerCase()) ||
    String(user.app_metadata?.role ?? user.user_metadata?.role ?? "").toLowerCase() === "admin";

  return isAdmin ? user : null;
}
