import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueOtp, type OtpPurpose } from "@/lib/otp";
import { isValidEmail } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const otpPurpose: OtpPurpose | "" = purpose === "signup" || purpose === "login" ? purpose : "login";

    if (!cleanEmail || !otpPurpose) {
      return NextResponse.json({ error: "Email and purpose are required" }, { status: 400 });
    }
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      // Don't reveal whether the account exists for login resend.
      return NextResponse.json({ success: true });
    }

    const otp = await issueOtp(cleanEmail, otpPurpose);
    if (!otp.ok) {
      return NextResponse.json({ error: otp.error }, { status: otp.status });
    }

    return NextResponse.json({
      success: true,
      emailSent: !otp.warning,
      warning: otp.warning,
    });
  } catch (err) {
    console.error("[auth/resend-otp]", err);
    return NextResponse.json({ error: "Could not resend OTP. Please try again." }, { status: 500 });
  }
}
