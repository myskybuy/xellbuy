import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendLoginOtpEmail } from "@/lib/email";
import { isValidEmail, verifyPassword } from "@/lib/password";
import { createLoginOtp } from "@/lib/otp";
import { getSession } from "@/lib/session";

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

    const code = await createLoginOtp(cleanEmail);

    const session = await getSession();
    session.pendingOtpEmail = cleanEmail;
    await session.save();

    const mail = await sendLoginOtpEmail(cleanEmail, code);

    if (!mail.sent) {
      if (mail.codeForDev) {
        return NextResponse.json({
          success: true,
          otpRequired: true,
          email: cleanEmail,
          emailSent: false,
          warning: mail.error,
        });
      }
      return NextResponse.json({ error: mail.error }, { status: 503 });
    }

    return NextResponse.json({ success: true, otpRequired: true, email: cleanEmail, emailSent: true });
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
