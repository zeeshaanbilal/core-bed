import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { StructuredData } from "@/components/structured-data";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getApprovedTestimonialsForProduct, getCustomerProfileByEmail, getProducts, getProductBySlug, isProductWishlisted } from "@/lib/mock-store";
import { buildBreadcrumbSchema, buildMetadata, buildProductSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: "Product not found | Corebed",
      description: "The requested product could not be found.",
      path: `/shop/${slug}`
    });
  }

  return buildMetadata({
    title: `${product.name} | Corebed Mattresses`,
    description: product.description,
    path: `/shop/${product.slug}`,
    image: product.image,
    keywords: [product.name, product.category, product.material, product.firmness]
  });
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [product, products, wishlisted, testimonials, profile] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
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
          buildProductSchema(product, `/shop/${product.slug}`, profile?.country),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Mattresses", path: "/shop" },
            { name: product.name, path: `/shop/${product.slug}` }
          ])
        ]}
      />
      <ProductDetailView
        product={product}
        backHref="/shop"
        backLabel="Mattresses"
        compareLabel="Back to mattresses"
        relatedProducts={relatedProducts}
        isWishlisted={wishlisted}
        testimonials={testimonials}
        country={profile?.country}
      />
    </>
  );
}
