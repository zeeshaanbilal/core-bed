"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { addToCartAction, addWishlistAction, removeWishlistAction, submitTestimonialAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { formatCurrency } from "@/lib/format";
import type { ProductRecord, TestimonialRecord } from "@/lib/store-types";

export function ProductDetailView({
  product,
  backHref,
  backLabel,
  compareLabel,
  relatedProducts,
  isWishlisted,
  testimonials,
  country
}: {
  product: ProductRecord;
  backHref: string;
  backLabel: string;
  compareLabel: string;
  relatedProducts: ProductRecord[];
  isWishlisted: boolean;
  testimonials: TestimonialRecord[];
  country?: string;
}) {
  const gallery = useMemo(() => [product.image, ...product.gallery].slice(0, 4), [product.gallery, product.image]);
  const initialVariant = product.variants[0];
  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(initialVariant?.size ?? product.sizes[0] ?? "Standard");
  const [selectedFirmness, setSelectedFirmness] = useState(initialVariant?.firmness ?? product.firmnessOptions[0] ?? product.firmness);

  const sizeMatchedVariants = useMemo(() => product.variants.filter((variant) => variant.size === selectedSize), [product.variants, selectedSize]);
  const availableFirmnessOptions = useMemo(() => {
    const options = sizeMatchedVariants.length > 0 ? sizeMatchedVariants.map((variant) => variant.firmness) : product.firmnessOptions;
    return Array.from(new Set(options));
  }, [product.firmnessOptions, sizeMatchedVariants]);

  useEffect(() => {
    if (availableFirmnessOptions.length > 0 && !availableFirmnessOptions.includes(selectedFirmness)) {
      setSelectedFirmness(availableFirmnessOptions[0]);
    }
  }, [availableFirmnessOptions, selectedFirmness]);

  const selectedVariant =
    product.variants.find((variant) => variant.size === selectedSize && variant.firmness === selectedFirmness) ??
    sizeMatchedVariants[0] ??
    product.variants[0];

  const activePrice = selectedVariant?.price ?? product.price;
  const activeCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const returnPath = `${backHref}/${product.slug}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3 text-sm text-slate">
        <Link href="/" className="text-navy">
          Home
        </Link>
        <span>&gt;</span>
        <Link href={backHref} className="text-navy">
          {backLabel}
        </Link>
        <span>&gt;</span>
        <span>{product.name}</span>
      </div>

      <section className="grid gap-10 lg:grid-cols-[1.18fr_0.82fr]">
        <div>
          <div className="relative overflow-hidden rounded-[1.5rem] bg-white">
            <div className="h-[720px] w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${activeImage})` }} />
          </div>

          <div className="mt-6 flex gap-5">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                className={`relative h-24 w-24 overflow-hidden rounded-xl border ${activeImage === image ? "border-navy" : "border-transparent"} bg-white`}
                onClick={() => setActiveImage(image)}
                type="button"
              >
                <Image alt={`${product.name} thumbnail ${index + 1}`} fill src={image} className="object-contain p-2" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-7">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-0.06em] text-navy">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-[1.9rem]">
              {activeCompareAt ? <span className="text-xl text-slate line-through">{formatCurrency(activeCompareAt, country)}</span> : null}
              <span className="font-semibold text-navy">{formatCurrency(activePrice, country)}</span>
            </div>
            <p className="mt-3 text-sm text-slate">SKU: {selectedVariant?.sku ?? "Custom"} | Stock: {selectedVariant?.stock ?? product.inventory}</p>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Size</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      selectedSize === size ? "border-navy bg-navy text-white" : "border-ink/12 bg-white text-navy"
                    }`}
                    onClick={() => setSelectedSize(size)}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Comfort</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {availableFirmnessOptions.map((firmness) => (
                  <button
                    key={firmness}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      selectedFirmness === firmness ? "border-navy bg-navy text-white" : "border-ink/12 bg-white text-navy"
                    }`}
                    onClick={() => setSelectedFirmness(firmness)}
                    type="button"
                  >
                    {firmness}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex h-[58px] items-center rounded-md border border-ink/15 bg-white">
                <button className="flex h-full w-14 items-center justify-center text-2xl text-navy" onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button">
                  -
                </button>
                <span className="flex h-full min-w-12 items-center justify-center text-lg font-semibold text-navy">{quantity}</span>
                <button className="flex h-full w-14 items-center justify-center text-2xl text-navy" onClick={() => setQuantity((current) => current + 1)} type="button">
                  +
                </button>
              </div>

              <form action={addToCartAction}>
                <input name="productSlug" type="hidden" value={product.slug} />
                <input name="quantity" type="hidden" value={String(quantity)} />
                <input name="selectedSize" type="hidden" value={selectedSize} />
                <input name="selectedFirmness" type="hidden" value={selectedFirmness} />
                <FormSubmitButton idleLabel="ADD TO CART" pendingLabel="ADDING..." className="min-h-[58px] min-w-[250px] rounded-md bg-navy px-10 text-base font-semibold text-white" />
              </form>

              <form action={isWishlisted ? removeWishlistAction : addWishlistAction}>
                <input name="productSlug" type="hidden" value={product.slug} />
                <input name="returnTo" type="hidden" value={returnPath} />
                <button
                  className={`flex h-[58px] w-[58px] items-center justify-center rounded-md border text-3xl ${
                    isWishlisted ? "border-navy bg-navy text-white" : "border-ink/15 bg-white text-slate"
                  }`}
                  type="submit"
                >
                  {isWishlisted ? "\u2665" : "\u2661"}
                </button>
              </form>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1rem] border border-ink/12 bg-white">
            <div className="p-6">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-navy">Got questions?</h2>
              <p className="mt-3 text-base leading-8 text-slate">
                Chat with our customer service or book a virtual appointment with a Sleep Specialist from our stores.
              </p>
            </div>
            <div className="grid border-t border-ink/10 text-sm text-slate md:grid-cols-3">
              <div className="border-b border-ink/10 px-5 py-4 md:border-b-0 md:border-r">WhatsApp: +15855029662</div>
              <div className="border-b border-ink/10 px-5 py-4 md:border-b-0 md:border-r">Call: +15855029662</div>
              <div className="break-all px-5 py-4">Email: contact@e.corebed.com</div>
            </div>
          </div>

          <div className="border-b border-ink/10 pb-3">
            <span className="inline-flex border-b-2 border-navy pb-3 text-lg font-medium text-navy">Description</span>
          </div>

          <div className="space-y-5 text-[15px] leading-8 text-slate">
            <p>{product.longDescription}</p>
            <p>{product.support}</p>
            <p>
              Built around {product.material.toLowerCase()} and a {selectedFirmness.toLowerCase()} comfort profile, this product is designed to feel cleaner, calmer and more premium in everyday use.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-5xl font-semibold tracking-[-0.05em] text-navy">Customer feedback for this product</h2>
        </div>
        <div className="mt-10 space-y-4">
          {testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-[1.5rem] bg-white p-8 shadow-[0_14px_40px_rgba(47,42,40,0.08)]">
                <p className="text-lg tracking-[0.18em] text-navy">{"\u2605".repeat(testimonial.rating)}</p>
                <p className="mt-6 text-[1.3rem] leading-[1.8] tracking-[-0.04em] text-slate">{testimonial.body}</p>
                <p className="mt-8 text-2xl font-semibold text-navy">{testimonial.customerName}</p>
                <p className="mt-2 text-base text-slate">From {testimonial.customerCity}</p>
              </article>
            ))
          ) : null}
        </div>
      </section>

      <section className="mt-12 rounded-[1.75rem] border border-ink/10 bg-white p-8">
        <h3 className="text-3xl font-semibold tracking-[-0.04em] text-navy">Leave your feedback</h3>
        <form action={submitTestimonialAction} className="mt-6 grid gap-4 md:grid-cols-2">
          <input name="productSlug" type="hidden" value={product.slug} />
          <input name="returnTo" type="hidden" value={returnPath} />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="customerName" placeholder="Your name" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="customerCity" placeholder="Your city" required />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" max="5" min="1" name="rating" placeholder="Rating 1-5" required type="number" />
          <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="title" placeholder="Short headline" />
          <textarea className="min-h-32 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="body" placeholder="Share your product experience" required />
          <div className="md:col-span-2">
            <FormSubmitButton idleLabel="Submit feedback" pendingLabel="Submitting..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
          </div>
        </form>
      </section>

      {relatedProducts.length ? (
        <section className="mt-20">
          <h2 className="text-center text-5xl font-semibold tracking-[-0.05em] text-navy">YOU MAY ALSO LIKE</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((related) => (
              <article key={related.id}>
                <Link href={`${backHref}/${related.slug}`} className="block overflow-hidden rounded-sm bg-[#f4f0e7]">
                  <div className="h-[340px] w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${related.image})` }} />
                </Link>
                <div className="mt-6 flex items-start justify-between gap-4">
                  <div>
                    <Link href={`${backHref}/${related.slug}`} className="block text-[2rem] font-semibold leading-tight tracking-[-0.05em] text-navy">
                      {related.name}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-lg">
                      {related.compareAtPrice ? <span className="text-slate line-through">{formatCurrency(related.compareAtPrice, country)}</span> : null}
                      <span className="text-navy">{formatCurrency(related.price, country)}</span>
                    </div>
                  </div>
                  <Link href={`${backHref}/${related.slug}`} className="rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white">
                    Add to Cart
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
