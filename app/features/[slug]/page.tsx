import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/structured-data";
import { buildBreadcrumbSchema, buildMetadata } from "@/lib/seo";
import { featureCards } from "@/lib/site-data";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = featureCards.find((entry) => entry.slug === slug);

  if (!feature) {
    return buildMetadata({
      title: "Feature not found | Corebed",
      description: "The requested Corebed feature page could not be found.",
      path: `/features/${slug}`
    });
  }

  return buildMetadata({
    title: `${feature.title} | Corebed`,
    description: feature.body,
    path: `/features/${feature.slug}`
  });
}

export default async function FeatureDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const feature = featureCards.find((entry) => entry.slug === slug);

  if (!feature) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: feature.title, path: `/features/${feature.slug}` }
        ])}
      />
      <div className="mb-8 flex items-center gap-3 text-sm text-slate">
        <Link href="/" className="text-navy">
          Home
        </Link>
        <span>&gt;</span>
        <span>{feature.title}</span>
      </div>

      <section className="grid gap-8 rounded-[2rem] border border-[#dfe8d7] bg-[linear-gradient(135deg,#fbfcf8_0%,#f5f7f1_46%,#edf2e6_100%)] p-5 shadow-[0_22px_70px_rgba(70,86,53,0.08)] sm:p-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="flex flex-col justify-between rounded-[1.5rem] bg-white/85 p-5 sm:p-8">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#cbd9bc] text-4xl text-navy">
              {feature.icon}
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-bronze">Corebed feature</p>
            <h1 className="mt-4 text-3xl font-semibold leading-[0.95] tracking-[-0.06em] text-navy sm:text-4xl lg:text-5xl">
              {feature.title}
            </h1>
            <p className="mt-5 text-base leading-8 text-slate">{feature.body}</p>
          </div>
          <Link href="/" className="mt-10 inline-flex rounded-full border border-navy px-5 py-3 text-sm font-semibold text-navy">
            Back to home
          </Link>
        </div>

        <div className="rounded-[1.5rem] bg-[#2f2a28] p-5 text-white sm:p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8e3c5]">Detail</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-4xl">
            {feature.detailTitle}
          </h2>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/82">{feature.detailBody}</p>
          <div className="mt-8 grid gap-4">
            {feature.bullets.map((bullet) => (
              <div key={bullet} className="rounded-[1.25rem] border border-white/12 bg-white/6 p-5 text-sm leading-7 text-white/84">
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
