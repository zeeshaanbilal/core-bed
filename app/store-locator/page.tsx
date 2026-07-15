import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";
import { storeLocations } from "@/lib/site-data";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Store Locator | Find a Showroom Near You",
  description:
    "Find Corebed showroom and support locations, with store timing, contact details, and visit planning information.",
  path: "/store-locator",
  keywords: ["store locator", "mattress showroom", "Corebed contact", "visit store"]
});

export default function StoreLocatorPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Store locator</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Find a CoreSleep showroom near you</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
        This route gives the same practical showroom discovery utility expected from a mature mattress retailer, while staying in Corebed&apos;s own visual system.
      </p>

      <div className="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {storeLocations.map((location) => (
          <article key={location.city} className="section-frame rounded-[1.75rem] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">{location.city}</p>
            <h2 className="mt-4 font-serif text-3xl">{location.address}</h2>
            <p className="mt-4 text-sm leading-7 text-slate">{location.summary}</p>
            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-ink/10">
              <iframe
                title={`Map preview for ${location.address}`}
                src={location.mapEmbedUrl}
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate">
              {location.city}, {location.state}
            </p>
            <p className="text-sm leading-7 text-slate">
              {location.postalCode}, {location.country}
            </p>
            <p className="text-sm leading-7 text-slate">Timezone: {location.timezone}</p>
            <p className="mt-4 text-sm leading-7 text-slate">Showroom hours: {location.timing}</p>
            <p className="text-sm leading-7 text-slate">Support: {location.phone}</p>
            <p className="text-sm leading-7 text-slate">Email: contact@corebed.com</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/store-locator/${location.slug}`} className="rounded-full bg-ink px-5 py-3 text-sm text-ivory">
                View details
              </Link>
              <Link href={location.mapLink} target="_blank" rel="noreferrer" className="rounded-full border border-ink/12 px-5 py-3 text-sm text-ink">
                Open map
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
