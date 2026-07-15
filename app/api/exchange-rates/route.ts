import { NextResponse } from "next/server";

const EXCHANGE_RATE_ENDPOINT = "https://open.er-api.com/v6/latest/PKR";

export async function GET() {
  try {
    const response = await fetch(EXCHANGE_RATE_ENDPOINT, {
      next: { revalidate: 60 * 60 * 6 }
    });

    if (!response.ok) {
      throw new Error(`Exchange rate request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
      base_code?: string;
    };

    if (payload.result !== "success" || !payload.rates) {
      throw new Error("Exchange rate payload was incomplete.");
    }

    return NextResponse.json({
      base: payload.base_code ?? "PKR",
      rates: payload.rates,
      updatedAt: payload.time_last_update_utc ?? null
    });
  } catch {
    return NextResponse.json(
      {
        base: "PKR",
        rates: { PKR: 1 },
        updatedAt: null
      },
      { status: 200 }
    );
  }
}
