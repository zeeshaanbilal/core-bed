import Link from "next/link";
import type { Metadata } from "next";

import { addToCartAction, buyNowAction } from "@/app/actions/store";
import { CurrencyAmount } from "@/components/currency-amount";
import { FormSubmitButton } from "@/components/form-submit-button";
import { StructuredData } from "@/components/structured-data";
import { getCurrentUser } from "@/lib/auth";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getApprovedTestimonialsForHome, getCustomerProfileByEmail, getProducts } from "@/lib/mock-store";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";
import { featureCards, storeLocations, testimonials } from "@/lib/site-data";

function getProductHref(category: string, slug: string) {
  if (category === "Pillows") {
    return `/pillows/${slug}`;
  }

  if (category === "Accessories") {
    return `/accessories/${slug}`;
  }

  return `/shop/${slug}`;
}

export const metadata: Metadata = buildMetadata({
  title: "Corebed Natural Mattress | Premium Mattresses, Pillows and Accessories",
  description:
    "Shop Corebed mattresses, pillows, and accessories with cleaner buying flows, sleep guides, customer feedback, and embedded checkout support.",
  path: "/"
});

const categoryCards = [
  {
    title: "Mattresses",
    href: "/shop",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    align: "left"
  },
  {
    title: "Pillows",
    href: "/pillows",
    image:
      "https://images.unsplash.com/photo-1582582429416-47f8f35f1c47?auto=format&fit=crop&w=1200&q=80",
    align: "center"
  },
  {
    title: "Accessories",
    href: "/accessories",
    image:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
    align: "right"
  }
];

const servicePoints = [
  {
    title: "Contactless delivery",
    body: "Free, safe delivery with every order, no matter how big or small.",
    icon: "▣"
  },
  {
    title: "15-years warranty",
    body: "Long-term comfort backed by a simple and clear support promise.",
    icon: "◔"
  },
  {
    title: "Highest hygiene standards",
    body: "Your mattress stays protected from finishing to final delivery.",
    icon: "◌"
  }
];

const articleCards = [
  {
    slug: "summer-sale-live-massively-discounted-deals-on-diamond-supreme-foam",
    title: "Summer sale and cooler sleep deals",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "which-pillow-is-best-for-a-stiff-neck-expert-recommendations",
    title: "How to sleep cool in hot weather",
    image:
      "https://images.unsplash.com/photo-1505693537694-cd1d132d7d82?auto=format&fit=crop&w=1200&q=80"
  },
  {
    slug: "where-to-buy-high-quality-mattresses-in-pakistan-2026-buyers-guide",
    title: "The most trusted mattress buying guide",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80&sat=-15"
  }
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const [allProducts, approvedTestimonials, profile, exchangeRates] = await Promise.all([
    getProducts(),
    getApprovedTestimonialsForHome(),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null),
    getExchangeRates()
  ]);
  const featuredProducts = allProducts.filter((product) => product.status === "active").slice(0, 4);
  const liveTestimonials =
    approvedTestimonials.length > 0
      ? approvedTestimonials.map((item) => ({
          author: `${item.customerName}, ${item.customerCity}`,
          quote: item.body
        }))
      : testimonials;
  const repeatedTestimonials = [...liveTestimonials, ...liveTestimonials];
  const primaryStore = storeLocations[0];

  return (
    <main className="overflow-hidden">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" }
        ])}
      />
      <section className="mx-auto grid min-h-[680px] max-w-[1900px] gap-0 bg-white lg:grid-cols-[0.58fr_1.22fr]">
        <div className="flex items-center justify-center px-10 py-20 md:px-16 lg:justify-end">
          <div className="w-full max-w-[420px]">
            <p className="text-[clamp(4rem,11vw,7.8rem)] font-semibold uppercase leading-[0.92] tracking-[-0.08em] text-navy">
              Summer
            </p>
            <p className="mt-2 text-[clamp(4.5rem,13vw,9.2rem)] font-bold uppercase leading-[0.88] tracking-[-0.08em] text-navy">
              Sale
            </p>
            <div className="mt-10 flex items-end gap-2 text-bronze">
              <span className="text-[clamp(5rem,12vw,8rem)] font-bold leading-none tracking-[-0.08em]">15</span>
              <div className="pb-3">
                <span className="text-6xl font-light">%</span>
                <p className="mt-1 text-2xl font-semibold uppercase tracking-[-0.04em]">Off</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative min-h-[520px] overflow-hidden bg-[linear-gradient(130deg,#f7f5ef_0%,#efe9df_52%,#e0d8ca_100%)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(151,185,110,0.22),transparent_24%),radial-gradient(circle_at_70%_58%,rgba(255,255,255,0.38),transparent_36%),radial-gradient(circle_at_82%_24%,rgba(63,58,57,0.06),transparent_20%)]" />
          <div className="absolute left-[52%] top-[17%] h-[380px] w-[380px] rounded-full bg-[#97b96e]/10 blur-3xl" />
          <div className="absolute left-[14%] top-[70%] h-[180px] w-[180px] rounded-full bg-white/40 blur-3xl" />
          <div className="relative flex h-full items-end justify-center px-8 pb-12 pt-16">
            <div className="relative w-full max-w-5xl">
              <div className="absolute -top-8 left-[6%] hidden h-24 w-24 rounded-sm bg-white/90 shadow-soft md:block" />
              <div className="absolute -top-2 right-[6%] hidden h-24 w-24 rounded-sm bg-white/90 shadow-soft md:block" />
              <div className="mx-auto h-[410px] max-w-4xl rounded-[2.4rem_2.4rem_1.2rem_1.2rem] border border-white/60 bg-[linear-gradient(180deg,#ffffff_0%,#faf8f2_62%,#f0ece3_100%)] shadow-[0_45px_90px_rgba(47,42,40,0.18)]">
                <div className="mx-auto mt-10 h-[90px] w-[72%] rounded-[999px] bg-[linear-gradient(180deg,#fbfaf7_0%,#eee8dc_100%)] shadow-[inset_0_-10px_30px_rgba(47,42,40,0.06)]" />
                <div className="mt-8 h-[150px] rounded-b-[1rem] bg-[linear-gradient(180deg,#4b4644_0%,#2f2a28_100%)] px-10 py-8 text-white">
                  <p className="text-5xl font-semibold tracking-[-0.06em]">CoreSleep Calm</p>
                  <p className="mt-2 text-lg text-white/86">clean support for quieter bedrooms</p>
                </div>
              </div>
              <div className="absolute -bottom-7 left-1/2 h-9 w-[90%] -translate-x-1/2 rounded-full bg-[#2f2a28]/20 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-semibold tracking-[-0.05em] text-navy md:text-5xl">
            Setting a new standard in sleep
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate">
            Minimal, cleaner product storytelling with just the categories that matter most right now.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {categoryCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group relative min-h-[500px] overflow-hidden rounded-sm bg-[linear-gradient(180deg,#f4f1ea_0%,#e6dfd2_100%)] p-10 text-white"
            >
              <div
                className="absolute inset-x-0 bottom-0 top-0 bg-cover bg-bottom bg-no-repeat opacity-100 transition duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${card.image})`, backgroundSize: "cover", backgroundPosition: "center bottom" }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(63,58,57,0.05)_0%,rgba(63,58,57,0.16)_55%,rgba(47,42,40,0.32)_100%)]" />
              <div className="relative z-10 text-center">
                <h3 className="text-5xl font-light tracking-[-0.06em] text-white md:text-6xl">{card.title}</h3>
                <span className="mt-7 inline-flex rounded-full border border-white/70 px-10 py-4 text-lg font-medium uppercase tracking-[-0.04em] text-white">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-serif text-4xl font-semibold tracking-[-0.05em] text-navy md:text-5xl">
            Everything you need in a complete sleep system
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate">
            A sleep system built around comfort, clarity and the few promises that customers actually care about.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {featureCards.map((point) => (
              <Link key={point.slug} href={`/features/${point.slug}`} className="block px-6 transition hover:-translate-y-1">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sky/20 text-4xl text-sky">
                  {point.icon}
                </div>
                <h3 className="mt-8 text-3xl font-semibold tracking-[-0.05em] text-navy">{point.title}</h3>
                <p className="mx-auto mt-4 max-w-sm text-base leading-8 text-slate">{point.body}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-navy">Read more</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#efebe2]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(151,185,110,0.18),transparent_20%),radial-gradient(circle_at_60%_28%,rgba(63,58,57,0.10),transparent_22%),radial-gradient(circle_at_75%_68%,rgba(151,185,110,0.12),transparent_18%)]" />
        <div className="relative mx-auto max-w-[1900px]">
          <video
            autoPlay
            className="h-[640px] w-full object-cover"
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80"
          >
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(47,42,40,0.54)_0%,rgba(47,42,40,0.16)_36%,rgba(47,42,40,0.08)_100%)]" />
          <div className="absolute left-6 top-6 max-w-3xl text-white md:left-10 md:top-8">
            <p className="text-3xl font-semibold tracking-[-0.06em] md:text-4xl">
              Cooling comfort technology made simple
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/88">
              A muted product story section that feels modern without turning the homepage into a noisy promo reel.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#faf8f3] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-serif text-4xl font-semibold tracking-[-0.05em] text-navy md:text-5xl">
            See why customers keep coming back
          </h2>
          <div className="reviews-marquee mt-12">
            <div className="reviews-track gap-6 pr-6">
              {repeatedTestimonials.map((testimonial, index) => (
                <article
                  key={`${testimonial.author}-${index}`}
                  className="w-[340px] flex-none rounded-[1.5rem] bg-white p-8 shadow-[0_20px_50px_rgba(47,42,40,0.08)] md:w-[420px]"
                >
                  <p className="text-lg tracking-[0.18em] text-navy">★★★★★</p>
                  <p className="mt-8 text-[1.65rem] leading-[1.6] tracking-[-0.04em] text-slate">
                    {testimonial.quote}
                  </p>
                  <p className="mt-8 text-2xl font-semibold tracking-[-0.04em] text-navy">
                    {testimonial.author.split(",")[0]}
                  </p>
                  <p className="mt-2 text-base text-slate">
                    From {testimonial.author.split(",")[1]?.trim() ?? "Pakistan"}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center font-serif text-4xl font-semibold tracking-[-0.05em] text-navy md:text-5xl">
          Our featured products
        </h2>
        <div className="mt-12 grid justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <div key={product.id} className="w-full max-w-[360px] text-center">
              <Link
                href={getProductHref(product.category, product.slug)}
                className="block overflow-hidden rounded-sm bg-[linear-gradient(180deg,#f5f2ea_0%,#e6dece_100%)] p-6"
              >
                <div
                  className="h-[300px] w-full bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
              </Link>
              <Link
                href={getProductHref(product.category, product.slug)}
                className="mt-7 block text-2xl font-medium tracking-[-0.04em] text-navy transition hover:text-[#4c6540]"
              >
                {product.name}
              </Link>
              <div className="mt-3 text-lg text-slate">
                <CurrencyAmount value={product.price} country={profile?.country} exchangeRates={exchangeRates} />
              </div>
              {product.compareAtPrice ? (
                <div className="mt-1 text-base text-slate line-through">
                  <CurrencyAmount value={product.compareAtPrice} country={profile?.country} exchangeRates={exchangeRates} />
                </div>
              ) : null}
              <div className="mt-5 flex flex-col items-center gap-3">
                <form action={buyNowAction} className="w-full">
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
                    className="inline-flex w-full justify-center rounded-full bg-navy px-5 py-3 text-sm font-medium text-white"
                  />
                </form>
                <form action={addToCartAction} className="w-full">
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
                    className="inline-flex w-full justify-center rounded-full border border-navy/20 bg-white px-5 py-3 text-sm font-medium text-navy"
                  />
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1900px] gap-0 lg:grid-cols-[1.7fr_0.65fr]">
        <div className="min-h-[520px] bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />
        <div className="flex min-h-[520px] items-end bg-[linear-gradient(180deg,#544e4b_0%,#2f2a28_100%)] p-10 text-white md:p-14">
          <div>
              <p className="text-6xl font-light tracking-[0.28em] text-[#dfe8d0]">Z Z Z</p>
              <p className="mt-8 text-2xl font-light text-white/82">with</p>
            <h2 className="mt-2 max-w-sm font-serif text-5xl font-semibold tracking-[-0.06em]">
              Gel-Infused Foam
            </h2>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-center font-serif text-4xl font-semibold tracking-[-0.05em] text-navy md:text-5xl">
          Sleep tips and advice to improve your sleep
        </h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {articleCards.map((article) => (
            <Link key={article.title} href={`/blog/${article.slug}`} className="relative block min-h-[420px] overflow-hidden rounded-[1.5rem]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${article.image})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,42,40,0.05)_0%,rgba(47,42,40,0.76)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.05em]">{article.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/blog" className="inline-flex rounded-lg bg-navy px-10 py-4 text-xl font-semibold text-white">
            Browse all articles
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1900px] gap-0 bg-white lg:grid-cols-[1.05fr_1fr]">
        <div className="flex items-center px-8 py-16 md:px-20">
          <div className="max-w-xl">
            <h2 className="font-serif text-5xl font-semibold leading-tight tracking-[-0.05em] text-navy md:text-6xl">
              Find a Corebed store near you.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-slate">
              Visit our current showroom location at {primaryStore.address}, {primaryStore.city}, {primaryStore.state}{" "}
              {primaryStore.postalCode}. Open the map directly or view the full store detail page.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/store-locator/${primaryStore.slug}`}
                className="inline-flex rounded-xl bg-ink px-10 py-4 text-lg text-ivory"
              >
                Store details
              </Link>
              <Link
                href={primaryStore.mapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl border border-bronze/50 px-10 py-4 text-lg text-navy"
              >
                Open map
              </Link>
            </div>
          </div>
        </div>
        <div className="min-h-[420px] overflow-hidden border-l border-ink/10 bg-[#f7f4ed]">
          <iframe
            title={`Map for ${primaryStore.address}, ${primaryStore.city}`}
            src={primaryStore.mapEmbedUrl}
            className="h-full min-h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </main>
  );
}
