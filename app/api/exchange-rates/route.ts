import { NextResponse } from "next/server";

import { getExchangeRates } from "@/lib/exchange-rates";

export async function GET() {
  const rates = await getExchangeRates();

  return NextResponse.json({
    base: "PKR",
    rates,
    updatedAt: new Date().toISOString()
  });
}
