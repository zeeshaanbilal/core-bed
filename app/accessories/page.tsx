import { AccessoryCatalog } from "@/components/accessory-catalog";
import { getAccessories } from "@/lib/mock-store";

export default async function AccessoriesPage() {
  const accessories = await getAccessories();

  return (
    <main>
      <AccessoryCatalog products={accessories} />
    </main>
  );
}
