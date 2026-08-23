import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isValidEmail, verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
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

    const otp = await issueOtp(cleanEmail, "login");
    if (!otp.ok) {
      return NextResponse.json({ error: otp.error }, { status: otp.status });
    }

    return NextResponse.json({
      success: true,
      otpRequired: true,
      needsOtp: true,
      email: cleanEmail,
      purpose: "login",
      emailSent: !otp.warning,
      warning: otp.warning,
    });
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
