import Link from "next/link";

import { submitCheckoutAction } from "@/app/actions/store";
import { FormSubmitButton } from "@/components/form-submit-button";
import { StripeEmbeddedCheckout } from "@/components/stripe-embedded-checkout";
import { getCurrentUser } from "@/lib/auth";
import { getCartSessionId } from "@/lib/cart-session";
import { formatCurrency, getCartDetail, getCustomerProfileByEmail, getOrderByPaymentReference } from "@/lib/mock-store";
import { isStripeConfigured } from "@/lib/supabase/config";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; canceled?: string; embedded?: string; payment_reference?: string }>;
}) {
  const params = await searchParams;
  const sessionId = await getCartSessionId();
  const user = await getCurrentUser();
  const [cart, profile, stripeOrder] = await Promise.all([
    getCartDetail(sessionId),
    user?.email ? getCustomerProfileByEmail(user.email) : null,
    params.payment_reference ? getOrderByPaymentReference(params.payment_reference) : Promise.resolve(null)
  ]);
  const stripeReady = isStripeConfigured();
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const showEmbeddedCheckout = params.embedded === "1" && Boolean(stripeOrder?.paymentClientSecret && publishableKey);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Checkout</p>
          <h1 className="mt-4 font-serif text-6xl leading-tight">
            {showEmbeddedCheckout ? "Secure card payment" : "Structured checkout with embedded Stripe payment"}
          </h1>

          {params.error ? (
            <div className="mt-6 rounded-[1.25rem] border border-[#ffb9b9] bg-[#fff1f1] p-4 text-sm text-[#8a2b2b]">
              {params.error}
            </div>
          ) : null}

          {params.canceled ? (
            <div className="mt-6 rounded-[1.25rem] border border-[#d8d1c4] bg-[#f8f4ec] p-4 text-sm text-navy">
              The Stripe payment was canceled. You can keep the same details and continue secure payment again.
            </div>
          ) : null}

          {cart.items.length === 0 && !showEmbeddedCheckout ? (
            <div className="section-frame mt-10 rounded-[1.75rem] p-8">
              <p className="text-sm leading-7 text-slate">
                Your cart is empty, so checkout cannot create an order yet. Add a product first to test the full flow.
              </p>
              <Link href="/shop" className="mt-5 inline-block rounded-full bg-ink px-5 py-3 text-sm text-ivory">
                Go to shop
              </Link>
            </div>
          ) : showEmbeddedCheckout && stripeOrder?.paymentClientSecret ? (
            <div className="mt-10 space-y-6">
              <div className="section-frame rounded-[1.75rem] p-6">
                <p className="font-serif text-3xl">Pay without leaving the website</p>
                <p className="mt-3 text-sm leading-7 text-slate">
                  The secure Stripe card form is loaded directly on this page. Order reference:{" "}
                  <span className="font-semibold text-ink">{stripeOrder.orderNumber}</span>
                </p>
              </div>
              <div className="section-frame rounded-[1.75rem] p-4">
                <StripeEmbeddedCheckout publishableKey={publishableKey} clientSecret={stripeOrder.paymentClientSecret} />
              </div>
            </div>
          ) : (
            <form action={submitCheckoutAction} className="mt-10 space-y-6">
              <article className="section-frame rounded-[1.75rem] p-6">
                <p className="font-serif text-3xl">Customer details</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input
                    className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                    defaultValue={profile?.name || user?.user_metadata?.["full_name"]?.toString() || ""}
                    name="customerName"
                    placeholder="Full name"
                    required
                  />
                  <input
                    className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
                    defaultValue={profile?.phone || user?.user_metadata?.["phone"]?.toString() || ""}
                    name="customerPhone"
                    placeholder="Phone number"
                    required
                  />
                  <input
                    className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2"
                    defaultValue={user?.email || profile?.email || ""}
                    name="customerEmail"
                    placeholder="Email address"
                    required
                    type="email"
                  />
                </div>
              </article>

              <article className="section-frame rounded-[1.75rem] p-6">
                <p className="font-serif text-3xl">Shipping details</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={profile?.addressLine1 || ""} name="addressLine1" placeholder="Address line 1" required />
                  <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={profile?.addressLine2 || ""} name="addressLine2" placeholder="Address line 2 (optional)" />
                  <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.city || ""} name="city" placeholder="City" required />
                  <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.state || ""} name="state" placeholder="State / Province" />
                  <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.postalCode || ""} name="postalCode" placeholder="Postal code" />
                  <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.country || "Pakistan"} name="country" placeholder="Country" required />
                  <textarea className="min-h-24 rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="notes" placeholder="Delivery notes, landmark, or support request" />
                </div>
              </article>

              <article className="section-frame rounded-[1.75rem] p-6">
                <p className="font-serif text-3xl">Payment structure</p>
                <div className="mt-4 rounded-2xl border border-ink/10 bg-[#f8f4ec] p-4 text-sm leading-7 text-slate">
                  {stripeReady
                    ? "Stripe card payment loads inside this website with an embedded secure form. No external redirect is required."
                    : "Stripe is not configured yet. Add the Stripe keys to enable card checkout."}
                </div>
                <div className="mt-5 grid gap-4">
                  <label className="rounded-2xl border border-ink/10 bg-ivory p-4">
                    <input defaultChecked name="paymentMethod" type="radio" value="stripe_card" />{" "}
                    <span className="font-medium">Embedded Stripe card payment</span>
                    <span className="mt-2 block text-sm text-slate">
                      The secure card form opens inside this website and keeps the full checkout journey on-page.
                    </span>
                  </label>
                  <label className="rounded-2xl border border-ink/10 bg-ivory p-4">
                    <input name="paymentMethod" type="radio" value="bank_transfer" />{" "}
                    <span className="font-medium">Manual bank transfer</span>
                    <span className="mt-2 block text-sm text-slate">
                      Marks the order as awaiting transfer and keeps the reconciliation path ready for admin review.
                    </span>
                  </label>
                  <label className="rounded-2xl border border-ink/10 bg-ivory p-4">
                    <input name="paymentMethod" type="radio" value="cash_on_delivery" />{" "}
                    <span className="font-medium">Cash on delivery</span>
                    <span className="mt-2 block text-sm text-slate">
                      Keeps COD visible for city-based logic and later order value restrictions.
                    </span>
                  </label>
                </div>
              </article>

              <FormSubmitButton idleLabel="Continue to payment" pendingLabel="Processing..." className="rounded-full bg-ink px-6 py-4 text-sm text-ivory" />
            </form>
          )}
        </section>

        <aside className="section-frame h-fit rounded-[1.75rem] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-bronze">Order summary</p>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.product.name} x {item.quantity}
                  <span className="block text-xs text-slate">
                    {item.selectedSize}
                    {item.selectedFirmness ? ` / ${item.selectedFirmness}` : ""}
                  </span>
                </span>
                <span>{formatCurrency(item.lineTotal, profile?.country)}</span>
              </div>
            ))}
            <div className="border-t border-ink/10 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal, profile?.country)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Shipping</span>
                <span>{cart.shippingFee === 0 ? "Free" : formatCurrency(cart.shippingFee, profile?.country)}</span>
              </div>
              <div className="mt-4 flex justify-between text-base font-semibold text-ink">
                <span>Total</span>
                <span>{formatCurrency(cart.total, profile?.country)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
