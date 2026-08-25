import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeOtp } from "@/lib/otp";
import { hashPassword, publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!cleanEmail || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code and new password are required" }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const result = await consumeOtp(cleanEmail, "reset", String(code));
    if (!result.ok) {
      const messages = {
        bad_format: "Enter the 6-digit code from your email",
        not_found: "No reset code found. Request a new one",
        expired: "Reset code expired. Request a new one",
        mismatch: "Incorrect code. Check the latest email and try again",
      } as const;
      return NextResponse.json({ error: messages[result.reason], reason: result.reason }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(String(newPassword)) },
    });

    const session = await getSession();
    session.userId = updated.id;
    session.pendingOtpEmail = undefined;
    await session.save();

    return NextResponse.json({ success: true, user: publicUser(updated) });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return NextResponse.json({ error: "Could not reset password. Please try again." }, { status: 500 });
  }
}
