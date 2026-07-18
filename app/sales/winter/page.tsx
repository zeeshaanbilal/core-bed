import type { Metadata } from "next";

import { SalesLanding } from "@/components/sales-landing";
import { getCurrentUser } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getAccessories, getCustomerProfileByEmail, getPillows, getProducts } from "@/lib/mock-store";
import { getSalesPageSetup, resolveSaleProducts } from "@/lib/page-setup";
import { buildMetadata } from "@/lib/seo";
import { getVisitorCountry } from "@/lib/visitor-country";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Winter Sale | Mattress, Pillow and Accessory Offers",
  description:
    "Browse Corebed winter sale picks for mattresses, pillows, and accessories curated for seasonal comfort and value.",
  path: "/sales/winter",
  keywords: ["winter sale", "mattress offers", "sleep accessories sale", "seasonal comfort deals"]
});

export default async function WinterSalePage() {
  const user = await getCurrentUser();
  const [products, pillows, accessories, exchangeRates, profile, setup] = await Promise.all([
    getProducts(),
    getPillows(),
    getAccessories(),
    getExchangeRates(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null),
    getSalesPageSetup("winter")
  ]);
  const marketCountry = await getVisitorCountry(profile?.country);
  const fallbackProducts = [products[2], products[3], pillows[1], accessories[8]].filter(Boolean);
  const saleProducts = resolveSaleProducts([...products, ...pillows, ...accessories], setup.productSlugs, fallbackProducts);

  return <SalesLanding season="winter" products={saleProducts} exchangeRates={exchangeRates} country={marketCountry} content={setup} />;
}
