import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildMetadata } from "@/lib/seo";
import { storeLocations } from "@/lib/site-data";

type StoreDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: StoreDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = storeLocations.find((item) => item.slug === slug);

  if (!store) {
    return buildMetadata({
      title: "Store Not Found | Corebed",
      description: "The requested Corebed store page could not be found.",
      path: `/store-locator/${slug}`
    });
  }

  return buildMetadata({
    title: `${store.city} Store | ${store.address} | Corebed`,
    description: `Visit the Corebed store detail page for ${store.address}, ${store.city}, ${store.state}, with map, hours, and contact information.`,
    path: `/store-locator/${slug}`,
    keywords: [store.city, store.state, "Corebed store", "mattress showroom", store.address]
  });
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { slug } = await params;
  const store = storeLocations.find((item) => item.slug === slug);

  if (!store) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate">
        <Link href="/" className="text-navy">
          Home
        </Link>
        <span>&gt;</span>
        <Link href="/store-locator" className="text-navy">
          Store Locator
        </Link>
        <span>&gt;</span>
        <span>{store.city}</span>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="section-frame rounded-[1.75rem] p-5 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">{store.city}</p>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">{store.address}</h1>
          <p className="mt-6 text-base leading-8 text-slate">{store.summary}</p>

          <div className="mt-8 space-y-3 text-sm leading-7 text-slate">
            <p>
              <span className="font-medium text-ink">Location:</span> {store.city}, {store.state} {store.postalCode},{" "}
              {store.country}
            </p>
            <p>
              <span className="font-medium text-ink">Timezone:</span> {store.timezone}
            </p>
            <p>
              <span className="font-medium text-ink">Hours:</span> {store.timing}
            </p>
            <p>
              <span className="font-medium text-ink">Phone:</span> {store.phone}
            </p>
            <p>
              <span className="font-medium text-ink">Email:</span> contact@corebed.com
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={store.mapLink} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-5 py-3 text-sm text-ivory">
              Open in Google Maps
            </Link>
            <Link href="/store-locator" className="rounded-full border border-ink/12 px-5 py-3 text-sm text-ink">
              Back to locator
            </Link>
          </div>
        </article>

        <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white">
          <iframe
            title={`Map for ${store.address}, ${store.city}`}
            src={store.mapEmbedUrl}
            className="h-[320px] w-full sm:h-[420px] lg:h-[520px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </main>
  );
}
