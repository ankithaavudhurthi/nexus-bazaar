import { Resend } from "resend";

let client: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

const FROM = "Nexus Bazaar <notifications@nexusbazaar.com>";

async function send(to: string, subject: string, html: string) {
  const resend = getResend();
  if (!resend) {
    // No API key configured — log instead of throwing, so the surrounding
    // business logic (order creation, payouts, etc.) never fails because
    // notifications aren't set up yet.
    console.log(`[email skipped — no RESEND_API_KEY] to=${to} subject="${subject}"`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

function layout(title: string, bodyHtml: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #17191c;">
      <h2 style="color: #ff5a1f;">Nexus Bazaar</h2>
      <h3>${title}</h3>
      ${bodyHtml}
      <p style="margin-top: 24px; font-size: 12px; color: #9a9d9f;">
        This is an automated message from Nexus Bazaar.
      </p>
    </div>
  `;
}

export async function sendVendorApprovedEmail(to: string, shopName: string) {
  await send(
    to,
    "Your vendor application was approved",
    layout(
      "You're approved!",
      `<p>Congrats — <strong>${shopName}</strong> is now live on Nexus Bazaar. Log in to add products and start selling.</p>`
    )
  );
}

export async function sendVendorRejectedEmail(to: string, shopName: string, reason: string) {
  await send(
    to,
    "Update on your vendor application",
    layout(
      "Application not approved",
      `<p>Your application for <strong>${shopName}</strong> wasn't approved this time.</p>
       <p><strong>Reason:</strong> ${reason}</p>`
    )
  );
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  total: string
) {
  await send(
    to,
    `Order confirmed — ${orderNumber}`,
    layout(
      "Thanks for your order!",
      `<p>Order <strong>${orderNumber}</strong> is confirmed. Total charged: ₹${total}.</p>`
    )
  );
}

export async function sendNewOrderVendorEmail(
  to: string,
  orderNumber: string,
  itemCount: number
) {
  await send(
    to,
    `New order — ${orderNumber}`,
    layout(
      "You've got a new order",
      `<p>Order <strong>${orderNumber}</strong> just came in with ${itemCount} item(s). Head to your dashboard to start fulfillment.</p>`
    )
  );
}

export async function sendShipmentStatusEmail(
  to: string,
  orderNumber: string,
  status: "SHIPPED" | "DELIVERED",
  trackingCarrier?: string | null,
  trackingNumber?: string | null
) {
  const trackingLine =
    status === "SHIPPED" && trackingNumber
      ? `<p>Tracking: ${trackingCarrier ?? ""} ${trackingNumber}</p>`
      : "";
  await send(
    to,
    `Order ${orderNumber} ${status === "SHIPPED" ? "has shipped" : "was delivered"}`,
    layout(
      status === "SHIPPED" ? "Your order is on its way" : "Your order was delivered",
      `<p>Order <strong>${orderNumber}</strong> is now <strong>${status.toLowerCase()}</strong>.</p>${trackingLine}`
    )
  );
}

export async function sendPayoutSummaryEmail(to: string, amount: string, orderCount: number) {
  await send(
    to,
    "Payout processed",
    layout(
      "Payout processed",
      `<p>₹${amount} across ${orderCount} order(s) has been marked as paid out to your account on file.</p>`
    )
  );
}

export async function sendLowStockAlertEmail(to: string, productName: string, stock: number) {
  await send(
    to,
    `Low stock: ${productName}`,
    layout(
      "Low stock alert",
      `<p><strong>${productName}</strong> is down to <strong>${stock}</strong> unit(s). Restock soon to avoid going out of stock.</p>`
    )
  );
}
