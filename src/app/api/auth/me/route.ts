import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ user: null });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: publicUser(user) });
}
