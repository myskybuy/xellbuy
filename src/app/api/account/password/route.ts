import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    if (!verifyPassword(String(currentPassword), user.passwordHash)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(String(newPassword)) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/password]", err);
    return NextResponse.json({ error: "Could not update password. Please try again." }, { status: 500 });
  }
}
