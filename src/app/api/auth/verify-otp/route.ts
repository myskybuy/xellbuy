import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeOtp, type OtpPurpose } from "@/lib/otp";
import { publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

const CONSUME_ERRORS: Record<"bad_format" | "not_found" | "expired" | "mismatch", string> = {
  bad_format: "Enter the 6-digit OTP from your email",
  not_found: "No OTP found. Please log in again to get a new code",
  expired: "OTP expired. Please request a new code",
  mismatch: "Incorrect OTP. Check the latest email and try again",
};

export async function POST(req: NextRequest) {
  try {
    const { email, purpose, code } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();
    const otpPurpose: OtpPurpose = purpose === "signup" || purpose === "login" ? purpose : "login";

    if (!cleanEmail || !code) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const result = await consumeOtp(cleanEmail, otpPurpose, String(code));
    if (!result.ok) {
      console.warn("[auth/verify-otp]", result.reason, cleanEmail);
      return NextResponse.json({ error: CONSUME_ERRORS[result.reason], reason: result.reason }, { status: 400 });
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
    const msg = err instanceof Error ? err.message : String(err);
    if (/otpcode|otp_code|does not exist|unknown arg/i.test(msg)) {
      return NextResponse.json(
        {
          error: "OTP database table is missing. On the server run: npx prisma db push && npm run build && pm2 reload",
          reason: "db_schema",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "OTP verification failed. Please try again." }, { status: 500 });
  }
}
