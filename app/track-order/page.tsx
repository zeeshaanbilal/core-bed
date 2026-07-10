import { getOrders } from "@/lib/mock-store";

export default async function TrackOrderPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orders = await getOrders();
  const order = params.order ? orders.find((entry) => entry.orderNumber === params.order) : undefined;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Track order</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Track delivery and payment state</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
        Search by order number to surface a compact status view. This is the same user-facing utility expected from a complete ecommerce storefront.
      </p>

      <form className="section-frame mt-10 rounded-[1.75rem] p-6" method="get">
        <div className="flex flex-col gap-4 md:flex-row">
          <input className="flex-1 rounded-full border border-ink/10 bg-ivory px-5 py-4" name="order" placeholder="Enter order number like CB-1001" />
          <button className="rounded-full bg-ink px-6 py-4 text-sm text-ivory" type="submit">
            Track order
          </button>
        </div>
      </form>

      <div className="mt-10">
        {order ? (
          <article className="section-frame rounded-[1.75rem] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">{order.orderNumber}</p>
            <h2 className="mt-4 font-serif text-4xl">Current status: {order.orderStatus}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-ink/10 bg-ivory p-4 text-sm text-slate">Payment state: {order.paymentStatus}</div>
              <div className="rounded-2xl border border-ink/10 bg-ivory p-4 text-sm text-slate">City: {order.city}</div>
            </div>
          </article>
        ) : (
          <article className="section-frame rounded-[1.75rem] p-8">
            <p className="text-sm leading-7 text-slate">
              {params.order
                ? "No matching order found in the current dummy order store."
                : "Enter an order number after placing a test order from checkout."}
            </p>
          </article>
        )}
      </div>
    </main>
  );
}
