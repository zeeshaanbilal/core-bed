"use server";

import { redirect } from "next/navigation";

import { upsertCustomerProfile } from "@/lib/mock-store";
import { clearAuthCookies, setAuthCookies, signInWithPassword, signUpWithPassword } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const redirectTo = getString(formData, "redirect") || "/account";

  try {
    const session = await signInWithPassword(email, password);
    await setAuthCookies(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in";
    redirect(`/account/login?error=${encodeURIComponent(message)}&redirect=${encodeURIComponent(redirectTo)}`);
  }

  redirect(redirectTo);
}

export async function registerAction(formData: FormData) {
  const fullName = getString(formData, "fullName");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const addressLine1 = getString(formData, "addressLine1");
  const addressLine2 = getString(formData, "addressLine2");
  const city = getString(formData, "city");
  const state = getString(formData, "state");
  const postalCode = getString(formData, "postalCode");
  const country = getString(formData, "country") || "Pakistan";
  const password = getString(formData, "password");
  const confirmPassword = getString(formData, "confirmPassword");
  let sessionToSet:
    | {
        access_token: string;
        refresh_token: string;
        expires_in?: number;
      }
    | null = null;

  if (password !== confirmPassword) {
    redirect("/account/register?error=Passwords%20do%20not%20match");
  }

  try {
    const result = await signUpWithPassword(email, password, {
      full_name: fullName,
      phone,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      city,
      state,
      postal_code: postalCode,
      country
    });

    await upsertCustomerProfile({
      email,
      name: fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country
    });

    if (result.access_token && result.refresh_token) {
      sessionToSet = result as {
        access_token: string;
        refresh_token: string;
        expires_in?: number;
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account";
    redirect(`/account/register?error=${encodeURIComponent(message)}`);
  }

  if (sessionToSet) {
    await setAuthCookies(sessionToSet);
    redirect("/account");
  }

  redirect("/account/login?success=Account%20created.%20Please%20sign%20in.");
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/account/login?success=Signed%20out");
}
