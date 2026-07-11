import type { Metadata } from "next";
import Link from "next/link";

import { searchStore } from "@/lib/mock-store";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Corebed Search | Find Products, Guides and Support Pages",
  description:
    "Search across Corebed mattresses, pillows, accessories, support pages, and educational blog content.",
  path: "/search",
  keywords: ["site search", "find mattress", "search pillows", "search blog"]
});

function getProductHref(category: string, slug: string) {
  if (category.toLowerCase() === "pillows") {
    return `/pillows/${slug}`;
  }

  if (category.toLowerCase() === "accessories") {
    return `/accessories/${slug}`;
  }

  return `/shop/${slug}`;
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const results = await searchStore(query);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Search</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Find products, categories and guides</h1>

      <form action="/search" className="mt-8 flex max-w-3xl gap-3">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-ink/10 bg-white px-5 py-4 text-base"
          defaultValue={query}
          name="q"
          placeholder="Search mattresses, pillows, accessories, blog posts..."
          type="search"
        />
        <button className="rounded-2xl bg-navy px-6 py-4 text-sm font-semibold text-white" type="submit">
          Search
        </button>
      </form>

      {!query ? (
        <div className="section-frame mt-10 rounded-[1.75rem] p-8 text-sm leading-7 text-slate">
          Use the search bar to find products by name, category, comfort level, material, support notes, or blog article title.
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-4xl">Products</h2>
              <p className="text-sm text-slate">{results.products.length} results</p>
            </div>
            <div className="space-y-4">
              {results.products.length === 0 ? (
                <div className="section-frame rounded-[1.5rem] p-6 text-sm text-slate">No matching products found.</div>
              ) : (
                results.products.map((product) => (
                  <Link
                    key={product.id}
                    href={getProductHref(product.category, product.slug)}
                    className="section-frame block rounded-[1.5rem] p-6 transition hover:-translate-y-0.5"
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-bronze">{product.category}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-navy">{product.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate">{product.description}</p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-4xl">Guides</h2>
              <p className="text-sm text-slate">{results.posts.length} results</p>
            </div>
            <div className="space-y-4">
              {results.posts.length === 0 ? (
                <div className="section-frame rounded-[1.5rem] p-6 text-sm text-slate">No matching guides found.</div>
              ) : (
                results.posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="section-frame block rounded-[1.5rem] p-6 transition hover:-translate-y-0.5">
                    <p className="text-xs uppercase tracking-[0.25em] text-bronze">{post.categories.join(", ")}</p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-navy">{post.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate">{post.excerpt}</p>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
