import Link from "next/link";

import { createProductAction } from "@/app/actions/store";
import { AdminProductForm } from "@/components/admin-product-form";

export default async function AdminNewProductPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category ?? "Mattresses";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Products / New</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight">Add a new product</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate">
            Select a category to create a new listing. The variant matrix controls sizes, soft and hard options, pricing,
            and stock in one place.
          </p>
        </div>
        <Link
          href={`/admin/products?category=${category.toLowerCase()}`}
          className="rounded-full border border-ink/10 px-4 py-2 text-sm text-slate transition hover:bg-ivory"
        >
          Back to rows
        </Link>
      </div>

      <AdminProductForm
        action={createProductAction}
        defaultCategory={category}
        submitLabel="Create product"
        pendingLabel="Saving..."
      />
    </div>
  );
}
