import { isStripeConfigured } from "@/lib/supabase/config";

type StripeLineItemInput = {
  quantity: number;
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
      images?: string[];
    };
    unit_amount: number;
  };
};

type StripeCheckoutSession = {
  id: string;
  url?: string;
  client_secret?: string;
  payment_status: string;
  customer_email?: string | null;
  customer_details?: {
    name?: string | null;
    phone?: string | null;
  } | null;
  metadata?: Record<string, string>;
};

function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY ?? "";
}

function toCheckoutFormBody(input: {
  customerEmail: string;
  metadata: Record<string, string>;
  lineItems: StripeLineItemInput[];
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
  embedded?: boolean;
}) {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("customer_email", input.customerEmail);
  params.set("payment_method_types[0]", "card");

  if (input.embedded) {
    params.set("ui_mode", "embedded_page");
    params.set("redirect_on_completion", "always");
    params.set("return_url", input.returnUrl ?? "");
  } else {
    params.set("success_url", input.successUrl ?? "");
    params.set("cancel_url", input.cancelUrl ?? "");
  }

  input.lineItems.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, item.price_data.currency);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.price_data.unit_amount));
    params.set(`line_items[${index}][price_data][product_data][name]`, item.price_data.product_data.name);

    if (item.price_data.product_data.description) {
      params.set(`line_items[${index}][price_data][product_data][description]`, item.price_data.product_data.description);
    }

    item.price_data.product_data.images?.forEach((image, imageIndex) => {
      params.set(`line_items[${index}][price_data][product_data][images][${imageIndex}]`, image);
    });
  });

  Object.entries(input.metadata).forEach(([key, value]) => {
    params.set(`metadata[${key}]`, value);
  });

  return params;
}

async function stripeRequest<T>(path: string, init?: RequestInit) {
  const secretKey = getStripeSecretKey();

  if (!isStripeConfigured() || !secretKey) {
    throw new Error("Stripe is not configured");
  }

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const payload = (await response.json()) as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Stripe request failed");
  }

  return payload as T;
}

export function isStripeServerReady() {
  return isStripeConfigured();
}

export async function createStripeCheckoutSession(input: {
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  lineItems: StripeLineItemInput[];
}) {
  return stripeRequest<StripeCheckoutSession>("checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: toCheckoutFormBody(input).toString()
  });
}

export async function createStripeEmbeddedCheckoutSession(input: {
  customerEmail: string;
  returnUrl: string;
  metadata: Record<string, string>;
  lineItems: StripeLineItemInput[];
}) {
  return stripeRequest<StripeCheckoutSession>("checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: toCheckoutFormBody({
      customerEmail: input.customerEmail,
      returnUrl: input.returnUrl,
      metadata: input.metadata,
      lineItems: input.lineItems,
      embedded: true
    }).toString()
  });
}

export async function getStripeCheckoutSession(sessionId: string) {
  return stripeRequest<StripeCheckoutSession>(`checkout/sessions/${sessionId}`);
}
