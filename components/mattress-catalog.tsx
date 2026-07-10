"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { ProductRecord } from "@/lib/store-types";
import { ProductZoomModal } from "@/components/product-zoom-modal";

type ZoomState = {
  image: string;
  title: string;
  tag: string;
};

export function MattressCatalog({ products }: { products: ProductRecord[] }) {
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

        <div className="grid gap-6 rounded-[2rem] bg-[linear-gradient(135deg,#eaf5ff_0%,#f8fbff_45%,#ffffff_100%)] p-5 shadow-[0_20px_70px_rgba(13,76,143,0.08)] sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-bronze">Corebed Mattress Collection</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.07em] text-navy sm:text-5xl md:text-6xl">
              Cooling, orthopedic and premium support mattresses.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate">
              This page is focused only on the mattress range. Each card includes clear pricing, add-to-cart access, and a quick zoom preview for a more premium product presentation.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white p-5">
              <p className="text-3xl font-semibold tracking-[-0.05em] text-navy">
                {products.filter((item) => item.status === "active").length}
              </p>
              <p className="mt-2 text-sm text-slate">Active mattress options</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5">
              <p className="text-3xl font-semibold tracking-[-0.05em] text-navy">15%</p>
              <p className="mt-2 text-sm text-slate">Sale-ready merchandising tag</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5">
              <p className="text-3xl font-semibold tracking-[-0.05em] text-navy">Zoom</p>
              <p className="mt-2 text-sm text-slate">Tap any image for closer inspection</p>
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
                      <p className="mt-2 text-[1.1rem] text-slate">
                        {formatCurrency(product.price)} -{" "}
                        {formatCurrency(
                          product.compareAtPrice ? Math.max(product.compareAtPrice, product.price + 1200) : product.price + 2400
                        )}
                      </p>
                    </div>
                    <Link href={`/shop/${product.slug}`} className="inline-flex w-full justify-center rounded-md bg-navy px-7 py-3 text-base font-semibold text-white sm:w-auto">
                      Add to Cart
                    </Link>
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
