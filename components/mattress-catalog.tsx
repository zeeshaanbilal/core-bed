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

type ZoomState = {
  image: string;
  title: string;
  tag: string;
};

export function MattressCatalog({
  products,
  country,
  exchangeRates
}: {
  products: ProductRecord[];
  country?: string;
  exchangeRates?: ExchangeRates;
}) {
  const [zoomState, setZoomState] = useState<ZoomState | null>(null);

  const sections = useMemo(() => {
    const active = products.filter((product) => product.status === "active");
    return [active.slice(0, 3), active.slice(3, 6), active.slice(6, 9), active.slice(9, 12)].filter(
      (group) => group.length > 0
    );
  }, [products]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3 text-sm text-slate">
          <Link href="/" className="text-navy">
            Home
          </Link>
          <span>&gt;</span>
          <span>Mattresses</span>
        </div>

        <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-[#dfe8d7] bg-[linear-gradient(135deg,#fbfcf8_0%,#f5f7f1_46%,#edf2e6_100%)] p-5 shadow-[0_22px_70px_rgba(70,86,53,0.08)] sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.32em] text-bronze">Corebed Mattress Collection</p>
            <h1 className="mt-4 max-w-[11ch] text-4xl font-semibold leading-[0.94] tracking-[-0.07em] text-navy sm:text-5xl md:text-6xl">
              Cleaner comfort for deeper, better rest.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate">
              Explore the full mattress range with calmer product presentation, clearer pricing, and premium support stories designed for modern bedrooms.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-[#cbd9bc] bg-white/90 px-4 py-2 text-sm font-medium text-navy">
                Cooling layers
              </span>
              <span className="rounded-full border border-[#cbd9bc] bg-white/90 px-4 py-2 text-sm font-medium text-navy">
                Orthopedic support
              </span>
              <span className="rounded-full border border-[#cbd9bc] bg-white/90 px-4 py-2 text-sm font-medium text-navy">
                Premium finishes
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f3f0e8_100%)] p-6 shadow-[0_24px_50px_rgba(47,42,40,0.08)]">
            <div className="absolute inset-x-8 top-8 h-32 rounded-[2rem] bg-[radial-gradient(circle_at_center,rgba(151,185,110,0.2),transparent_68%)] blur-2xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.32em] text-bronze">Featured Range</p>
              <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div className="relative min-h-[260px] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#f8f6ef_0%,#ece5d9_100%)]">
                  <Image
                    alt="Corebed mattress collection hero"
                    fill
                    src={products[0]?.image ?? "/corebed-logo.png"}
                    className="object-contain px-6 py-8"
                  />
                </div>
                <div className="space-y-4">
                  <div className="rounded-[1.25rem] bg-white/92 p-5">
                    <p className="text-sm uppercase tracking-[0.24em] text-bronze">Design direction</p>
                    <p className="mt-3 text-base leading-7 text-slate">
                      Minimal silhouettes, softer tones, and material-focused detailing across the full collection.
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] bg-[#2f2a28] p-5 text-white">
                    <p className="text-sm uppercase tracking-[0.24em] text-[#d8e3c5]">Built for</p>
                    <p className="mt-3 text-xl font-medium leading-8 tracking-[-0.04em]">
                      master bedrooms, guest rooms, and everyday comfort upgrades.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-20">
        <div className="space-y-14">
          {sections.map((group, groupIndex) => (
            <div key={groupIndex} className="grid gap-x-9 gap-y-12 lg:grid-cols-3">
              {group.map((product) => (
                <article key={product.id} className="group">
                  <div className="relative overflow-hidden rounded-sm bg-[linear-gradient(180deg,#f5f2eb_0%,#e8e1d5_100%)]">
                    <button
                      className="relative block h-[300px] w-full sm:h-[380px] lg:h-[440px]"
                      onClick={() =>
                        setZoomState({
                          image: product.gallery[0] ?? product.image,
                          title: product.name,
                          tag: product.badge || "Mattress"
                        })
                      }
                      type="button"
                    >
                      {product.badge ? (
                        <span className="absolute left-5 top-5 z-10 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
                          {product.badge}
                        </span>
                      ) : null}
                      <span className="absolute bottom-5 right-5 z-10 rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white">
                        15% OFF
                      </span>
                      <span className="absolute right-5 top-5 z-10 rounded-full bg-white/16 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white opacity-0 transition group-hover:opacity-100">
                        Zoom
                      </span>
                      <Image
                        alt={product.name}
                        fill
                        src={product.image}
                        className="object-contain px-6 py-8 transition duration-500 group-hover:scale-105"
                      />
                    </button>
                  </div>

                  <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link
                        href={`/shop/${product.slug}`}
                        className="text-[1.7rem] font-semibold leading-tight tracking-[-0.06em] text-navy sm:text-[2.05rem]"
                      >
                        {product.name}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[1.1rem]">
                        {product.compareAtPrice ? (
                          <span className="text-slate line-through">
                            <CurrencyAmount value={product.compareAtPrice} country={country} exchangeRates={exchangeRates} />
                          </span>
                        ) : null}
                        <span className="text-slate">
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
        image={zoomState?.image ?? null}
        title={zoomState?.title ?? ""}
        tag={zoomState?.tag ?? "Mattress"}
        description="Inspect fabric texture, quilting, sidewall finishing, and overall construction in a larger responsive preview."
        onClose={() => setZoomState(null)}
      />
    </>
  );
}
