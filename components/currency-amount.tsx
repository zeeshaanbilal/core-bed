"use client";

import { useEffect, useState } from "react";

import { formatCurrency, getCurrencyConfig, type ExchangeRates } from "@/lib/format";

let cachedRates: ExchangeRates | null = null;
let pendingRatesRequest: Promise<ExchangeRates | null> | null = null;

async function loadExchangeRates() {
  if (cachedRates) {
    return cachedRates;
  }

  if (!pendingRatesRequest) {
    pendingRatesRequest = fetch("/api/exchange-rates", {
      method: "GET",
      cache: "force-cache"
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as { rates?: ExchangeRates };
        cachedRates = payload.rates ?? null;
        return cachedRates;
      })
      .catch(() => null)
      .finally(() => {
        pendingRatesRequest = null;
      });
  }

  return pendingRatesRequest;
}

export function CurrencyAmount({
  value,
  country,
  className
}: {
  value: number;
  country?: string;
  className?: string;
}) {
  const fallbackValue = formatCurrency(value, country);
  const [displayValue, setDisplayValue] = useState(fallbackValue);
  const targetCurrency = getCurrencyConfig(country).currency;

  useEffect(() => {
    let mounted = true;

    setDisplayValue(fallbackValue);

    if (targetCurrency === "PKR") {
      return () => {
        mounted = false;
      };
    }

    void loadExchangeRates().then((rates) => {
      if (!mounted || !rates) {
        return;
      }

      setDisplayValue(formatCurrency(value, country, rates));
    });

    return () => {
      mounted = false;
    };
  }, [country, fallbackValue, targetCurrency, value]);

  return (
    <span className={className} suppressHydrationWarning>
      {displayValue}
    </span>
  );
}
