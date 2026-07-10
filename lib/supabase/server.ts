import { cookies } from "next/headers";

const ACCESS_COOKIE = "corebed-access-token";
const REFRESH_COOKIE = "corebed-refresh-token";

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type AuthSessionResponse = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: SupabaseAuthUser;
};

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

async function parseError(response: Response) {
  try {
    const payload = (await response.json()) as { error_description?: string; msg?: string; message?: string };
    return payload.error_description ?? payload.msg ?? payload.message ?? "Supabase request failed";
  } catch {
    return "Supabase request failed";
  }
}

export async function signInWithPassword(email: string, password: string) {
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: getSupabaseAnonKey(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AuthSessionResponse;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  metadata?: Record<string, string>
) {
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: getSupabaseAnonKey(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/account`
      }
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as Partial<AuthSessionResponse> & {
    user?: SupabaseAuthUser;
  };
}

export async function setAuthCookies(session: AuthSessionResponse) {
  const cookieStore = await cookies();
  const maxAge = session.expires_in ?? 60 * 60 * 24 * 7;

  cookieStore.set(ACCESS_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });

  cookieStore.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getSupabaseUser(): Promise<SupabaseAuthUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken || !getSupabaseUrl() || !getSupabaseAnonKey()) {
    return null;
  }

  const response = await fetch(`${getSupabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: getSupabaseAnonKey(),
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SupabaseAuthUser;
}

export async function getSupabaseServerClient() {
  return {
    auth: {
      getUser: async () => ({
        data: {
          user: await getSupabaseUser()
        }
      })
    }
  };
}
