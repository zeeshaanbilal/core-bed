"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { addToCartAction, buyNowAction } from "@/app/actions/store";
import { CurrencyAmount } from "@/components/currency-amount";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ExchangeRates } from "@/lib/format";
import type { ProductRecord } from "@/lib/store-types";
import { ProductZoomModal } from "@/components/product-zoom-modal";

export function AccessoryCatalog({
  products,
  country,
  exchangeRates
}: {
  products: ProductRecord[];
  country?: string;
  exchangeRates?: ExchangeRates;
}) {
  const [zoomState, setZoomState] = useState<{ image: string | null; title: string }>({
    image: null,
    title: ""
  });

  const rows = useMemo(() => {
    const active = products.filter((product) => product.status === "active");
    return [active.slice(0, 3), active.slice(3, 6), active.slice(6, 9)].filter((group) => group.length > 0);
  }, [products]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex items-center gap-3 text-sm text-slate">
          <Link href="/" className="text-navy">
            Home
          </Link>
          <span>&gt;</span>
          <span>Accessories</span>
        </div>

        <div className="space-y-16">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid gap-x-10 gap-y-14 lg:grid-cols-3">
              {row.map((product) => (
                <article key={product.id} className="group">
                  <div className="relative h-[300px] overflow-hidden rounded-sm bg-white sm:h-[380px] lg:h-[430px]">
                    {product.badge === "New" ? (
                      <div className="absolute left-5 top-5 z-10 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
                        New
                      </div>
                    ) : null}
                    <div className="absolute bottom-6 right-5 z-10 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
                      15% OFF
                    </div>
                    <button
                      className="relative h-full w-full"
                      onClick={() => setZoomState({ image: product.gallery[0] ?? product.image, title: product.name })}
                      type="button"
                    >
                      <span className="absolute right-5 top-5 z-10 hidden rounded-full bg-white/14 px-3 py-2 text-xs uppercase tracking-[0.22em] text-navy opacity-0 transition group-hover:opacity-100 md:block">
                        Zoom
                      </span>
                      <Image
                        alt={product.name}
                        fill
                        src={product.image}
                        className="object-contain p-6 transition duration-500 group-hover:scale-105"
                      />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link
                        href={`/accessories/${product.slug}`}
                        className="text-[1.65rem] font-semibold leading-tight tracking-[-0.06em] text-navy sm:text-[1.95rem]"
                      >
                        {product.name}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[1.08rem]">
                        {product.compareAtPrice ? (
                          <span className="text-slate line-through">
                            <CurrencyAmount value={product.compareAtPrice} country={country} exchangeRates={exchangeRates} />
                          </span>
                        ) : null}
                        <span className="text-[#ff2d2d]">
                          <CurrencyAmount value={product.price} country={country} exchangeRates={exchangeRates} />
                        </span>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto">
                      <form action={buyNowAction}>
                        <input name="productSlug" type="hidden" value={product.slug} />
                        <input name="selectedSize" type="hidden" value={product.sizes[0] ?? "Standard"} />
                        <input
                          name="selectedFirmness"
                          type="hidden"
                          value={product.firmnessOptions[0] ?? product.firmness}
                        />
                        <input name="quantity" type="hidden" value="1" />
                        <FormSubmitButton
                          idleLabel="Shop now"
                          pendingLabel="Opening checkout..."
                          className="inline-flex w-full justify-center rounded-md bg-navy px-7 py-3 text-base font-semibold text-white sm:min-w-[180px]"
                        />
                      </form>
                      <form action={addToCartAction}>
                        <input name="productSlug" type="hidden" value={product.slug} />
                        <input name="selectedSize" type="hidden" value={product.sizes[0] ?? "Standard"} />
                        <input
                          name="selectedFirmness"
                          type="hidden"
                          value={product.firmnessOptions[0] ?? product.firmness}
                        />
                        <input name="quantity" type="hidden" value="1" />
                        <FormSubmitButton
                          idleLabel="Add to cart"
                          pendingLabel="Adding..."
                          className="inline-flex w-full justify-center rounded-md border border-navy/20 bg-white px-7 py-3 text-base font-semibold text-navy sm:min-w-[180px]"
                        />
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ProductZoomModal
        image={zoomState.image}
        title={zoomState.title}
        tag="Accessory Zoom"
        description="Inspect stitching, surface finish, and support geometry in a larger responsive preview without getting stuck on smaller screens."
        onClose={() => setZoomState({ image: null, title: "" })}
      />
    </>
  );
}
