import Image from "next/image";
import Link from "next/link";

import { addToCartAction, addWishlistAction } from "@/app/actions/store";
import { CurrencyAmount } from "@/components/currency-amount";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ExchangeRates } from "@/lib/format";
import type { ProductRecord } from "@/lib/store-types";

export function ProductCard({
  product,
  country,
  exchangeRates
}: {
  product: ProductRecord;
  country?: string;
  exchangeRates?: ExchangeRates;
}) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-ink/10 bg-ivory shadow-soft transition duration-300 hover:-translate-y-1">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-ivory px-3 py-2 text-xs uppercase tracking-[0.25em] text-ink">
          {product.badge}
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-ink/80 px-3 py-2 text-xs uppercase tracking-[0.25em] text-ivory">
          {product.reviewCount} reviews
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">{product.category}</p>
          <Link href={`/shop/${product.slug}`} className="font-serif text-3xl leading-tight text-ink">
            {product.name}
          </Link>
          <p className="text-sm leading-7 text-slate">{product.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-ink/10 bg-sand p-4 text-sm text-slate">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-bronze">Firmness</p>
            <p>{product.firmness}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-bronze">Material</p>
            <p>{product.material}</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold text-ink">
              <CurrencyAmount value={product.price} country={country} exchangeRates={exchangeRates} />
            </p>
            {product.compareAtPrice ? (
              <p className="text-sm text-slate line-through">
                <CurrencyAmount value={product.compareAtPrice} country={country} exchangeRates={exchangeRates} />
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <form action={addWishlistAction}>
              <input name="productSlug" type="hidden" value={product.slug} />
              <FormSubmitButton
                idleLabel="Save"
                pendingLabel="Saving..."
                className="rounded-full border border-ink/15 px-4 py-3 text-sm text-ink transition hover:bg-sand"
              />
            </form>
            <form action={addToCartAction}>
              <input name="productSlug" type="hidden" value={product.slug} />
              <input name="selectedSize" type="hidden" value={product.sizes[0]} />
              <input name="selectedFirmness" type="hidden" value={product.firmnessOptions[0] ?? product.firmness} />
              <input name="quantity" type="hidden" value="1" />
              <FormSubmitButton
                idleLabel="Add to cart"
                pendingLabel="Adding..."
                className="rounded-full bg-ink px-5 py-3 text-sm text-ivory transition hover:bg-slate"
              />
            </form>
          </div>
        </div>
      </div>
    </article>
  );
}
