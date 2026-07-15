import { formatCurrency, getCurrencyConfig, type ExchangeRates } from "@/lib/format";

export function CurrencyAmount({
  value,
  country,
  className,
  exchangeRates
}: {
  value: number;
  country?: string;
  className?: string;
  exchangeRates?: ExchangeRates;
}) {
  const targetCurrency = getCurrencyConfig(country).currency;
  const displayValue =
    targetCurrency === "PKR" ? formatCurrency(value, country) : formatCurrency(value, country, exchangeRates);

  return (
    <span className={className}>{displayValue}</span>
  );
}
