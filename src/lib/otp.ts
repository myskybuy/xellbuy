import crypto from "crypto";
import { prisma } from "./db";

const OTP_TTL_MINUTES = 10;
const OTP_GRACE_MS = 30_000;
const MAX_ATTEMPTS = 5;

export function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createLoginOtp(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // deleteMany + create works without requiring email @unique on the Prisma client.
  await prisma.$transaction([
    prisma.loginOtp.deleteMany({ where: { email: cleanEmail } }),
    prisma.loginOtp.create({
      data: { email: cleanEmail, code, expiresAt, attempts: 0 },
    }),
  ]);

  return code;
}

export async function verifyLoginOtp(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.replace(/\D/g, "").trim();

  if (!cleanEmail || cleanCode.length !== 6) {
    return { ok: false, error: "Email and 6-digit OTP are required." };
  }

  const otp = await prisma.loginOtp.findFirst({
    where: { email: cleanEmail },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { ok: false, error: "No OTP found. Please request a new one." };
  }

  const validUntil =
    new Date(otp.createdAt.getTime() + OTP_TTL_MINUTES * 60 * 1000).getTime() + OTP_GRACE_MS;
  if (Date.now() > validUntil) {
    await prisma.loginOtp.delete({ where: { id: otp.id } }).catch(() => {});
    return { ok: false, error: "OTP expired. Please request a new one." };
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await prisma.loginOtp.delete({ where: { id: otp.id } }).catch(() => {});
    return { ok: false, error: "Too many incorrect attempts. Please request a new OTP." };
  }

  if (otp.code !== cleanCode) {
    await prisma.loginOtp.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } });
    return { ok: false, error: "Incorrect OTP. Please try again." };
  }

  await prisma.loginOtp.delete({ where: { id: otp.id } }).catch(() => {});
  return { ok: true as const };
}
