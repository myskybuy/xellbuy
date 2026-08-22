import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/password";
import { verifyLoginOtp } from "@/lib/otp";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanCode = (code || "").toString().trim();

  if (!cleanEmail || !cleanCode) {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
  }

  const result = await verifyLoginOtp(cleanEmail, cleanCode);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return NextResponse.json({ success: true, user: publicUser(user) });
}
