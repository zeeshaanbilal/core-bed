import { SalesLanding } from "@/components/sales-landing";
import { getAccessories, getPillows, getProducts } from "@/lib/mock-store";

export default async function SummerSalePage() {
  const [products, pillows, accessories] = await Promise.all([getProducts(), getPillows(), getAccessories()]);
  const saleProducts = [products[0], products[1], pillows[0], accessories[0]].filter(Boolean);

  return <SalesLanding season="summer" products={saleProducts} />;
}
