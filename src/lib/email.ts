import nodemailer from "nodemailer";

const EMAIL_ENABLED = String(process.env.EMAIL_ENABLED || "false").toLowerCase() === "true";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || "";

const transporter =
  EMAIL_ENABLED && EMAIL_USER && EMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
      })
    : null;

type OrderItem = { name: string; qty: number; salePrice: number };

type OrderEmail = {
  id: number;
  email: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
};

export type OtpEmailResult =
  | { sent: true }
  | { sent: false; error: string; codeForDev?: string };

export async function sendOrderConfirmationEmail(order: OrderEmail) {
  if (!order.email) return;

  if (!transporter) {
    console.log(`[xellbuy] EMAIL_ENABLED is false — order #${order.id} confirmation would go to ${order.email}`);
    return;
  }

  const itemsHTML = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name} × ${item.qty}</td><td style="padding:8px 0; text-align:right;">₹${item.salePrice * item.qty}</td></tr>`
    )
    .join("");

  await transporter.sendMail({
    from: `"Xellbuy" <${EMAIL_USER}>`,
    to: order.email,
    subject: `Order #${order.id} booked — completed ✅ | Xellbuy`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0f766e;">Order booked, completed ✅</h2>
        <p>Hi ${order.customerName}, thanks for shopping at Xellbuy. Your order has been placed successfully.</p>
        <p><strong>Order #${order.id}</strong> · ${order.paymentMethod}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHTML}</table>
        <p style="font-size:18px;font-weight:700;">Total: ₹${order.total}</p>
      </div>
    `,
  });
}

export async function sendLoginOtpEmail(to: string, code: string): Promise<OtpEmailResult> {
  return sendOtpEmail(to, code, "login");
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<OtpEmailResult> {
  return sendOtpEmail(to, code, "reset");
}

async function sendOtpEmail(
  to: string,
  code: string,
  kind: "login" | "reset",
): Promise<OtpEmailResult> {
  if (!to) return { sent: false, error: "Email address is missing." };

  const label = kind === "reset" ? "password reset" : "login";

  if (!transporter) {
    console.log(`[xellbuy] EMAIL_ENABLED is false — ${label} OTP for ${to} is: ${code}`);
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      return {
        sent: false,
        error: "Email is not configured. Set EMAIL_ENABLED=true with EMAIL_USER and EMAIL_APP_PASSWORD.",
      };
    }
    return {
      sent: false,
      error: "Email delivery is off (EMAIL_ENABLED). Check the server console for your OTP.",
      codeForDev: code,
    };
  }

  try {
    const isReset = kind === "reset";
    await transporter.sendMail({
      from: `"Xellbuy" <${EMAIL_USER}>`,
      to,
      subject: isReset ? `${code} is your Xellbuy password reset code` : `${code} is your Xellbuy login OTP`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0f766e;">${isReset ? "Reset your password" : "Verify it's you"}</h2>
          <p>${
            isReset
              ? "Use the code below to reset your Xellbuy account password."
              : "Use the OTP below to log in to your Xellbuy account."
          }</p>
          <p style="font-size:32px;font-weight:800;letter-spacing:6px;margin:20px 0;">${code}</p>
          <p style="color:#64748b;font-size:13px;">This code is valid for 10 minutes. Don't share it with anyone.</p>
        </div>
      `,
    });
    return { sent: true };
  } catch (err) {
    console.error(`[xellbuy] Failed to send ${label} OTP email:`, err);
    return { sent: false, error: "Could not send OTP email. Please try again in a moment." };
  }
}

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  if (!transporter) return;

  await transporter.sendMail({
    from: `"Xellbuy" <${EMAIL_USER}>`,
    to: user.email,
    subject: "Welcome to Xellbuy",
    html: `<p>Hi ${user.name}, your Xellbuy account is ready. Happy shopping!</p>`,
  });
}
