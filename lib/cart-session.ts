import { cookies } from "next/headers";

const CART_COOKIE = "corebed-cart-session";
const FALLBACK_SESSION_ID = "demo-session";

function createSessionId() {
  return `cart_${Math.random().toString(36).slice(2, 12)}`;
}

export async function getCartSessionId() {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? FALLBACK_SESSION_ID;
}

export async function ensureCartSessionId() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const sessionId = createSessionId();
  store.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return sessionId;
}
