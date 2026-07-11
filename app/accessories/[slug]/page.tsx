import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { StructuredData } from "@/components/structured-data";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getAccessories, getAccessoryBySlug, getApprovedTestimonialsForProduct, getCustomerProfileByEmail, isProductWishlisted } from "@/lib/mock-store";
import { buildBreadcrumbSchema, buildMetadata, buildProductSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getAccessoryBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: "Accessory not found | Corebed",
      description: "The requested accessory could not be found.",
      path: `/accessories/${slug}`
    });
  }

  return buildMetadata({
    title: `${product.name} | Corebed Accessories`,
    description: product.description,
    path: `/accessories/${product.slug}`,
    image: product.image,
    keywords: [product.name, "accessories", product.material, product.firmness]
  });
}

export default async function AccessoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [product, products, wishlisted, testimonials, profile] = await Promise.all([
    getAccessoryBySlug(slug),
    getAccessories(),
    isProductWishlisted({ productSlug: slug, sessionId, userEmail: user?.email }),
    getApprovedTestimonialsForProduct(slug),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null)
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((entry) => entry.slug !== product.slug).slice(0, 3);

  return (
    <>
      <StructuredData
        data={[
          buildProductSchema(product, `/accessories/${product.slug}`, profile?.country),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Accessories", path: "/accessories" },
            { name: product.name, path: `/accessories/${product.slug}` }
          ])
        ]}
      />
      <ProductDetailView
        product={product}
        backHref="/accessories"
        backLabel="Accessories"
        compareLabel="Back to accessories"
        relatedProducts={relatedProducts}
        isWishlisted={wishlisted}
        testimonials={testimonials}
        country={profile?.country}
      />
    </>
  );
}
