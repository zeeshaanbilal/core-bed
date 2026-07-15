import { promises as fs } from "fs";
import path from "path";

import { getAdminEmails } from "@/lib/supabase/config";
import type { OrderRecord } from "@/lib/store-types";

const emailLogPath = path.join(process.cwd(), "data", "email-log.json");

export type EmailLogEntry = {
  id: string;
  channel: "customer" | "admin" | "test" | "system";
  provider: "sender";
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
  response?: string;
  createdAt: string;
};

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
    .then(async (result) => {
      const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
      const response = Array.isArray(result) ? result.join("\n") : undefined;
      await appendEmailLog({
        channel: "customer",
        provider: "sender",
        recipient: order.customerEmail,
        subject: `Corebed order confirmed - ${order.orderNumber}`,
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
        provider: "sender",
        recipient: order.customerEmail,
        subject: `Corebed order confirmed - ${order.orderNumber}`,
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
          subject: `New confirmed order - ${order.orderNumber}`,
          html: `<h1>New Confirmed Order</h1><p>Customer: ${order.customerName}</p><p>Email: ${order.customerEmail}</p><p>Phone: ${order.customerPhone}</p><p>City: ${order.city}</p><ul>${itemsHtml}</ul><p>Total: PKR ${order.total.toLocaleString("en-PK")}</p>`,
          text: `New Confirmed Order\nOrder: ${order.orderNumber}\nCustomer: ${order.customerName}\n${itemsText}\nTotal: PKR ${order.total.toLocaleString("en-PK")}`
        })
          .then(async (result) => {
            const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
            const response = Array.isArray(result) ? result.join("\n") : undefined;
            await appendEmailLog({
              channel: "admin",
              provider: "sender",
              recipient: adminEmails.join(", "),
              subject: `New confirmed order - ${order.orderNumber}`,
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
              provider: "sender",
              recipient: adminEmails.join(", "),
              subject: `New confirmed order - ${order.orderNumber}`,
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
  const from = getSenderFromConfig();
  const adminEmails = getAdminEmails();

  return {
    senderReady: isSenderReady(),
    senderFromEmail: from.email,
    senderFromName: from.name,
    hasApiToken: Boolean(getSenderApiToken()),
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
      html: "<h1>Corebed email test</h1><p>If you received this, Sender delivery from the website is working.</p>",
      text: "Corebed email test. If you received this, Sender delivery from the website is working."
    });

    const skipped = "skipped" in Object(result) && Boolean((result as { skipped?: boolean }).skipped);
    const response = Array.isArray(result) ? result.join("\n") : undefined;

    await appendEmailLog({
      channel: "test",
      provider: "sender",
      recipient,
      subject,
      status: skipped ? "skipped" : "sent",
      response,
      error: skipped ? "Sender configuration missing." : undefined
    });

    return {
      ok: !skipped,
      skipped,
      reason: skipped ? "Sender configuration missing." : undefined,
      summary
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Sender error";
    await appendEmailLog({
      channel: "test",
      provider: "sender",
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
