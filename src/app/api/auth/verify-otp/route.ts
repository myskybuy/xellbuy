import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeOtp, type OtpPurpose } from "@/lib/otp";
import { publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, code } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const otpPurpose: OtpPurpose | "" = purpose === "signup" || purpose === "login" ? purpose : "login";

    if (!cleanEmail || !code) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const ok = await consumeOtp(cleanEmail, otpPurpose || "login", String(code));
    if (!ok) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const session = await getSession();
    session.userId = user.id;
    session.pendingOtpEmail = undefined;
    await session.save();

    return NextResponse.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error("[auth/verify-otp]", err);
    return NextResponse.json({ error: "OTP verification failed. Please try again." }, { status: 500 });
  }
}
