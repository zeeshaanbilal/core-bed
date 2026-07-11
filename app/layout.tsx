import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";
import { getCartSessionId } from "@/lib/cart-session";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { getCartDetail, getWishlistCount } from "@/lib/mock-store";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import LLM from "@/components/LLM";
import { StructuredData } from "@/components/structured-data";
import { buildMetadata, buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...buildMetadata({
    title: "Corebed Natural Mattress | Mattresses, Pillows and Sleep Accessories",
    description:
      "Explore Corebed mattresses, pillows, accessories, sleep guides, and embedded checkout with product-rich answers, SEO-ready structure, and dynamic catalog content.",
    path: "/",
    keywords: [
      "buy mattress online",
      "best mattress for back pain",
      "cooling pillow",
      "sleep accessories Pakistan",
      "natural mattress store"
    ]
  })
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CPSPLYDW2L"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CPSPLYDW2L');
          `}
        </Script>
        <StructuredData data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
        <SiteHeader
          cartCount={cart.items.reduce((total, item) => total + item.quantity, 0)}
          wishlistCount={wishlistCount}
          isLoggedIn={Boolean(user?.email)}
          isAdmin={isAdmin}
        />
        {children}
        <SiteFooter />
        <LLM />
      </body>
    </html>
  );
}
