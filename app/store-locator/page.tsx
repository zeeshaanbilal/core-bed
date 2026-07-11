import type { Metadata } from "next";

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

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {storeLocations.map((location) => (
          <article key={location.city} className="section-frame rounded-[1.75rem] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">{location.city}</p>
            <h2 className="mt-4 font-serif text-3xl">{location.address}</h2>
            <p className="mt-4 text-sm leading-7 text-slate">Showroom hours: {location.timing}</p>
            <p className="text-sm leading-7 text-slate">Support: {location.phone}</p>
            <p className="text-sm leading-7 text-slate">Email: contact@corebed.com</p>
            <button className="mt-6 rounded-full bg-ink px-5 py-3 text-sm text-ivory">Book visit</button>
          </article>
        ))}
      </div>
    </main>
  );
}
