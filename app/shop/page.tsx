import type { Metadata } from "next";

import { MattressCatalog } from "@/components/mattress-catalog";
import { getCurrentUser } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getCustomerProfileByEmail, getProducts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";
import { getVisitorCountry } from "@/lib/visitor-country";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Mattresses | Cooling, Orthopedic and Premium Support",
  description:
    "Browse Corebed mattress collections with cooling, orthopedic, and premium support options across size and comfort variations.",
  path: "/shop",
  keywords: ["mattresses", "cooling mattress", "orthopedic mattress", "premium support mattress"]
});

export default async function ShopPage() {
  const user = await getCurrentUser();
  const [products, profile, exchangeRates] = await Promise.all([
    getProducts(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null),
    getExchangeRates()
  ]);
  const marketCountry = await getVisitorCountry(profile?.country);

  return <main><MattressCatalog products={products} country={marketCountry} exchangeRates={exchangeRates} /></main>;
}
