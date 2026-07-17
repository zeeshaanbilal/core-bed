# Stripe Live Setup Guide

This document explains how to switch the Corebed checkout from Stripe test mode to Stripe live mode.

## 1. What is already built

The website already supports:

- Stripe card checkout inside the website
- Stripe checkout session creation from the server
- Stripe webhook syncing for paid, failed, and expired checkout sessions
- Order creation before payment confirmation
- Order status update after Stripe confirms payment

Current Stripe webhook route:

`/api/stripe/webhook`

Production webhook URL:

`https://corebed.com/api/stripe/webhook`

## 2. Stripe values you need from the Stripe dashboard

You need these three values:

1. `STRIPE_SECRET_KEY`
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. `STRIPE_WEBHOOK_SECRET`

Use live values for production:

- secret key should start with `sk_live_`
- publishable key should start with `pk_live_`
- webhook secret should start with `whsec_`

## 3. Where to get each value

### Secret key

In Stripe dashboard:

`Developers -> API keys`

Copy:

- Live secret key

Set it as:

`STRIPE_SECRET_KEY`

### Publishable key

In Stripe dashboard:

`Developers -> API keys`

Copy:

- Live publishable key

Set it as:

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Webhook secret

In Stripe dashboard:

`Developers -> Webhooks`

Create or open the endpoint:

`https://corebed.com/api/stripe/webhook`

After creating it, reveal the signing secret and copy it.

Set it as:

`STRIPE_WEBHOOK_SECRET`

## 4. Recommended webhook events

Subscribe the webhook to at least these events:

- `checkout.session.completed`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

These are the events currently handled by the codebase.

## 5. Vercel environment variables

In Vercel:

`Project -> Settings -> Environment Variables`

Add these values for `Production`:

```env
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_SITE_URL=https://corebed.com
```

If not already present, also keep these production values:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
ADMIN_EMAILS=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=contact@corebed.com
RESEND_FROM_NAME=Corebed
```

## 6. Important production checks in Stripe

Before going live, verify:

1. Your Stripe account is activated for live payments.
2. The business details are completed in Stripe.
3. The webhook endpoint is using the production domain:
   `https://corebed.com/api/stripe/webhook`
4. The website is using:
   `NEXT_PUBLIC_SITE_URL=https://corebed.com`

## 7. After adding environment variables

After updating Vercel variables:

1. Redeploy the project in Vercel.
2. Open:
   `https://corebed.com/admin/settings`
3. Confirm all three Stripe values show as detected:
   - Secret key
   - Publishable key
   - Webhook secret

## 8. Live payment test checklist

After deploy:

1. Add a product to cart
2. Go to checkout
3. Confirm Stripe form loads inside the website
4. Complete a live card payment
5. Confirm:
   - order is stored in admin orders
   - payment status becomes paid
   - shipping status updates
   - customer confirmation email is sent
   - admin order email is sent

## 9. If payment is created but order does not update

Check these first:

1. `STRIPE_WEBHOOK_SECRET` is correct
2. Webhook URL is exactly:
   `https://corebed.com/api/stripe/webhook`
3. Webhook events are enabled
4. Vercel deployment has the latest env values
5. Stripe event delivery logs show `200 OK`

## 10. Test vs live keys

The code uses the same environment variable names for test and live modes.

Only the values change:

- local or preview can use test keys
- production should use live keys

## 11. Current code behavior

The checkout uses:

- embedded Stripe checkout UI
- server-created checkout sessions
- webhook-based payment status syncing

That means no extra Stripe coding is required before going live if the correct live keys and webhook secret are added.
