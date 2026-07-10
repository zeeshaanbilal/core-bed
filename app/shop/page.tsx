import { MattressCatalog } from "@/components/mattress-catalog";
import { getProducts } from "@/lib/mock-store";

export default async function ShopPage() {
  const products = await getProducts();

  return <main><MattressCatalog products={products} /></main>;
}
