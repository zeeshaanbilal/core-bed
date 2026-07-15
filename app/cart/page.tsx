import Link from "next/link";

import { removeCartItemAction, updateCartQuantityAction } from "@/app/actions/store";
import { CurrencyAmount } from "@/components/currency-amount";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { getCartDetail, getCustomerProfileByEmail } from "@/lib/mock-store";

export default async function CartPage() {
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [cart, profile] = await Promise.all([
    getCartDetail(sessionId),
    user?.email ? getCustomerProfileByEmail(user.email) : Promise.resolve(null)
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Cart</p>
          <h1 className="mt-4 font-serif text-6xl leading-tight">Review your sleep setup</h1>

          <div className="mt-10 space-y-4">
            {cart.items.length === 0 ? (
              <div className="section-frame rounded-[1.75rem] p-8">
                <p className="text-lg text-slate">Your cart is empty. Add a mattress from the shop to test the full checkout flow.</p>
                <Link href="/shop" className="mt-5 inline-block rounded-full bg-ink px-5 py-3 text-sm text-ivory">
                  Browse shop
                </Link>
              </div>
            ) : (
              cart.items.map((item) => (
                <article key={item.id} className="section-frame rounded-[1.75rem] p-5">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-bronze">
                        {item.selectedSize}
                        {item.selectedFirmness ? ` / ${item.selectedFirmness}` : ""}
                      </p>
                      <h2 className="mt-2 font-serif text-3xl">{item.product.name}</h2>
                      <p className="mt-2 text-sm text-slate">{item.product.description}</p>
                      <p className="mt-3 text-sm text-slate">
                        Unit price: <CurrencyAmount value={item.unitPrice} country={profile?.country} />
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <p className="text-xl font-semibold">
                        <CurrencyAmount value={item.lineTotal} country={profile?.country} />
                      </p>
                      <div className="flex gap-3">
                        <form action={updateCartQuantityAction} className="flex items-center gap-3">
                          <input name="itemId" type="hidden" value={item.id} />
                          <input name="quantity" type="hidden" value={Math.max(0, item.quantity - 1)} />
                          <FormSubmitButton
                            idleLabel="-"
                            pendingLabel="..."
                            className="h-10 w-10 rounded-full border border-ink/15 text-sm"
                          />
                        </form>
                        <div className="flex h-10 min-w-12 items-center justify-center rounded-full border border-ink/10 px-4 text-sm">
                          {item.quantity}
                        </div>
                        <form action={updateCartQuantityAction} className="flex items-center gap-3">
                          <input name="itemId" type="hidden" value={item.id} />
                          <input name="quantity" type="hidden" value={item.quantity + 1} />
                          <FormSubmitButton
                            idleLabel="+"
                            pendingLabel="..."
                            className="h-10 w-10 rounded-full border border-ink/15 text-sm"
                          />
                        </form>
                      </div>
                      <form action={removeCartItemAction}>
                        <input name="itemId" type="hidden" value={item.id} />
                        <FormSubmitButton
                          idleLabel="Remove"
                          pendingLabel="Removing..."
                          className="text-sm text-slate underline"
                        />
                      </form>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="section-frame h-fit rounded-[1.75rem] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Summary</p>
          <div className="mt-6 space-y-4 text-sm text-slate">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span><CurrencyAmount value={cart.subtotal} country={profile?.country} /></span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.shippingFee === 0 ? "Free" : <CurrencyAmount value={cart.shippingFee} country={profile?.country} />}</span>
            </div>
            <div className="border-t border-ink/10 pt-4">
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>Estimated total</span>
                <span><CurrencyAmount value={cart.total} country={profile?.country} /></span>
              </div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-8 inline-block w-full rounded-full bg-ink px-5 py-4 text-center text-sm text-ivory"
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
