import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidPhone, normalizePhone, publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session.userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (name.length < 2) return NextResponse.json({ error: "Enter your full name" }, { status: 400 });
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        phone: phone ? normalizePhone(phone) : "",
        address,
      },
    });

    return NextResponse.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error("[account/profile]", err);
    return NextResponse.json({ error: "Could not update profile. Please try again." }, { status: 500 });
  }
}
