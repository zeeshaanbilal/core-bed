import { SalesLanding } from "@/components/sales-landing";
import { getAccessories, getPillows, getProducts } from "@/lib/mock-store";

export default async function WinterSalePage() {
  const [products, pillows, accessories] = await Promise.all([getProducts(), getPillows(), getAccessories()]);
  const saleProducts = [products[2], products[3], pillows[1], accessories[8]].filter(Boolean);

  return <SalesLanding season="winter" products={saleProducts} />;
}
