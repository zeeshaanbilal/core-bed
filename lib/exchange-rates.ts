import { unstable_cache } from "next/cache";

import type { ExchangeRates } from "@/lib/format";

const EXCHANGE_RATE_ENDPOINT = "https://open.er-api.com/v6/latest/PKR";

const getCachedExchangeRates = unstable_cache(
  async () => {
    try {
      const response = await fetch(EXCHANGE_RATE_ENDPOINT, {
        next: { revalidate: 60 * 60 * 6 }
      });

      if (!response.ok) {
        throw new Error(`Exchange rate request failed with ${response.status}`);
      }

      const payload = (await response.json()) as {
        result?: string;
        rates?: ExchangeRates;
      };

      if (payload.result !== "success" || !payload.rates) {
        throw new Error("Exchange rate payload was incomplete.");
      }

      return payload.rates;
    } catch {
      return { PKR: 1 } satisfies ExchangeRates;
    }
  },
  ["exchange-rates-pkr"],
  { revalidate: 60 * 60 * 6 }
);

export async function getExchangeRates() {
  return getCachedExchangeRates();
}
