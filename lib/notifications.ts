import { getAdminEmails } from "@/lib/supabase/config";
import type { OrderRecord } from "@/lib/store-types";

function getSenderApiToken() {
  return process.env.SENDER_API_TOKEN ?? "";
}

function getSenderFromConfig() {
  const senderEmail = process.env.SENDER_FROM_EMAIL?.trim();
  const senderName = process.env.SENDER_FROM_NAME?.trim();

  return {
    email: senderEmail ?? "",
    name: senderName || "Corebed"
  };
}

function isSenderReady() {
  const token = getSenderApiToken();
  const from = getSenderFromConfig();
  return Boolean(token && from.email);
}

function isEmailReady() {
  return isSenderReady();
}

async function sendViaSender(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  const apiToken = getSenderApiToken();
  const from = getSenderFromConfig();

  if (!apiToken || !from.email) {
    throw new Error("Sender email skipped. Missing SENDER_API_TOKEN or sender from email.");
  }

  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  return Promise.all(
    recipients.map(async (recipient) => {
      const response = await fetch("https://api.sender.net/v2/message/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          from,
          to: {
            email: recipient
          },
          subject: input.subject,
          html: input.html,
          text: input.text
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = await response.text();
        throw new Error(`Sender email failed: ${payload}`);
      }

      return response.json();
    })
  );
}

async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}) {
  if (isSenderReady()) {
    return sendViaSender(input);
  }

  console.log("Email skipped. Missing Sender configuration.", input.subject, input.to);
  return { skipped: true };
}

type EmailDispatchResult = {
  ok: boolean;
  skipped: boolean;
  error?: string;
};

function renderOrderItems(order: OrderRecord) {
  return order.items
    .map((item) => `<li>${item.name} - ${item.selectedSize}${item.selectedFirmness ? ` / ${item.selectedFirmness}` : ""} x ${item.quantity}</li>`)
    .join("");
}

export async function sendOrderConfirmationEmails(order: OrderRecord) {
  const adminEmails = getAdminEmails();
  const itemsHtml = renderOrderItems(order);
  const itemsText = order.items
    .map((item) => `${item.name} - ${item.selectedSize}${item.selectedFirmness ? ` / ${item.selectedFirmness}` : ""} x ${item.quantity}`)
    .join("\n");

  const customerPromise = sendEmail({
    to: order.customerEmail,
    subject: `Corebed order confirmed - ${order.orderNumber}`,
    html: `<h1>Order Confirmed</h1><p>Thank you ${order.customerName}.</p><p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p><ul>${itemsHtml}</ul><p>Total: PKR ${order.total.toLocaleString("en-PK")}</p>`,
    text: `Order Confirmed\nOrder: ${order.orderNumber}\n${itemsText}\nTotal: PKR ${order.total.toLocaleString("en-PK")}`
  })
    .then((result) => ({
      ok: !("skipped" in Object(result) && (result as { skipped?: boolean }).skipped),
      skipped: "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped)
    }) satisfies EmailDispatchResult)
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Unknown customer email error";
      console.error(`[email][customer][${order.orderNumber}] ${message}`);
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
          subject: `New confirmed order - ${order.orderNumber}`,
          html: `<h1>New Confirmed Order</h1><p>Customer: ${order.customerName}</p><p>Email: ${order.customerEmail}</p><p>Phone: ${order.customerPhone}</p><p>City: ${order.city}</p><ul>${itemsHtml}</ul><p>Total: PKR ${order.total.toLocaleString("en-PK")}</p>`,
          text: `New Confirmed Order\nOrder: ${order.orderNumber}\nCustomer: ${order.customerName}\n${itemsText}\nTotal: PKR ${order.total.toLocaleString("en-PK")}`
        })
          .then((result) => ({
            ok: !("skipped" in Object(result) && (result as { skipped?: boolean }).skipped),
            skipped: "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped)
          }) satisfies EmailDispatchResult)
          .catch((error: unknown) => {
            const message = error instanceof Error ? error.message : "Unknown admin email error";
            console.error(`[email][admin][${order.orderNumber}] ${message}`);
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
