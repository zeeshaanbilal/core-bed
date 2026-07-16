import Link from "next/link";

import { deleteProductAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { formatCurrency, getCatalogProducts } from "@/lib/mock-store";

const categoryFilters = [
  { slug: "all", label: "All products", match: null as string | null },
  { slug: "mattresses", label: "Mattresses", match: "Mattresses" },
  { slug: "pillows", label: "Pillows", match: "Pillows" },
  { slug: "accessories", label: "Accessories", match: "Accessories" }
];

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category ?? "all";
  const products = await getCatalogProducts();
  const activeFilter = categoryFilters.find((item) => item.slug === activeCategory) ?? categoryFilters[0];
  const filteredProducts = activeFilter.match
    ? products.filter((product) => product.category === activeFilter.match)
    : products;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Products</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight">Catalog control panel</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate">
            Choose a category first, then review the matching product rows in a clean listing view. Each product has a
            dedicated detail page where its full data can be updated.
          </p>
        </div>
        <Link
          href={`/admin/products/new${activeFilter.match ? `?category=${encodeURIComponent(activeFilter.match)}` : ""}`}
          className="inline-flex rounded-full bg-ink px-5 py-3 text-sm text-ivory"
        >
          Add new product
        </Link>
      </div>

      <div className="section-frame rounded-[1.75rem] p-4 sm:p-6">
        <div className="flex flex-wrap gap-3">
          {categoryFilters.map((filter) => {
            const isActive = filter.slug === activeFilter.slug;

            return (
              <Link
                key={filter.slug}
                href={filter.slug === "all" ? "/admin/products" : `/admin/products?category=${filter.slug}`}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  isActive ? "bg-ink text-ivory" : "border border-ink/10 bg-white text-slate hover:bg-ivory"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Showing</p>
          <p className="mt-2 font-serif text-4xl text-ink">{filteredProducts.length}</p>
          <p className="mt-2 text-sm text-slate">{activeFilter.label} currently visible in this view.</p>
        </article>
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Active products</p>
          <p className="mt-2 font-serif text-4xl text-ink">{filteredProducts.filter((product) => product.status === "active").length}</p>
          <p className="mt-2 text-sm text-slate">Live items currently available on storefront.</p>
        </article>
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Low stock</p>
          <p className="mt-2 font-serif text-4xl text-ink">{filteredProducts.filter((product) => product.inventory <= 6).length}</p>
          <p className="mt-2 text-sm text-slate">Rows needing restock attention.</p>
        </article>
      </div>

      <div className="section-frame overflow-hidden rounded-[1.75rem]">
        <div className="border-b border-ink/10 px-6 py-5">
          <h3 className="font-serif text-3xl text-ink">Product rows</h3>
          <p className="mt-2 text-sm text-slate">Click detail to open the full edit surface for any specific product.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink/10 text-left">
            <thead className="bg-[#f8f4ec] text-xs uppercase tracking-[0.2em] text-slate">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Variants</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 bg-white">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="align-top">
                  <td className="px-6 py-5">
                    <p className="font-medium text-ink">{product.name}</p>
                    <p className="mt-1 text-xs text-slate">{product.slug}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate">{product.category}</td>
                  <td className="px-6 py-5 text-sm text-slate">
                    <p>{formatCurrency(product.price)}</p>
                    {product.compareAtPrice ? (
                      <p className="text-xs text-slate line-through">{formatCurrency(product.compareAtPrice)}</p>
                    ) : null}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate">{product.inventory}</td>
                  <td className="px-6 py-5 text-sm text-slate">{product.variants.length}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs ${
                        product.status === "active"
                          ? "bg-[#eef7e4] text-[#5c7b34]"
                          : "bg-[#f5f0e8] text-slate"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink transition hover:bg-ivory"
                      >
                        Details
                      </Link>
                      <form action={deleteProductAction}>
                        <input name="id" type="hidden" value={product.id} />
                        <FormSubmitButton
                          idleLabel="Delete"
                          pendingLabel="Deleting..."
                          className="rounded-full border border-[#e8b5b5] px-4 py-2 text-sm text-[#8a2b2b]"
                        />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
