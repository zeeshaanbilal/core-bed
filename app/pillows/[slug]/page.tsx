import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getApprovedTestimonialsForProduct, getPillowBySlug, getPillows, isProductWishlisted } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function PillowDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [product, products, wishlisted, testimonials] = await Promise.all([
    getPillowBySlug(slug),
    getPillows(),
    isProductWishlisted({ productSlug: slug, sessionId, userEmail: user?.email }),
    getApprovedTestimonialsForProduct(slug)
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((entry) => entry.slug !== product.slug).slice(0, 3);

  return (
    <ProductDetailView
      product={product}
      backHref="/pillows"
      backLabel="Pillows"
      compareLabel="Back to pillows"
      relatedProducts={relatedProducts}
      isWishlisted={wishlisted}
      testimonials={testimonials}
    />
  );
}
