import type { Metadata } from "next";

import { AccessoryCatalog } from "@/components/accessory-catalog";
import { getCurrentUser } from "@/lib/auth";
import { getAccessories, getCustomerProfileByEmail } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Accessories | Sleep and Support Accessories",
  description:
    "Shop Corebed accessories for bedroom comfort, posture support, and practical everyday sleep upgrades.",
  path: "/accessories",
  keywords: ["sleep accessories", "support accessories", "bedroom comfort", "orthopedic accessories"]
});

export default async function AccessoriesPage() {
  const user = await getCurrentUser();
  const [accessories, profile] = await Promise.all([
    getAccessories(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null)
  ]);

  return (
    <main>
      <AccessoryCatalog products={accessories} country={profile?.country} />
    </main>
  );
}
