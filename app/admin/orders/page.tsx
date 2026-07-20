import { updateOrderStatusAction } from "@/app/actions/store";
import { formatCurrency, getOrders } from "@/lib/mock-store";

const orderStatusOptions = ["pending", "processing", "paid", "shipped", "delivered", "cancelled"] as const;
const paymentStatusOptions = ["unpaid", "pending", "paid", "failed", "refunded", "expired"] as const;
const shippingStatusOptions = ["order_received", "processing", "shipped", "out_for_delivery", "delivered"] as const;

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "paid" || normalized === "ready_for_fulfillment" || normalized === "processing") {
    return "bg-[#edf8f0] text-[#17663b]";
  }

  if (normalized === "failed" || normalized === "expired" || normalized === "cancelled") {
    return "bg-[#fff1f1] text-[#9b2f2f]";
  }

  return "bg-[#f4f7fb] text-navy";
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Orders</p>
        <h2 className="mt-4 font-serif text-5xl leading-tight">Order operations shell</h2>
      </div>

      <div className="section-frame overflow-hidden rounded-[1.75rem]">
        <table className="min-w-full border-collapse text-left">
          <thead className="bg-ink text-ivory">
            <tr>
              <th className="px-6 py-4 text-sm font-medium">Order</th>
              <th className="px-6 py-4 text-sm font-medium">Customer</th>
              <th className="px-6 py-4 text-sm font-medium">Order status</th>
              <th className="px-6 py-4 text-sm font-medium">City</th>
              <th className="px-6 py-4 text-sm font-medium">Total</th>
              <th className="px-6 py-4 text-sm font-medium">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr className="border-t border-ink/10">
                <td className="px-6 py-5 text-sm text-slate" colSpan={6}>
                  No orders yet. Complete checkout once to populate this table.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-ink/10">
                  <td className="px-6 py-5 text-sm text-slate">
                    <div className="space-y-1">
                      <div className="font-medium text-ink">{order.orderNumber}</div>
                      <div className="text-xs uppercase tracking-[0.22em] text-slate/70">
                        {order.paymentMethod.replaceAll("_", " ")}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate">
                    <div className="space-y-1">
                      <div className="font-medium text-ink">{order.customerName || "Guest customer"}</div>
                      <div className="text-xs">{order.customerEmail}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate/70">
                        {order.customerType === "guest" ? "Guest checkout" : "Account order"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${getStatusTone(order.orderStatus)}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate">{order.city}</td>
                  <td className="px-6 py-5 text-sm text-slate">{formatCurrency(order.total, order.country)}</td>
                  <td className="px-6 py-5 text-sm text-slate">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${getStatusTone(order.paymentStatus)}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {orders.length > 0 ? (
        <div className="grid gap-5">
          {orders.map((order) => (
            <form key={order.id} action={updateOrderStatusAction} className="section-frame rounded-[1.75rem] p-6">
              <input name="id" type="hidden" value={order.id} />

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-bronze">Update order</p>
                  <h3 className="mt-3 font-serif text-3xl text-ink">{order.orderNumber}</h3>
                  <p className="mt-2 text-sm text-slate">
                    {order.customerName || "Guest customer"} · {order.customerEmail}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate/70">
                    {order.customerType === "guest" ? "Guest checkout · no linked account history" : "Linked to customer account"}
                  </p>
                </div>

                <button className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-ivory" type="submit">
                  Save status
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm text-slate">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate/70">Order status</span>
                  <select
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-ink"
                    defaultValue={order.orderStatus}
                    name="orderStatus"
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status.toUpperCase()}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate/70">Payment state</span>
                  <select
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-ink"
                    defaultValue={order.paymentStatus}
                    name="paymentStatus"
                  >
                    {paymentStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate/70">Shipping state</span>
                  <select
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-ink"
                    defaultValue={order.shippingStatus || "order_received"}
                    name="shippingStatus"
                  >
                    {shippingStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.25rem] border border-ink/10 bg-[#fcfaf5] p-4 text-sm leading-7 text-slate">
                  <p className="text-xs uppercase tracking-[0.22em] text-bronze">Shipping address</p>
                  <p className="mt-3 font-medium text-ink">{order.customerName || "Guest customer"}</p>
                  <p>{order.addressLine1 || order.address || "Address not captured"}</p>
                  {order.addressLine2 ? <p>{order.addressLine2}</p> : null}
                  <p>{[order.city, order.state, order.postalCode].filter(Boolean).join(", ")}</p>
                  <p>{order.country || "Pakistan"}</p>
                </div>

                <div className="rounded-[1.25rem] border border-ink/10 bg-[#fcfaf5] p-4 text-sm leading-7 text-slate">
                  <p className="text-xs uppercase tracking-[0.22em] text-bronze">Contact and notes</p>
                  <p className="mt-3">
                    <span className="font-medium text-ink">Phone:</span> {order.customerPhone || "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium text-ink">Email:</span> {order.customerEmail}
                  </p>
                  <p>
                    <span className="font-medium text-ink">Notes:</span> {order.notes || "No delivery note added"}
                  </p>
                </div>
              </div>
            </form>
          ))}
        </div>
      ) : null}
    </div>
  );
}
