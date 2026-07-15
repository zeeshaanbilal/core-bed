import { promises as fs } from "fs";
import path from "path";

import { getAdminEmails } from "@/lib/supabase/config";
import type { OrderRecord } from "@/lib/store-types";

const emailLogPath = path.join(process.cwd(), "data", "email-log.json");

export type EmailLogEntry = {
  id: string;
  channel: "customer" | "admin" | "account" | "test" | "system";
  provider: "resend";
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
  response?: string;
  createdAt: string;
};

function getResendApiKey() {
  return process.env.RESEND_API_KEY ?? "";
}

function getResendFromConfig() {
  const senderEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const senderName = process.env.RESEND_FROM_NAME?.trim();

  return {
    email: senderEmail ?? "",
    name: senderName || "Corebed"
  };
}

function isResendReady() {
  const token = getResendApiKey();
  const from = getResendFromConfig();
  return Boolean(token && from.email);
}

function isEmailReady() {
  return isResendReady();
}

function createEmailLogId() {
  return `email_${Math.random().toString(36).slice(2, 10)}`;
}

async function readEmailLogs() {
  try {
    const content = await fs.readFile(emailLogPath, "utf8");
    return JSON.parse(content) as EmailLogEntry[];
  } catch {
    return [];
  }
}

async function appendEmailLog(entry: Omit<EmailLogEntry, "id" | "createdAt">) {
  const logs = await readEmailLogs();
  const nextEntry: EmailLogEntry = {
    id: createEmailLogId(),
    createdAt: new Date().toISOString(),
    ...entry
  };

  await fs.mkdir(path.dirname(emailLogPath), { recursive: true });
  await fs.writeFile(emailLogPath, JSON.stringify([nextEntry, ...logs].slice(0, 50), null, 2));
}

async function sendViaResend(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  const apiToken = getResendApiKey();
  const from = getResendFromConfig();

  if (!apiToken || !from.email) {
    throw new Error("Resend email skipped. Missing RESEND_API_KEY or from email.");
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  return Promise.all(
    recipients.map(async (recipient) => {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          from: `${from.name} <${from.email}>`,
          to: [recipient],
          subject: input.subject,
          html: input.html,
          text: input.text
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = await response.text();
        throw new Error(`Resend email failed: ${payload}`);
      }

      const payload = await response.json();
      return JSON.stringify(payload);
    })
  );
}

async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  if (isResendReady()) {
    return sendViaResend(input);
  }

  console.log("Email skipped. Missing Resend configuration.", input.subject, input.to);
  return { skipped: true };
}

type EmailDispatchResult = {
  ok: boolean;
  skipped: boolean;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderOrderItems(order: OrderRecord) {
  return order.items
    .map((item) => `<li>${item.name} - ${item.selectedSize}${item.selectedFirmness ? ` / ${item.selectedFirmness}` : ""} x ${item.quantity}</li>`)
    .join("");
}

export async function sendAccountConfirmationEmail(input: { email: string; customerName?: string }) {
  const customerName = input.customerName?.trim() || "there";
  const subject = "Confirm your Corebed account";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #2f2a28; line-height: 1.7;">
      <h1 style="margin-bottom: 12px;">Confirm your Corebed account</h1>
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>Welcome to Corebed.</p>
      <p>Your account has been created successfully and is now ready to use for orders, saved products, and account updates.</p>
      <p>You can now sign in and continue shopping from the website.</p>
      <p style="margin-top: 24px;">Corebed<br/>contact@corebed.com</p>
    </div>
  `;
  const text = `Hi ${customerName},

Welcome to Corebed.

Your account has been created successfully and is now ready to use for orders, saved products, and account updates.

You can now sign in and continue shopping from the website.

Corebed
contact@corebed.com`;

  try {
    const result = await sendEmail({
      to: input.email,
      subject,
      html,
      text
    });

    const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
    const response = Array.isArray(result) ? result.join("\n") : undefined;

    await appendEmailLog({
      channel: "account",
      provider: "resend",
      recipient: input.email,
      subject,
      status: skipped ? "skipped" : "sent",
      response,
      error: skipped ? "Resend configuration missing." : undefined
    });

    return {
      ok: !skipped,
      skipped
    } satisfies EmailDispatchResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown account email error";
    console.error(`[email][account][${input.email}] ${message}`);
    await appendEmailLog({
      channel: "account",
      provider: "resend",
      recipient: input.email,
      subject,
      status: "failed",
      error: message
    });

    return {
      ok: false,
      skipped: false,
      error: message
    } satisfies EmailDispatchResult;
  }
}

export async function sendOrderConfirmationEmails(order: OrderRecord) {
  const adminEmails = getAdminEmails();
  const itemsHtml = renderOrderItems(order);
  const itemsText = order.items
    .map((item) => `${item.name} - ${item.selectedSize}${item.selectedFirmness ? ` / ${item.selectedFirmness}` : ""} x ${item.quantity}`)
    .join("\n");
  const customerSubject = `Your Corebed order ${order.orderNumber} is confirmed`;
  const adminSubject = `New Corebed order received - ${order.orderNumber}`;
  const customerName = order.customerName?.trim() || "there";
  const trackOrderUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"}/track-order`;

  const customerPromise = sendEmail({
    to: order.customerEmail,
    subject: customerSubject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #2f2a28; line-height: 1.7;">
        <h1 style="margin-bottom: 12px;">Your order is confirmed</h1>
        <p>Hi ${escapeHtml(customerName)},</p>
        <p>Thank you for your order at Corebed.</p>
        <p>Your order has been confirmed successfully.</p>
        <p><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}<br/>
        <strong>Payment status:</strong> ${escapeHtml(order.paymentStatus)}<br/>
        <strong>Order total:</strong> PKR ${order.total.toLocaleString("en-PK")}<br/>
        <strong>Delivery country:</strong> ${escapeHtml(order.country || "Not specified")}</p>
        <p><strong>Items:</strong></p>
        <ul>${itemsHtml}</ul>
        <p><a href="${trackOrderUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#2f2a28;color:#ffffff;text-decoration:none;">Track your order</a></p>
        <p>If you need help, contact us at contact@corebed.com or WhatsApp +15855029662.</p>
        <p style="margin-top: 24px;">Corebed</p>
      </div>
    `,
    text: `Hi ${customerName},

Thank you for your order at Corebed.

Your order has been confirmed successfully.

Order number: ${order.orderNumber}
Payment status: ${order.paymentStatus}
Order total: PKR ${order.total.toLocaleString("en-PK")}
Delivery country: ${order.country || "Not specified"}

Items:
${itemsText}

Track your order:
${trackOrderUrl}

If you need help, contact us at contact@corebed.com or WhatsApp +15855029662.

Corebed`
  })
    .then(async (result) => {
      const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
      const response = Array.isArray(result) ? result.join("\n") : undefined;
      await appendEmailLog({
        channel: "customer",
        provider: "resend",
        recipient: order.customerEmail,
        subject: customerSubject,
        status: skipped ? "skipped" : "sent",
        response
      });
      return {
        ok: !skipped,
        skipped
      } satisfies EmailDispatchResult;
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown customer email error";
      console.error(`[email][customer][${order.orderNumber}] ${message}`);
      void appendEmailLog({
        channel: "customer",
        provider: "resend",
        recipient: order.customerEmail,
        subject: customerSubject,
        status: "failed",
        error: message
      });
      return {
        ok: false,
        skipped: false,
        error: message
      } satisfies EmailDispatchResult;
    });

  const adminPromise =
    adminEmails.length > 0
      ? sendEmail({
          to: adminEmails,
          subject: adminSubject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #2f2a28; line-height: 1.7;">
              <h1 style="margin-bottom: 12px;">New Corebed order received</h1>
              <p><strong>Order number:</strong> ${escapeHtml(order.orderNumber)}</p>
              <p><strong>Customer:</strong> ${escapeHtml(order.customerName)}<br/>
              <strong>Email:</strong> ${escapeHtml(order.customerEmail)}<br/>
              <strong>Phone:</strong> ${escapeHtml(order.customerPhone)}<br/>
              <strong>City:</strong> ${escapeHtml(order.city)}<br/>
              <strong>Country:</strong> ${escapeHtml(order.country || "Not specified")}</p>
              <p><strong>Payment status:</strong> ${escapeHtml(order.paymentStatus)}</p>
              <ul>${itemsHtml}</ul>
              <p><strong>Total:</strong> PKR ${order.total.toLocaleString("en-PK")}</p>
            </div>
          `,
          text: `New Corebed order received

Order number: ${order.orderNumber}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
City: ${order.city}
Country: ${order.country || "Not specified"}
Payment status: ${order.paymentStatus}

Items:
${itemsText}

Total: PKR ${order.total.toLocaleString("en-PK")}`
        })
          .then(async (result) => {
            const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
            const response = Array.isArray(result) ? result.join("\n") : undefined;
            await appendEmailLog({
              channel: "admin",
              provider: "resend",
              recipient: adminEmails.join(", "),
              subject: adminSubject,
              status: skipped ? "skipped" : "sent",
              response
            });
            return {
              ok: !skipped,
              skipped
            } satisfies EmailDispatchResult;
          })
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unknown admin email error";
            console.error(`[email][admin][${order.orderNumber}] ${message}`);
            void appendEmailLog({
              channel: "admin",
              provider: "resend",
              recipient: adminEmails.join(", "),
              subject: adminSubject,
              status: "failed",
              error: message
            });
            return {
              ok: false,
              skipped: false,
              error: message
            } satisfies EmailDispatchResult;
          })
      : Promise.resolve({
          ok: false,
          skipped: true
        } satisfies EmailDispatchResult);

  const [customerResult, adminResult] = await Promise.all([customerPromise, adminPromise]);

  return {
    customer: customerResult,
    admin: adminResult
  };
}

export function areOrderEmailsConfigured() {
  return isEmailReady();
}

export function getEmailConfigurationSummary() {
  const from = getResendFromConfig();
  const adminEmails = getAdminEmails();

  return {
    senderReady: isResendReady(),
    senderFromEmail: from.email,
    senderFromName: from.name,
    hasApiToken: Boolean(getResendApiKey()),
    adminEmails
  };
}

export async function getRecentEmailLogs() {
  return readEmailLogs();
}

export async function sendTestEmail(recipient: string) {
  const summary = getEmailConfigurationSummary();
  const subject = "Corebed test email";

  try {
    const result = await sendEmail({
      to: recipient,
      subject,
      html: "<h1>Corebed email test</h1><p>If you received this, Resend delivery from the website is working.</p>",
      text: "Corebed email test. If you received this, Resend delivery from the website is working."
    });

    const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
    const response = Array.isArray(result) ? result.join("\n") : undefined;

    await appendEmailLog({
        channel: "test",
        provider: "resend",
        recipient,
        subject,
        status: skipped ? "skipped" : "sent",
        response,
        error: skipped ? "Resend configuration missing." : undefined
      });

    return {
      ok: !skipped,
      skipped,
      reason: skipped ? "Resend configuration missing." : undefined,
      summary
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Resend error";
    await appendEmailLog({
      channel: "test",
      provider: "resend",
      recipient,
      subject,
      status: "failed",
      error: message
    });

    return {
      ok: false,
      skipped: false,
      reason: message,
      summary
    };
  }
}
