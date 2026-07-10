import type { Metadata } from "next";

import "./globals.css";
import { getCartSessionId } from "@/lib/cart-session";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { getCartDetail, getWishlistCount } from "@/lib/mock-store";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "CoreSleep Premium Mattress Studio",
  description: "Luxury mattress ecommerce redesign foundation for Corebed/CoreSleep."
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [cart, wishlistCount, isAdmin] = await Promise.all([
    getCartDetail(sessionId),
    getWishlistCount({ sessionId, userEmail: user?.email }),
    isAdminUser()
  ]);

  return (
    <html lang="en">
      <body className="page-shell font-sans text-ink">
        <SiteHeader
          cartCount={cart.items.reduce((total, item) => total + item.quantity, 0)}
          wishlistCount={wishlistCount}
          isLoggedIn={Boolean(user?.email)}
          isAdmin={isAdmin}
        />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
