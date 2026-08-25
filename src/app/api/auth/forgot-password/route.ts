import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isValidEmail } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      // Don't reveal whether the account exists.
      return NextResponse.json({ success: true });
    }

    const otp = await issueOtp(cleanEmail, "reset");
    if (!otp.ok) {
      return NextResponse.json({ error: otp.error }, { status: otp.status });
    }

    return NextResponse.json({
      success: true,
      emailSent: !otp.warning,
      warning: otp.warning,
    });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return NextResponse.json({ error: "Could not start password reset. Please try again." }, { status: 500 });
  }
}
