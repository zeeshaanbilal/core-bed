import type { Metadata } from "next";

import { SalesLanding } from "@/components/sales-landing";
import { getAccessories, getPillows, getProducts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Winter Sale | Mattress, Pillow and Accessory Offers",
  description:
    "Browse Corebed winter sale picks for mattresses, pillows, and accessories curated for seasonal comfort and value.",
  path: "/sales/winter",
  keywords: ["winter sale", "mattress offers", "sleep accessories sale", "seasonal comfort deals"]
});

export default async function WinterSalePage() {
  const [products, pillows, accessories] = await Promise.all([getProducts(), getPillows(), getAccessories()]);
  const saleProducts = [products[2], products[3], pillows[1], accessories[8]].filter(Boolean);

  return <SalesLanding season="winter" products={saleProducts} />;
}
