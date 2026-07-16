"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => {
      initEmbeddedCheckout: (input: {
        fetchClientSecret: () => Promise<string>;
      }) => Promise<{
        mount: (selector: string | HTMLElement) => void;
        destroy: () => void;
      }>;
    };
  }
}

function ensureStripeScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Unable to load Stripe.js")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Stripe.js"));
    document.head.appendChild(script);
  });
}

export function StripeEmbeddedCheckout({
  publishableKey,
  clientSecret
}: {
  publishableKey: string;
  clientSecret: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let embeddedCheckout: { mount: (selector: string | HTMLElement) => void; destroy: () => void } | null = null;

    async function mountCheckout() {
      try {
        await ensureStripeScript();

        if (!window.Stripe || !hostRef.current || !mounted) {
          return;
        }

        const stripe = window.Stripe(publishableKey);
        embeddedCheckout = await stripe.initEmbeddedCheckout({
          fetchClientSecret: async () => clientSecret
        });

        embeddedCheckout.mount(hostRef.current);
        if (mounted) {
          setLoading(false);
        }
      } catch (mountError) {
        setError(mountError instanceof Error ? mountError.message : "Unable to load Stripe checkout");
        setLoading(false);
      }
    }

    void mountCheckout();

    return () => {
      mounted = false;
      embeddedCheckout?.destroy();
    };
  }, [clientSecret, publishableKey]);

  if (error) {
    return <p className="rounded-2xl border border-[#ffb9b9] bg-[#fff1f1] p-4 text-sm text-[#8a2b2b]">{error}</p>;
  }

  return (
    <div className="relative min-h-[620px]">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.25rem] bg-[#faf7f1]/85">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-ink" />
            <p className="mt-4 text-sm text-slate">Loading secure card form...</p>
          </div>
        </div>
      ) : null}
      <div ref={hostRef} className="min-h-[620px]" />
    </div>
  );
}
