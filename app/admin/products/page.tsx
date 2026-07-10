import { createProductAction, deleteProductAction, updateProductAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { formatCurrency, getCatalogProducts } from "@/lib/mock-store";

export default async function AdminProductsPage() {
  const products = await getCatalogProducts();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Products</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Catalog management surface</h2>
      </div>

      <form action={createProductAction} className="section-frame rounded-[1.75rem] p-6">
        <p className="font-serif text-3xl">Create product</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="name" placeholder="Product name" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="slug" placeholder="slug" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="category" placeholder="Category" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="badge" placeholder="Badge" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="price" placeholder="Fallback price" required type="number" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="compareAtPrice" placeholder="Fallback compare-at price" type="number" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="firmness" placeholder="Comfort options e.g. Soft, Hard, Medium-Firm" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="material" placeholder="Material" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="image" placeholder="Primary image URL" required />
          <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="description" placeholder="Short description" required />
          <textarea className="min-h-32 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="longDescription" placeholder="Long description" required />
          <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="gallery" placeholder="Gallery URLs, one per line" />
          <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="features" placeholder="Features, one per line" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="sizes" placeholder="Sizes separated by commas" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="inventory" placeholder="Fallback inventory" type="number" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="feel" placeholder="Feel summary" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="support" placeholder="Best for / support note" />
          <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue="draft" name="status">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
          <textarea
            className="min-h-40 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2"
            name="variantMatrix"
            placeholder={
              "Variant matrix: one per line\nSingle|Soft|45000|52000|5|10 inch\nSingle|Hard|47000|54000|4|10 inch\nQueen|Soft|52000|59000|3|12 inch\nQueen|Hard|54000|61000|3|12 inch\nKing|Soft|61000|69000|2|14 inch\nKing|Hard|63500|71500|2|14 inch"
            }
          />
        </div>
        <p className="mt-4 text-sm leading-7 text-slate">
          If `variantMatrix` is filled, it will control the live pricing, stock, size row, and comfort row on the storefront. This is where you manage Single, Queen, King, Soft, and Hard combinations.
        </p>
        <div className="mt-5">
          <FormSubmitButton idleLabel="Create product" pendingLabel="Saving..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
        </div>
      </form>

      <div className="space-y-4">
        {products.map((product) => (
          <article key={product.id} className="section-frame rounded-[1.75rem] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-bronze">{product.category}</p>
                <h3 className="mt-3 font-serif text-3xl">{product.name}</h3>
                <p className="mt-2 text-sm text-slate">
                  {formatCurrency(product.price)} · {product.status} · stock {product.inventory}
                </p>
              </div>
              <form action={deleteProductAction}>
                <input name="id" type="hidden" value={product.id} />
                <FormSubmitButton idleLabel="Delete" pendingLabel="Deleting..." className="rounded-full border border-[#e8b5b5] px-4 py-2 text-sm text-[#8a2b2b]" />
              </form>
            </div>

            <form action={updateProductAction} className="mt-6 grid gap-4 md:grid-cols-2">
              <input name="id" type="hidden" value={product.id} />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.name} name="name" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.slug} name="slug" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.category} name="category" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.badge} name="badge" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.price} name="price" required type="number" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.compareAtPrice ?? ""} name="compareAtPrice" type="number" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.firmnessOptions.join(", ") || product.firmness} name="firmness" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.material} name="material" required />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={product.image} name="image" required />
              <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={product.description} name="description" required />
              <textarea className="min-h-32 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={product.longDescription} name="longDescription" required />
              <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.gallery.join("\n")} name="gallery" />
              <textarea className="min-h-28 rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.features.join("\n")} name="features" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.sizes.join(", ")} name="sizes" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.inventory} name="inventory" type="number" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.feel} name="feel" />
              <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.support} name="support" />
              <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={product.status} name="status">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <textarea className="min-h-40 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={product.variantMatrix ?? ""} name="variantMatrix" />
              <div className="md:col-span-2">
                <FormSubmitButton idleLabel="Update product" pendingLabel="Updating..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
              </div>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
