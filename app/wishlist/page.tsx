import Link from "next/link";

import { addToCartAction, removeWishlistAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { formatCurrency, getCustomerProfileByEmail, getWishlist, getWishlistByUserEmail } from "@/lib/mock-store";

export default async function WishlistPage() {
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [products, profile] = await Promise.all([
    user?.email ? getWishlistByUserEmail(user.email) : getWishlist(sessionId),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null)
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Wishlist</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Saved products and buying shortlist</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
        {user?.email
          ? "Yeh wishlist aapke current account ke sath linked hai. Login ke baad saved products har session mein same rahenge."
          : "Guest mode mein wishlist browser session ke sath save hoti hai. Login karne par items account-specific flow mein shift kiye ja sakte hain."}
      </p>

      <div className="mt-10 grid gap-6">
        {products.length === 0 ? (
          <div className="section-frame rounded-[1.75rem] p-8">
            <p className="text-sm leading-7 text-slate">No products saved yet. Use the save button on the shop cards to build a shortlist.</p>
            <Link href="/shop" className="mt-5 inline-block rounded-full bg-ink px-5 py-3 text-sm text-ivory">
              Browse shop
            </Link>
          </div>
        ) : (
          products.map((product) => (
            <article key={product.id} className="section-frame flex flex-col gap-5 rounded-[1.75rem] p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-bronze">{product.category}</p>
                <h2 className="mt-2 font-serif text-3xl">{product.name}</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate">{product.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <p className="self-center text-lg font-semibold">{formatCurrency(product.price, profile?.country)}</p>
                <form action={addToCartAction}>
                  <input name="productSlug" type="hidden" value={product.slug} />
                  <input name="selectedSize" type="hidden" value={product.sizes[0]} />
                  <input name="selectedFirmness" type="hidden" value={product.firmnessOptions[0] ?? product.firmness} />
                  <input name="quantity" type="hidden" value="1" />
                  <FormSubmitButton idleLabel="Move to cart" pendingLabel="Adding..." className="rounded-full bg-ink px-5 py-3 text-sm text-ivory" />
                </form>
                <form action={removeWishlistAction}>
                  <input name="productSlug" type="hidden" value={product.slug} />
                  <input name="returnTo" type="hidden" value="/wishlist" />
                  <FormSubmitButton idleLabel="Remove" pendingLabel="Removing..." className="rounded-full border border-ink/15 px-5 py-3 text-sm text-ink" />
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
