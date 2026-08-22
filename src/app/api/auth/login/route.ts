import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendLoginOtpEmail } from "@/lib/email";
import { isValidEmail, verifyPassword } from "@/lib/password";
import { createLoginOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const code = await createLoginOtp(cleanEmail);
  await sendLoginOtpEmail(cleanEmail, code);

  return NextResponse.json({ success: true, otpRequired: true, email: cleanEmail });
}
