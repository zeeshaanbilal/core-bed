import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteProductAction, updateProductAction } from "@/app/actions/store";
import { AdminProductForm } from "@/components/admin-product-form";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getExchangeRates } from "@/lib/exchange-rates";
import { convertCurrencyValue, formatCurrency } from "@/lib/format";
import { getCatalogProductBySlug } from "@/lib/mock-store";

export default async function AdminProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, exchangeRates] = await Promise.all([getCatalogProductBySlug(slug), getExchangeRates()]);

  if (!product) {
    notFound();
  }

  const liveUsdPrice = formatCurrency(convertCurrencyValue(product.price, "United States", exchangeRates), "United States");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Products / Details</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight">{product.name}</h2>
          <p className="mt-3 text-sm leading-7 text-slate">
            This is the full edit surface for the product. Content, pricing matrix, category, and stock can all be
            updated from here.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/products?category=${product.category.toLowerCase()}`}
            className="rounded-full border border-ink/10 px-4 py-2 text-sm text-slate transition hover:bg-ivory"
          >
            Back to rows
          </Link>
          <form action={deleteProductAction}>
            <input name="id" type="hidden" value={product.id} />
            <FormSubmitButton
              idleLabel="Delete product"
              pendingLabel="Deleting..."
              className="rounded-full border border-[#e8b5b5] px-4 py-2 text-sm text-[#8a2b2b]"
            />
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Category</p>
          <p className="mt-2 font-serif text-3xl text-ink">{product.category}</p>
        </article>
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Live base price</p>
          <p className="mt-2 font-serif text-3xl text-ink">{liveUsdPrice}</p>
        </article>
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Inventory</p>
          <p className="mt-2 font-serif text-3xl text-ink">{product.inventory}</p>
        </article>
        <article className="section-frame rounded-[1.5rem] p-5">
          <p className="text-sm text-slate">Variant rows</p>
          <p className="mt-2 font-serif text-3xl text-ink">{product.variants.length}</p>
        </article>
      </div>

      <AdminProductForm
        action={updateProductAction}
        exchangeRates={exchangeRates}
        hiddenId={product.id}
        product={product}
        submitLabel="Save product changes"
        pendingLabel="Updating..."
      />
    </div>
  );
}
