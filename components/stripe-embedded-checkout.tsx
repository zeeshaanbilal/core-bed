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
      } catch (mountError) {
        setError(mountError instanceof Error ? mountError.message : "Unable to load Stripe checkout");
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

  return <div ref={hostRef} className="min-h-[620px]" />;
}
