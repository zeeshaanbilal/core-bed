import type { ProductRecord } from "@/lib/store-types";
import { FormSubmitButton } from "@/components/form-submit-button";

const productCategories = [
  { value: "Mattresses", label: "Mattresses" },
  { value: "Pillows", label: "Pillows" },
  { value: "Accessories", label: "Accessories" }
];

type AdminProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  pendingLabel: string;
  product?: ProductRecord;
  hiddenId?: string;
  defaultCategory?: string;
};

export function AdminProductForm({
  action,
  submitLabel,
  pendingLabel,
  product,
  hiddenId,
  defaultCategory
}: AdminProductFormProps) {
  return (
    <form action={action} className="section-frame rounded-[1.75rem] p-6">
      {hiddenId ? <input name="id" type="hidden" value={hiddenId} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.name ?? ""}
          name="name"
          placeholder="Product name"
          required
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.slug ?? ""}
          name="slug"
          placeholder="product-slug"
          required
        />
        <select
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.category ?? defaultCategory ?? "Mattresses"}
          name="category"
          required
        >
          {productCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.badge ?? ""}
          name="badge"
          placeholder="Badge"
          required
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.price ?? ""}
          name="price"
          placeholder="Fallback price"
          required
          type="number"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.compareAtPrice ?? ""}
          name="compareAtPrice"
          placeholder="Fallback compare-at price"
          type="number"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.firmnessOptions.join(", ") || product?.firmness || ""}
          name="firmness"
          placeholder="Comfort options e.g. Soft, Hard"
          required
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.material ?? ""}
          name="material"
          placeholder="Material"
          required
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"
          defaultValue={product?.image ?? ""}
          name="image"
          placeholder="Primary image URL"
          required
        />
        <textarea
          className="min-h-24 rounded-2xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"
          defaultValue={product?.description ?? ""}
          name="description"
          placeholder="Short description"
          required
        />
        <textarea
          className="min-h-32 rounded-2xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"
          defaultValue={product?.longDescription ?? ""}
          name="longDescription"
          placeholder="Long description"
          required
        />
        <textarea
          className="min-h-28 rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.gallery.join("\n") ?? ""}
          name="gallery"
          placeholder="Gallery URLs, one per line"
        />
        <textarea
          className="min-h-28 rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.features.join("\n") ?? ""}
          name="features"
          placeholder="Features, one per line"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.sizes.join(", ") ?? ""}
          name="sizes"
          placeholder="Sizes separated by commas"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.inventory ?? ""}
          name="inventory"
          placeholder="Fallback inventory"
          type="number"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.feel ?? ""}
          name="feel"
          placeholder="Feel summary"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.support ?? ""}
          name="support"
          placeholder="Best for / support note"
        />
        <select
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={product?.status ?? "draft"}
          name="status"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
        <div className="rounded-2xl border border-[#dfe8d7] bg-[#f7fbf3] px-4 py-3 text-sm leading-6 text-slate">
          Use `variantMatrix` below to control live size pricing, comfort options, and stock.
        </div>
        <textarea
          className="min-h-44 rounded-2xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"
          defaultValue={product?.variantMatrix ?? ""}
          name="variantMatrix"
          placeholder={
            "One variant per line\nSingle|Soft|45000|52000|5|10 inch\nSingle|Hard|47000|54000|4|10 inch\nQueen|Soft|52000|59000|3|12 inch\nQueen|Hard|54000|61000|3|12 inch\nKing|Soft|61000|69000|2|14 inch\nKing|Hard|63500|71500|2|14 inch"
          }
        />
      </div>

      <div className="mt-6">
        <FormSubmitButton
          idleLabel={submitLabel}
          pendingLabel={pendingLabel}
          className="rounded-full bg-ink px-5 py-3 text-sm text-ivory"
        />
      </div>
    </form>
  );
}
