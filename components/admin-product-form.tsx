import type { ProductRecord } from "@/lib/store-types";
import { convertCurrencyValue, type ExchangeRates } from "@/lib/format";
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
  exchangeRates?: ExchangeRates;
};

export function AdminProductForm({
  action,
  submitLabel,
  pendingLabel,
  product,
  hiddenId,
  defaultCategory,
  exchangeRates
}: AdminProductFormProps) {
  const adminCountry = "United States";
  const adminPrice = product ? Number(convertCurrencyValue(product.price, adminCountry, exchangeRates).toFixed(2)) : "";
  const adminCompareAtPrice =
    product?.compareAtPrice && product.compareAtPrice > 0
      ? Number(convertCurrencyValue(product.compareAtPrice, adminCountry, exchangeRates).toFixed(2))
      : "";
  const adminVariantMatrix =
    product?.variantMatrix
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [sizeRaw, firmnessRaw, priceRaw, compareAtRaw, stockRaw, heightRaw] = line.split("|").map((item) => item.trim());
        const price = Number(priceRaw);
        const compareAt = Number(compareAtRaw);

        return [
          sizeRaw || "Standard",
          firmnessRaw || "Standard",
          Number.isFinite(price) && price > 0
            ? String(Number(convertCurrencyValue(price, adminCountry, exchangeRates).toFixed(2)))
            : "",
          Number.isFinite(compareAt) && compareAt > 0
            ? String(Number(convertCurrencyValue(compareAt, adminCountry, exchangeRates).toFixed(2)))
            : "",
          stockRaw || "0",
          heightRaw || "Standard"
        ].join("|");
      })
      .join("\n") ?? "";

  return (
    <form action={action} className="section-frame rounded-[1.75rem] p-6">
      {hiddenId ? <input name="id" type="hidden" value={hiddenId} /> : null}
      {product ? <input name="originalVariantMatrix" type="hidden" value={adminVariantMatrix} /> : null}

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
          defaultValue={adminPrice}
          name="price"
          placeholder="Fallback base price (USD)"
          required
          step="0.01"
          type="number"
        />
        <input
          className="rounded-2xl border border-ink/10 bg-white px-4 py-3"
          defaultValue={adminCompareAtPrice}
          name="compareAtPrice"
          placeholder="Fallback compare-at price (USD)"
          step="0.01"
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
          defaultValue={product?.status ?? "active"}
          name="status"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
        <div className="rounded-2xl border border-[#dfe8d7] bg-[#f7fbf3] px-4 py-3 text-sm leading-6 text-slate">
          Admin pricing is entered in USD. If you leave the matrix unchanged, the live variant rows regenerate from the
          fallback USD price, sizes, comfort options, and stock when you save.
        </div>
        <textarea
          className="min-h-44 rounded-2xl border border-ink/10 bg-white px-4 py-3 md:col-span-2"
          defaultValue={adminVariantMatrix}
          name="variantMatrix"
          placeholder={
            "One variant per line (USD)\nSingle|Soft|149.99|169.99|5|10 inch\nSingle|Hard|159.99|179.99|4|10 inch\nQueen|Soft|189.99|209.99|3|12 inch\nQueen|Hard|199.99|219.99|3|12 inch\nKing|Soft|239.99|259.99|2|14 inch\nKing|Hard|249.99|269.99|2|14 inch"
          }
        />
      </div>

      <p className="mt-4 text-sm text-slate">
        Live storefront prices still adapt per shopper country, but admin catalog prices are managed in{" "}
        <span className="font-semibold text-ink">USD</span>.
      </p>

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
