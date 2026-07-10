import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/product-detail-view";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getAccessories, getAccessoryBySlug, getApprovedTestimonialsForProduct, isProductWishlisted } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function AccessoryDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [product, products, wishlisted, testimonials] = await Promise.all([
    getAccessoryBySlug(slug),
    getAccessories(),
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
      backHref="/accessories"
      backLabel="Accessories"
      compareLabel="Back to accessories"
      relatedProducts={relatedProducts}
      isWishlisted={wishlisted}
      testimonials={testimonials}
    />
  );
}
