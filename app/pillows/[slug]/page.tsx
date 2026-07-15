import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { StructuredData } from "@/components/structured-data";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getExchangeRates } from "@/lib/exchange-rates";
import { getApprovedTestimonialsForProduct, getCustomerProfileByEmail, getPillowBySlug, getPillows, isProductWishlisted } from "@/lib/mock-store";
import { buildBreadcrumbSchema, buildMetadata, buildProductSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPillowBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: "Pillow not found | Corebed",
      description: "The requested pillow could not be found.",
      path: `/pillows/${slug}`
    });
  }

  return buildMetadata({
    title: `${product.name} | Corebed Pillows`,
    description: product.description,
    path: `/pillows/${product.slug}`,
    image: product.image,
    keywords: [product.name, "pillows", product.material, product.firmness]
  });
}

export default async function PillowDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [product, products, wishlisted, testimonials, profile, exchangeRates] = await Promise.all([
    getPillowBySlug(slug),
    getPillows(),
    isProductWishlisted({ productSlug: slug, sessionId, userEmail: user?.email }),
    getApprovedTestimonialsForProduct(slug),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null),
    getExchangeRates()
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((entry) => entry.slug !== product.slug).slice(0, 3);

  return (
    <>
      <StructuredData
        data={[
          buildProductSchema(product, `/pillows/${product.slug}`, profile?.country),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Pillows", path: "/pillows" },
            { name: product.name, path: `/pillows/${product.slug}` }
          ])
        ]}
      />
      <ProductDetailView
        product={product}
        backHref="/pillows"
        backLabel="Pillows"
        compareLabel="Back to pillows"
        relatedProducts={relatedProducts}
        isWishlisted={wishlisted}
        testimonials={testimonials}
        country={profile?.country}
        exchangeRates={exchangeRates}
      />
    </>
  );
}
