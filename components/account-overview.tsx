import Link from "next/link";

import { logoutAction, updateAccountProfileAction } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import { formatCurrency, getCurrencyConfig } from "@/lib/format";
import { countryOptions } from "@/lib/site-data";
import type { SupabaseAuthUser } from "@/lib/supabase/server";
import { accountLinks } from "@/lib/site-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CustomerProfileRecord, OrderRecord } from "@/lib/store-types";

export function AccountOverview({
  error,
  success,
  user,
  isAdmin,
  profile,
  orders
}: {
  error?: string;
  success?: string;
  user: SupabaseAuthUser | null;
  isAdmin: boolean;
  profile: CustomerProfileRecord | null;
  orders: OrderRecord[];
}) {
  const configured = isSupabaseConfigured();
  const preferredCountry = profile?.country || "Pakistan";
  const preferredCurrency = getCurrencyConfig(preferredCountry).currency;

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-bronze">Account</p>
      <h1 className="mt-4 font-serif text-6xl leading-tight">Customer account and service center</h1>
      <p className="mt-6 max-w-3xl text-base leading-8 text-slate">
        Supabase auth, account access, and the admin entry point are managed here. Every signed-in customer can review and update profile, address, phone, country, and pricing preferences from this page.
      </p>

      {!configured ? (
        <div className="mt-8 rounded-[1.5rem] border border-[#ffcf99] bg-[#fff5e8] p-5 text-sm leading-7 text-[#80511f]">
          Supabase is not configured yet. As soon as the project keys are added to `.env`, login, signup, and admin protection will go live.
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-[1.5rem] border border-[#ffb9b9] bg-[#fff1f1] p-5 text-sm text-[#8a2b2b]">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-8 rounded-[1.5rem] border border-[#b9e2c7] bg-[#eefaf2] p-5 text-sm text-[#1f6b3c]">
          {success}
        </div>
      ) : null}

      {user ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="section-frame rounded-[1.75rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">Signed in</p>
            <h2 className="mt-4 font-serif text-4xl">{profile?.name || user.user_metadata?.["full_name"]?.toString() || user.email}</h2>
            <p className="mt-3 text-base text-slate">{user.email}</p>
            <p className="mt-4 text-sm leading-7 text-slate">
              {isAdmin ? "Admin access enabled for this account." : "Customer access active. Use the links on the right to continue."}
            </p>
            {profile ? (
              <div className="mt-6 space-y-2 rounded-[1.25rem] bg-[#f7fbff] p-4 text-sm leading-7 text-slate">
                <p>Phone: {profile.phone || "Not added yet"}</p>
                <p>City: {profile.city || "Not added yet"}</p>
                <p>
                  Preferred market: {preferredCountry} · Currency: {preferredCurrency}
                </p>
                <p>
                  Address: {[profile.addressLine1, profile.addressLine2, profile.state, profile.postalCode, profile.country]
                    .filter(Boolean)
                    .join(", ") || "Not added yet"}
                </p>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {isAdmin ? (
                <Link href="/admin" className="rounded-full bg-navy px-5 py-3 text-sm text-white">
                  Open admin panel
                </Link>
              ) : null}
              <form action={logoutAction}>
                <FormSubmitButton
                  idleLabel="Sign out"
                  pendingLabel="Signing out..."
                  className="rounded-full border border-ink/10 px-5 py-3 text-sm text-navy"
                />
              </form>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            <form action={updateAccountProfileAction} className="section-frame rounded-[1.75rem] p-6 md:col-span-2">
              <p className="font-serif text-3xl">Country and currency preferences</p>
              <p className="mt-3 text-sm leading-7 text-slate">
                Update your delivery country here. Product listings, cart totals, and checkout pricing will use this market preference, and your saved account details remain editable anytime.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.name || ""} name="fullName" placeholder="Full name" />
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.phone || ""} name="phone" placeholder="Phone number" />
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={profile?.addressLine1 || ""} name="addressLine1" placeholder="Address line 1" />
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" defaultValue={profile?.addressLine2 || ""} name="addressLine2" placeholder="Address line 2" />
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.city || ""} name="city" placeholder="City" />
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.state || ""} name="state" placeholder="State / Province" />
                <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={profile?.postalCode || ""} name="postalCode" placeholder="Postal code" />
                <select className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" defaultValue={preferredCountry} name="country">
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] bg-[#f7fbef] p-4 text-sm text-slate">
                <span>
                  Current pricing currency: <span className="font-semibold text-ink">{preferredCurrency}</span>
                </span>
                <FormSubmitButton
                  idleLabel="Save preferences"
                  pendingLabel="Saving..."
                  className="rounded-full bg-navy px-5 py-3 text-sm text-white"
                />
              </div>
            </form>

            <section className="section-frame rounded-[1.75rem] p-6 md:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-3xl">Order history</p>
                  <p className="mt-3 text-sm leading-7 text-slate">
                    Every order placed with this email stays visible here, so you can reopen tracking from your account anytime.
                  </p>
                </div>
                <Link href="/track-order" className="rounded-full border border-ink/10 px-5 py-3 text-sm text-navy">
                  Open tracking
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <article key={order.id} className="rounded-[1.25rem] border border-ink/10 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-bronze">{order.orderNumber}</p>
                          <h3 className="mt-2 text-xl font-semibold text-ink">
                            {order.items.map((item) => item.name).join(", ")}
                          </h3>
                          <p className="mt-2 text-sm text-slate">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}{" "}
                            · {order.customerType === "guest" ? "Guest checkout" : "Account order"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm uppercase tracking-[0.18em] text-slate/70">{order.orderStatus}</p>
                          <p className="mt-2 text-xl font-semibold text-ink">
                            {formatCurrency(order.total, order.country || preferredCountry)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                          className="rounded-full bg-navy px-5 py-3 text-sm text-white"
                        >
                          Track this order
                        </Link>
                        <span className="rounded-full border border-ink/10 px-4 py-3 text-sm text-slate">
                          Payment: {order.paymentStatus}
                        </span>
                        <span className="rounded-full border border-ink/10 px-4 py-3 text-sm text-slate">
                          Shipping: {order.shippingStatus || "order_received"}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-ink/15 bg-[#fcfaf5] p-5 text-sm leading-7 text-slate">
                    No order history is linked to this account yet. Once you place an order with this email, it will appear here automatically.
                  </div>
                )}
              </div>
            </section>

            {accountLinks.map((item) => (
              <Link key={item.href} href={item.href} className="section-frame rounded-[1.75rem] p-6">
                <p className="font-serif text-3xl">{item.label}</p>
                <p className="mt-3 text-sm leading-7 text-slate">Open the flow and continue through the customer account journey.</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accountLinks.map((item) => (
            <Link key={item.href} href={item.href} className="section-frame rounded-[1.75rem] p-6">
              <p className="font-serif text-3xl">{item.label}</p>
              <p className="mt-3 text-sm leading-7 text-slate">Open the flow and continue through the customer account journey.</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
