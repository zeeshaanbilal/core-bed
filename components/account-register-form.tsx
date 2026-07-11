"use client";

import { useState } from "react";
import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
import { FormSubmitButton } from "@/components/form-submit-button";
import { getCurrencyConfig } from "@/lib/format";
import { countryOptions } from "@/lib/site-data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AccountRegisterForm({ error }: { error?: string }) {
  const configured = isSupabaseConfigured();
  const [country, setCountry] = useState("Pakistan");
  const currency = getCurrencyConfig(country).currency;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="section-frame rounded-[2rem] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-bronze">Account</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight">Create a CoreSleep customer account</h1>

        {!configured ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#ffcf99] bg-[#fff5e8] p-4 text-sm leading-7 text-[#80511f]">
            Supabase auth is not configured yet. Add the required environment keys and registration will go live.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[1.25rem] border border-[#ffb9b9] bg-[#fff1f1] p-4 text-sm text-[#8a2b2b]">
            {error}
          </div>
        ) : null}

        <form action={registerAction} className="mt-8 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="fullName" placeholder="Full name" required />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="phone" placeholder="Phone number" required />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="email" placeholder="Email" required type="email" />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="addressLine1" placeholder="Address line 1" required />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3 md:col-span-2" name="addressLine2" placeholder="Address line 2 (optional)" />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="city" placeholder="City" required />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="state" placeholder="State / Province" />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="postalCode" placeholder="Postal code" />
            <select
              className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3"
              name="country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              required
            >
              {countryOptions.map((countryOption) => (
                <option key={countryOption} value={countryOption}>
                  {countryOption}
                </option>
              ))}
            </select>
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="password" placeholder="Password" required type="password" />
            <input className="rounded-2xl border border-ink/10 bg-ivory px-4 py-3" name="confirmPassword" placeholder="Confirm password" required type="password" />
          </div>
          <div className="rounded-[1.25rem] border border-[#dbe8b2] bg-[#f7fbef] p-4 text-sm leading-7 text-slate">
            Preferred market: <span className="font-semibold text-ink">{country}</span>
            <br />
            Product prices will be shown in <span className="font-semibold text-ink">{currency}</span> after account creation and sign-in.
          </div>
          <label className="text-sm text-slate">
            <input className="mr-2" type="checkbox" /> Sign up for sleep guides and offers
          </label>
          <FormSubmitButton
            idleLabel="Create account"
            pendingLabel="Creating..."
            className="rounded-full bg-ink px-5 py-3 text-sm text-ivory"
          />
        </form>
        <p className="mt-6 text-sm text-slate">
          Already registered? <Link href="/account/login">Sign in here</Link>
        </p>
      </div>
    </main>
  );
}
