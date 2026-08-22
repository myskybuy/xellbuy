import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendLoginOtpEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/password";
import { createLoginOtp } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    // Don't reveal whether the account exists.
    return NextResponse.json({ success: true });
  }

  const code = await createLoginOtp(cleanEmail);
  await sendLoginOtpEmail(cleanEmail, code);

  return NextResponse.json({ success: true });
}
