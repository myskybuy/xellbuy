import crypto from "crypto";
import { prisma } from "./db";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createLoginOtp(email: string) {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Clear any previous unused OTPs for this email so only the latest is valid.
  await prisma.loginOtp.deleteMany({ where: { email } });
  await prisma.loginOtp.create({ data: { email, code, expiresAt } });

  return code;
}

export async function verifyLoginOtp(email: string, code: string) {
  const otp = await prisma.loginOtp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return { ok: false, error: "OTP expired. Please request a new one." };
  if (otp.expiresAt < new Date()) {
    await prisma.loginOtp.delete({ where: { id: otp.id } });
    return { ok: false, error: "OTP expired. Please request a new one." };
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    await prisma.loginOtp.delete({ where: { id: otp.id } });
    return { ok: false, error: "Too many incorrect attempts. Please request a new OTP." };
  }
  if (otp.code !== code.trim()) {
    await prisma.loginOtp.update({ where: { id: otp.id }, data: { attempts: otp.attempts + 1 } });
    return { ok: false, error: "Incorrect OTP. Please try again." };
  }

  await prisma.loginOtp.delete({ where: { id: otp.id } });
  return { ok: true as const };
}
