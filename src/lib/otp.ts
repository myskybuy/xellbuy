import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendLoginOtpEmail } from "@/lib/email";

export type OtpPurpose = "signup" | "login";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 60 * 1000;

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

function hashesEqual(a: string, b: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export async function issueOtp(email: string, purpose: OtpPurpose) {
  const cleanEmail = email.trim().toLowerCase();

  const recent = await prisma.otpCode.findFirst({
    where: { email: cleanEmail, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (Date.now() - recent.createdAt.getTime())) / 1000);
    return { ok: false as const, error: `Please wait ${wait}s before requesting another code`, status: 429 };
  }

  await prisma.otpCode.deleteMany({ where: { email: cleanEmail, purpose } });
  const code = String(crypto.randomInt(100000, 1000000));
  await prisma.otpCode.create({
    data: {
      email: cleanEmail,
      codeHash: hashOtp(code),
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const mail = await sendLoginOtpEmail(cleanEmail, code);
  if (!mail.sent) {
    if (mail.codeForDev) {
      // Local/dev: OTP logged to console — allow login flow to continue.
      return { ok: true as const, codeForDev: mail.codeForDev, warning: mail.error };
    }
    if (process.env.NODE_ENV === "production") {
      return { ok: false as const, error: mail.error || "Could not send verification email. Please try again.", status: 503 };
    }
    return { ok: false as const, error: mail.error || "Could not send verification email.", status: 503 };
  }

  return { ok: true as const };
}

export type ConsumeOtpResult =
  | { ok: true }
  | { ok: false; reason: "bad_format" | "not_found" | "expired" | "mismatch" };

export async function consumeOtp(email: string, purpose: OtpPurpose, code: string): Promise<ConsumeOtpResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = String(code).replace(/\D/g, "").trim();
  if (!cleanEmail || cleanCode.length !== 6) return { ok: false, reason: "bad_format" };

  const row = await prisma.otpCode.findFirst({
    where: { email: cleanEmail, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return { ok: false, reason: "not_found" };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (!hashesEqual(row.codeHash, hashOtp(cleanCode))) return { ok: false, reason: "mismatch" };

  await prisma.otpCode.deleteMany({ where: { email: cleanEmail, purpose } });
  return { ok: true };
}
