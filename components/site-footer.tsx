"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.3 0-1.2-.1-2.3-.1-2.2 0-3.8 1.3-3.8 4V11H7.5v3h2.4v7h3.6Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.6 7.2a2.9 2.9 0 0 0-2.1-2A28.7 28.7 0 0 0 12 4.8a28.7 28.7 0 0 0-7.5.4 2.9 2.9 0 0 0-2.1 2A30.3 30.3 0 0 0 2 12a30.3 30.3 0 0 0 .4 4.8 2.9 2.9 0 0 0 2.1 2 28.7 28.7 0 0 0 7.5.4 28.7 28.7 0 0 0 7.5-.4 2.9 2.9 0 0 0 2.1-2A30.3 30.3 0 0 0 22 12a30.3 30.3 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.7 3c.3 1.8 1.4 3.4 3.1 4.2 1 .5 2 .8 3.2.8v3.3a9 9 0 0 1-3-.5v5.8a6.3 6.3 0 1 1-5.4-6.2v3.4a2.9 2.9 0 1 0 2 2.8V3h3.1Z" />
    </svg>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const isBlogPage = pathname === "/blog" || pathname.startsWith("/blog/");
  const socialLinks = [
    { href: "https://facebook.com/corebedmattress", label: "Facebook", icon: <FacebookIcon /> },
    { href: "https://instagram.com/core.bed", label: "Instagram", icon: <InstagramIcon /> },
    { href: "https://youtube.com/@core_bed", label: "YouTube", icon: <YouTubeIcon /> },
    { href: "https://tiktok.com/@corebedmattress", label: "TikTok", icon: <TikTokIcon /> }
  ];

  return (
    <footer className="bg-[#2c2623] text-ivory">
      {isBlogPage ? null : (
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#f7f4ee_0%,#ece6dc_50%,#e2dacd_100%)]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative z-10 max-w-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#dbe8b2] text-2xl text-[#342d28]">
                *
              </div>
              <h2 className="font-serif text-6xl font-semibold leading-[0.94] tracking-[-0.07em] text-[#342d28]">
                Enjoy deeper sleep and more daily energy.
              </h2>
              <Link
                href="/blog"
                className="mt-10 inline-flex rounded-lg border border-[#342d28]/30 bg-white/70 px-10 py-4 text-xl font-semibold text-[#342d28] transition hover:bg-white"
              >
                Read article
              </Link>
            </div>
            <div className="min-h-[260px] rounded-[1.5rem] bg-[url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center shadow-[0_25px_80px_rgba(0,0,0,0.18)]" />
          </div>
        </div>
      )}

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 lg:flex-row">
          <h3 className="text-center font-serif text-5xl font-semibold tracking-[-0.05em] text-white">
            Sign up and never miss a deal
          </h3>
          <div className="flex w-full max-w-[640px] flex-col overflow-hidden rounded-xl border border-white/40 md:flex-row">
            <input
              className="min-h-[66px] flex-1 bg-transparent px-6 text-base text-white placeholder:text-white/55"
              placeholder="Enter your email address"
            />
            <button className="min-h-[66px] bg-white px-12 text-xl font-semibold text-navy">Submit</button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-5">
        <div className="space-y-4">
          <h2 className="font-serif text-3xl">About Company</h2>
          <Link href="/account" className="block text-sm text-ivory/80">
            About Us
          </Link>
          <Link href="/account" className="block text-sm text-ivory/80">
            Become A Partner
          </Link>
          <Link href="/account" className="block text-sm text-ivory/80">
            Careers
          </Link>
          <Link href="/track-order" className="block text-sm text-ivory/80">
            Track Order
          </Link>
          <Link href="/faq" className="block text-sm text-ivory/80">
            Warranty Policy
          </Link>
          <Link href="/blog" className="block text-sm text-ivory/80">
            Blogs
          </Link>
          <Link href="/store-locator" className="block text-sm text-ivory/80">
            Contact Us
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-3xl font-semibold tracking-[-0.03em] text-ivory">Mattresses</p>
          <Link href="/shop">Diamond Supreme Foam</Link>
          <Link href="/shop">DolceVita - The King of Mattresses</Link>
          <Link href="/shop">Health Supporter</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-3xl font-semibold tracking-[-0.03em] text-ivory">Pillows & Accessories</p>
          <Link href="/shop">Health Care</Link>
          <Link href="/shop">Standard Pillows</Link>
          <Link href="/shop">Accessories</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-3xl font-semibold tracking-[-0.03em] text-ivory">Supreme Inside</p>
          <Link href="/reviews">Customer Reviews</Link>
          <Link href="/blog">Sleep Tips</Link>
          <Link href="/materials">Materials</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-3xl font-semibold tracking-[-0.03em] text-ivory">Furniture</p>
          <Link href="/store-locator">View All</Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 pb-8 text-sm text-ivory/72 md:flex-row">
        <div className="flex items-center gap-4">
          {socialLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={item.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white transition hover:border-[#dbe8b2] hover:text-[#dbe8b2]"
            >
              {item.icon}
            </a>
          ))}
        </div>
        <p>2026 Corebed Sleep Studio | All Rights Reserved.</p>
        <div className="flex gap-6">
          <Link href="/faq">Privacy Policy</Link>
          <Link href="/faq">Terms & Conditions</Link>
          <Link href="/faq">FAQ&apos;s</Link>
        </div>
      </div>
    </footer>
  );
}
