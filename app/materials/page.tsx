import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";
import { materialHighlights } from "@/lib/site-data";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Materials | Natural Latex, Cooling Layers and Mattress Construction",
  description:
    "Learn about Corebed mattress materials including natural latex, cooling layers, and structural comfort components with buyer-friendly explanations.",
  path: "/materials",
  keywords: ["mattress materials", "natural latex", "cooling layers", "mattress construction"]
});

export default function MaterialsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Materials</p>
        <h1 className="mt-4 font-serif text-6xl leading-tight">Build trust with verified comfort layers</h1>
        <p className="mt-6 text-base leading-8 text-slate">
          The placeholder materials section from the current site has been replaced with a layout ready for verified supplier data, certification blocks and diagram-driven storytelling.
        </p>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {materialHighlights.map((item) => (
          <article key={item} className="section-frame rounded-[1.75rem] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Material pillar</p>
            <h2 className="mt-4 font-serif text-3xl">{item}</h2>
            <p className="mt-4 text-sm leading-7 text-slate">
              Verified claims, breathable construction notes and buyer-friendly explanations will connect here once product and supplier content is finalized.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
