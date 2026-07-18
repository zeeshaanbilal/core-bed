import type { Metadata } from "next";

import { PillowCatalog } from "@/components/pillow-catalog";
import { getCurrentUser } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getCustomerProfileByEmail, getPillows } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";
import { getVisitorCountry } from "@/lib/visitor-country";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Pillows | Cooling, Memory and Support Pillows",
  description:
    "Explore Corebed pillow options for cooling comfort, neck support, memory foam feel, and better sleep posture.",
  path: "/pillows",
  keywords: ["pillows", "memory foam pillow", "cooling pillow", "neck support pillow"]
});

export default async function PillowsPage() {
  const user = await getCurrentUser();
  const [pillows, profile, exchangeRates] = await Promise.all([
    getPillows(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null),
    getExchangeRates()
  ]);
  const marketCountry = await getVisitorCountry(profile?.country);

  return (
    <main>
      <PillowCatalog products={pillows} country={marketCountry} exchangeRates={exchangeRates} />
    </main>
  );
}
