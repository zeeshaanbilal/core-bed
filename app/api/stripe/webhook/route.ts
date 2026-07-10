import crypto from "node:crypto";

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { syncStripeOrderStatus } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? "";
}

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const pairs = signatureHeader.split(",").map((item) => item.trim());
  const timestamp = pairs.find((item) => item.startsWith("t="))?.slice(2);
  const signatures = pairs.filter((item) => item.startsWith("v1=")).map((item) => item.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return signatures.some((signature) => {
    try {
      const signatureBuffer = Buffer.from(signature, "hex");
      return signatureBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  });
}

type StripeWebhookEvent = {
  id: string;
  type: string;
  data?: {
    object?: {
      id?: string;
      payment_status?: string;
      status?: string;
    };
  };
};

export async function POST(request: Request) {
  const secret = getWebhookSecret();

  if (!secret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature || !verifyStripeSignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  const event = JSON.parse(body) as StripeWebhookEvent;
  const rawWebhook = JSON.parse(body) as Prisma.JsonObject;
  const session = event.data?.object;
  const paymentReference = session?.id;

  if (!paymentReference) {
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    await syncStripeOrderStatus({
      paymentReference,
      paymentStatus: session?.payment_status || "paid",
      orderStatus: session?.payment_status === "paid" ? "PAID" : "PENDING",
      shippingStatus: session?.payment_status === "paid" ? "ready_for_fulfillment" : "payment_processing",
      rawWebhook
    });
  }

  if (event.type === "checkout.session.async_payment_failed") {
    await syncStripeOrderStatus({
      paymentReference,
      paymentStatus: "failed",
      orderStatus: "CANCELLED",
      shippingStatus: "payment_failed",
      rawWebhook
    });
  }

  if (event.type === "checkout.session.expired") {
    await syncStripeOrderStatus({
      paymentReference,
      paymentStatus: "expired",
      orderStatus: "CANCELLED",
      shippingStatus: "session_expired",
      rawWebhook
    });
  }

  return NextResponse.json({ received: true });
}
