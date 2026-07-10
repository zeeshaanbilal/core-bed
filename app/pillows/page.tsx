import { PillowCatalog } from "@/components/pillow-catalog";
import { getPillows } from "@/lib/mock-store";

export default async function PillowsPage() {
  const pillows = await getPillows();

  return (
    <main>
      <PillowCatalog products={pillows} />
    </main>
  );
}
