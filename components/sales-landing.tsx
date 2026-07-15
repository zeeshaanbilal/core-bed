import Link from "next/link";

import { CurrencyAmount } from "@/components/currency-amount";
import type { ExchangeRates } from "@/lib/format";
import type { ProductRecord } from "@/lib/store-types";

type SalesSeason = "summer" | "winter";

const seasonalContent: Record<
  SalesSeason,
  {
    eyebrow: string;
    title: string;
    body: string;
    accent: string;
    image: string;
  }
> = {
  summer: {
    eyebrow: "Summer Sale",
    title: "Cooler sleep deals for warmer nights.",
    body: "Cooling comfort, lighter pillows and cleaner support products selected for heat-aware bedrooms and summer buying campaigns.",
    accent: "15% OFF",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80"
  },
  winter: {
    eyebrow: "Winter Sale",
    title: "Warmer comfort layers for the colder season.",
    body: "Plusher surfaces, room-friendly bedding essentials and support options curated for winter setups and comfort-led seasonal offers.",
    accent: "Cozy Picks",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80&sat=-10"
  }
};

function getProductHref(product: ProductRecord) {
  if (product.category === "Pillows") {
    return `/pillows/${product.slug}`;
  }

  if (product.category === "Accessories") {
    return `/accessories/${product.slug}`;
  }

  return `/shop/${product.slug}`;
}

export function SalesLanding({
  season,
  products,
  exchangeRates,
  country
}: {
  season: SalesSeason;
  products: ProductRecord[];
  exchangeRates?: ExchangeRates;
  country?: string;
}) {
  const content = seasonalContent[season];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fbfaf7_0%,#f1ecdf_52%,#e6dece_100%)] shadow-[0_24px_80px_rgba(47,42,40,0.12)]">
        <div className="grid items-center gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="px-8 py-14 md:px-12">
            <p className="text-xs uppercase tracking-[0.36em] text-bronze">{content.eyebrow}</p>
            <h1 className="mt-5 font-serif text-6xl font-semibold leading-[0.94] tracking-[-0.07em] text-navy">
              {content.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate">{content.body}</p>
            <div className="mt-8 inline-flex rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              {content.accent}
            </div>
          </div>
          <div
            className="min-h-[420px] bg-cover bg-center"
            style={{ backgroundImage: `url(${content.image})` }}
          />
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-bronze">Seasonal Picks</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-navy">Shop the featured sale lineup</h2>
          </div>
          <Link href="/shop" className="hidden rounded-full border border-ink/10 px-5 py-3 text-sm font-medium text-navy md:inline-flex">
            View all products
          </Link>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.id}>
              <Link href={getProductHref(product)} className="block overflow-hidden rounded-[1.25rem] bg-[#f4f0e7]">
                <div
                  className="h-[320px] w-full bg-contain bg-center bg-no-repeat transition duration-500 hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
              </Link>
              <p className="mt-5 text-xs uppercase tracking-[0.3em] text-bronze">{product.category}</p>
              <Link href={getProductHref(product)} className="mt-3 block text-[1.9rem] font-semibold leading-tight tracking-[-0.05em] text-navy">
                {product.name}
              </Link>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-base">
                {product.compareAtPrice ? (
                  <span className="text-slate line-through">
                    <CurrencyAmount value={product.compareAtPrice} country={country} exchangeRates={exchangeRates} />
                  </span>
                ) : null}
                <span className="font-semibold text-navy">
                  <CurrencyAmount value={product.price} country={country} exchangeRates={exchangeRates} />
                </span>
              </div>
              <Link href={getProductHref(product)} className="mt-5 inline-flex rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white">
                View deal
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
