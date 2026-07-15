import type { Metadata } from "next";

import { CurrencyAmount } from "@/components/currency-amount";
import { getProducts } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Compare Corebed Mattresses | Firmness, Materials and Pricing",
  description:
    "Compare Corebed mattress models by firmness, material, price, and stock to choose the right support level for your bedroom.",
  path: "/compare",
  keywords: ["compare mattresses", "mattress comparison", "firmness comparison", "support comparison"]
});

export default async function ComparePage() {
  const products = (await getProducts()).slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Compare</p>
        <h1 className="mt-4 font-serif text-6xl leading-tight">Compare mattresses with clarity</h1>
        <p className="mt-6 text-base leading-8 text-slate">
          The requirements document asks for a mobile-safe compare tool with firmness, material, height, warranty and best-for fields. This page sets up that direction with the initial presentation layer.
        </p>
      </div>

      <div className="section-frame mt-12 overflow-hidden rounded-[1.75rem]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-ink text-ivory">
              <tr>
                <th className="px-6 py-4 text-sm font-medium">Model</th>
                <th className="px-6 py-4 text-sm font-medium">Firmness</th>
                <th className="px-6 py-4 text-sm font-medium">Material</th>
              <th className="px-6 py-4 text-sm font-medium">Price</th>
              <th className="px-6 py-4 text-sm font-medium">Inventory</th>
            </tr>
          </thead>
          <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-t border-ink/10">
                  <td className="px-6 py-5 font-serif text-2xl">{product.name}</td>
                  <td className="px-6 py-5 text-sm text-slate">{product.firmness}</td>
                  <td className="px-6 py-5 text-sm text-slate">{product.material}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-ink">
                    <CurrencyAmount value={product.price} />
                  </td>
                  <td className="px-6 py-5 text-sm text-slate">{product.inventory}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      </div>
    </main>
  );
}
