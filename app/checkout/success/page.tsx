import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { getOrderByPaymentReference, syncStripeOrderStatus } from "@/lib/mock-store";
import { getStripeCheckoutSession, isStripeServerReady } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>;
}) {
  const params = await searchParams;
  let orderNumber = params.order ?? "CB-TEST";
  let heading = "Checkout flow completed";
  let description =
    "Your order has been stored successfully and the payment journey is complete.";
  let paymentState = "processing";

  if (params.session_id) {
    if (isStripeServerReady()) {
      const checkoutSession = await getStripeCheckoutSession(params.session_id);
      paymentState = checkoutSession.payment_status || "processing";

      if (paymentState === "paid") {
        await syncStripeOrderStatus({
          paymentReference: checkoutSession.id,
          paymentStatus: "paid",
          orderStatus: "PAID",
          shippingStatus: "ready_for_fulfillment",
          rawWebhook: JSON.parse(JSON.stringify(checkoutSession)) as Prisma.JsonObject
        });
      }

      const existingOrder = await getOrderByPaymentReference(checkoutSession.id);
      orderNumber = existingOrder?.orderNumber ?? orderNumber;

      heading = paymentState === "paid" ? "Payment confirmed" : "Payment received";
      description =
        paymentState === "paid"
          ? "Your Stripe payment was completed successfully and your order is now confirmed."
          : "Your Stripe checkout returned successfully. We have your order and payment verification is in progress.";
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <div className="section-frame rounded-[2rem] p-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Order created</p>
        <h1 className="mt-4 font-serif text-6xl leading-tight">{heading}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate">
          {description} Order reference: <span className="font-semibold text-ink">{orderNumber}</span>.
        </p>
        <p className="mt-3 text-sm uppercase tracking-[0.22em] text-bronze">Payment state: {paymentState}</p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/shop" className="rounded-full border border-ink/15 px-5 py-3 text-sm">
            Continue shopping
          </Link>
          <Link href="/admin/orders" className="rounded-full bg-ink px-5 py-3 text-sm text-ivory">
            View admin orders
          </Link>
        </div>
      </div>
    </main>
  );
}
