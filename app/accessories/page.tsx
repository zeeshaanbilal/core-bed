import type { Metadata } from "next";

import { AccessoryCatalog } from "@/components/accessory-catalog";
import { getCurrentUser } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getAccessories, getCustomerProfileByEmail } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";
import { getVisitorCountry } from "@/lib/visitor-country";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Accessories | Sleep and Support Accessories",
  description:
    "Shop Corebed accessories for bedroom comfort, posture support, and practical everyday sleep upgrades.",
  path: "/accessories",
  keywords: ["sleep accessories", "support accessories", "bedroom comfort", "orthopedic accessories"]
});

export default async function AccessoriesPage() {
  const user = await getCurrentUser();
  const [accessories, profile, exchangeRates] = await Promise.all([
    getAccessories(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null),
    getExchangeRates()
  ]);
  const marketCountry = await getVisitorCountry(profile?.country);

  return (
    <main>
      <AccessoryCatalog products={accessories} country={marketCountry} exchangeRates={exchangeRates} />
    </main>
  );
}
