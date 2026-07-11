import type { Metadata } from "next";

import { SalesLanding } from "@/components/sales-landing";
import { getAccessories, getPillows, getProducts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Summer Sale | Mattress, Pillow and Accessory Offers",
  description:
    "Explore Corebed summer sale offers across mattresses, pillows, and accessories with seasonal comfort-led product picks.",
  path: "/sales/summer",
  keywords: ["summer sale", "mattress sale", "cooling sleep deals", "seasonal offers"]
});

export default async function SummerSalePage() {
  const [products, pillows, accessories] = await Promise.all([getProducts(), getPillows(), getAccessories()]);
  const saleProducts = [products[0], products[1], pillows[0], accessories[0]].filter(Boolean);

  return <SalesLanding season="summer" products={saleProducts} />;
}
