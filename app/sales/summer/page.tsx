import type { Metadata } from "next";

import { SalesLanding } from "@/components/sales-landing";
import { getCurrentUser } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getAccessories, getCustomerProfileByEmail, getPillows, getProducts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Summer Sale | Mattress, Pillow and Accessory Offers",
  description:
    "Explore Corebed summer sale offers across mattresses, pillows, and accessories with seasonal comfort-led product picks.",
  path: "/sales/summer",
  keywords: ["summer sale", "mattress sale", "cooling sleep deals", "seasonal offers"]
});

export default async function SummerSalePage() {
  const user = await getCurrentUser();
  const [products, pillows, accessories, exchangeRates, profile] = await Promise.all([
    getProducts(),
    getPillows(),
    getAccessories(),
    getExchangeRates(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null)
  ]);
  const saleProducts = [products[0], products[1], pillows[0], accessories[0]].filter(Boolean);

  return <SalesLanding season="summer" products={saleProducts} exchangeRates={exchangeRates} country={profile?.country} />;
}
