"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import corebedLogo from "@/app/corebed-logo.png";

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

function WishlistIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 20.5s-7-4.35-7-10.1A4.4 4.4 0 0 1 9.45 6 4.9 4.9 0 0 1 12 7.37 4.9 4.9 0 0 1 14.55 6 4.4 4.4 0 0 1 19 10.4c0 5.75-7 10.1-7 10.1Z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5a7.8 7.8 0 0 1 13 0" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type MenuKey = "shop" | "sales" | null;

export function SiteHeader({
  cartCount,
  wishlistCount,
  isLoggedIn,
  isAdmin
}: {
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
        setAccountOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header ref={wrapperRef} className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/95 backdrop-blur">
      <div className="border-b border-ink/8 bg-[#f7f9fc]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-[11px] text-slate sm:px-6 sm:text-[13px]">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <Link href="/track-order" className="transition hover:text-navy">
              Track Order
            </Link>
            <Link href="/wishlist" className="transition hover:text-navy">
              Wishlist
            </Link>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-3 sm:gap-6">
            <span className="whitespace-nowrap">WhatsApp: +15855029662</span>
            <span className="hidden sm:inline">contact@corebed.com</span>
            <Link href="/store-locator" className="hidden transition hover:text-navy sm:inline">
              Stores
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:gap-4 sm:py-5">
        <Link href="/" className="flex items-center">
          <Image
            src={corebedLogo}
            alt="Corebed Natural Mattress"
            priority
            className="h-auto w-[126px] object-contain sm:w-[180px] md:w-[240px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-navy md:flex">
          <button
            className={`flex items-center gap-2 transition ${openMenu === "shop" ? "text-sky" : "hover:text-sky"}`}
            onClick={() => {
              setOpenMenu((current) => (current === "shop" ? null : "shop"));
              setAccountOpen(false);
            }}
            type="button"
          >
            <span>Shop</span>
            <ChevronDown />
          </button>
          <button
            className={`flex items-center gap-2 transition ${openMenu === "sales" ? "text-[#ff4025]" : "hover:text-[#ff4025]"}`}
            onClick={() => {
              setOpenMenu((current) => (current === "sales" ? null : "sales"));
              setAccountOpen(false);
            }}
            type="button"
          >
            <span>Sales</span>
            <ChevronDown />
          </button>
        </nav>

        <div className="flex items-center gap-2 text-sm text-navy sm:gap-4">
          <div className="relative hidden md:block">
            <button
              className="hidden md:flex"
              onClick={() => {
                setSearchOpen((current) => !current);
                setOpenMenu(null);
                setAccountOpen(false);
              }}
              type="button"
            >
              <SearchIcon />
            </button>

            {searchOpen ? (
              <form action="/search" className="absolute right-0 top-[calc(100%+14px)] flex w-[320px] gap-2 rounded-2xl border border-ink/10 bg-white p-3 shadow-[0_20px_50px_rgba(13,76,143,0.12)]">
                <input
                  autoFocus
                  className="min-w-0 flex-1 rounded-xl border border-ink/10 px-4 py-3 text-sm outline-none"
                  name="q"
                  placeholder="Search mattresses, pillows, guides..."
                  type="search"
                />
                <button className="rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white" type="submit">
                  Search
                </button>
              </form>
            ) : null}
          </div>
          <Link href="/wishlist" className="relative hidden md:flex">
            <WishlistIcon />
            {wishlistCount > 0 ? (
              <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-navy px-1.5 text-center text-[11px] font-semibold text-white">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <div className="relative">
            <button
              className={`flex items-center justify-center rounded-full border border-ink/10 p-2 transition sm:p-2 ${
                accountOpen ? "bg-[#f5f3ed] text-sky" : "bg-white hover:bg-[#f5f3ed]"
              }`}
              onClick={() => {
                setAccountOpen((current) => !current);
                setOpenMenu(null);
              }}
              type="button"
            >
              <ProfileIcon />
            </button>

            {accountOpen ? (
              <div className="absolute right-0 top-[calc(100%+12px)] w-48 rounded-md border border-ink/10 bg-white p-2 shadow-[0_20px_50px_rgba(13,76,143,0.12)]">
                {[
                  { href: "/account", label: "My Account" },
                  { href: "/wishlist", label: "My Wish List" },
                  ...(isAdmin ? [{ href: "/admin", label: "Admin Panel" }] : []),
                  ...(isLoggedIn ? [] : [{ href: "/account/register", label: "Create an Account" }, { href: "/account/login", label: "Sign In" }])
                ].map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="block rounded px-3 py-2 text-sm text-navy transition hover:bg-[#f7f4ee]"
                    onClick={() => setAccountOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <Link href="/cart" className="rounded-full bg-navy px-3 py-3 text-sm font-semibold text-ivory sm:px-5">
            Cart {cartCount > 0 ? `(${cartCount})` : ""}
          </Link>
        </div>
      </div>

      <div className="border-t border-ink/8 md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-3 sm:px-6">
          <button
            className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
              openMenu === "shop" ? "border-navy bg-navy text-white" : "border-ink/10 bg-white text-navy"
            }`}
            onClick={() => {
              setOpenMenu((current) => (current === "shop" ? null : "shop"));
              setAccountOpen(false);
              setSearchOpen(false);
            }}
            type="button"
          >
            <span>Shop</span>
            <ChevronDown />
          </button>
          <button
            className={`flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition ${
              openMenu === "sales" ? "border-[#ff4025] bg-[#ff4025] text-white" : "border-ink/10 bg-white text-navy"
            }`}
            onClick={() => {
              setOpenMenu((current) => (current === "sales" ? null : "sales"));
              setAccountOpen(false);
              setSearchOpen(false);
            }}
            type="button"
          >
            <span>Sales</span>
            <ChevronDown />
          </button>
        </div>
      </div>

      {openMenu === "shop" ? (
        <div className="border-t border-ink/8 bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.38em] text-sky">Shop Categories</p>
              <div className="space-y-4 text-[1.55rem] font-medium leading-tight tracking-[-0.05em] text-navy sm:text-[2rem]">
                <Link href="/shop" className="block transition hover:text-sky" onClick={() => setOpenMenu(null)}>
                  Mattresses
                </Link>
                <Link href="/pillows" className="block transition hover:text-sky" onClick={() => setOpenMenu(null)}>
                  Pillows
                </Link>
                <Link href="/accessories" className="block transition hover:text-sky" onClick={() => setOpenMenu(null)}>
                  Accessories
                </Link>
              </div>
              <Link
                href="/shop"
                className="inline-flex rounded-md border border-navy px-6 py-3 text-sm font-semibold text-navy"
                onClick={() => setOpenMenu(null)}
              >
                View All
              </Link>
            </div>

            <div>
              <div className="overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#f5f3ed_0%,#ebe6dc_100%)]">
                <div
                  className="h-[180px] w-full bg-contain bg-center bg-no-repeat sm:h-[220px]"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80)"
                  }}
                />
              </div>
              <p className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-navy sm:text-4xl">
                Premium sleep essentials with a cleaner, easier buying flow.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {openMenu === "sales" ? (
        <div className="border-t border-ink/8 bg-white">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.38em] text-[#ff4025]">Seasonal Campaigns</p>
              <div className="space-y-4 text-[1.55rem] font-medium leading-tight tracking-[-0.05em] text-navy sm:text-[2rem]">
                <Link href="/sales/summer" className="block transition hover:text-[#ff4025]" onClick={() => setOpenMenu(null)}>
                  Summer Sale
                </Link>
                <Link href="/sales/winter" className="block transition hover:text-[#ff4025]" onClick={() => setOpenMenu(null)}>
                  Winter Sale
                </Link>
              </div>
              <Link
                href="/sales"
                className="inline-flex rounded-md border border-[#ff4025] px-6 py-3 text-sm font-semibold text-[#ff4025]"
                onClick={() => setOpenMenu(null)}
              >
                View All Sales
              </Link>
            </div>

            <div>
              <div className="overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#f6f4ef_0%,#e7e0d4_100%)]">
                <div
                  className="h-[180px] w-full bg-cover bg-center sm:h-[220px]"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80)"
                  }}
                />
              </div>
              <p className="mt-5 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.05em] text-navy sm:text-4xl">
                Seasonal campaigns with dedicated pages for summer and winter offers.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
