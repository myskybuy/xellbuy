import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ items: [] });

  const items = await prisma.wishlist.findMany({
    where: { userId: session.userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: items.map((i) => i.product) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json();
  const productId = Number(body.productId);
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await prisma.wishlist.upsert({
    where: { userId_productId: { userId: session.userId, productId } },
    update: {},
    create: { userId: session.userId, productId },
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const productId = Number(req.nextUrl.searchParams.get("productId"));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await prisma.wishlist.deleteMany({ where: { userId: session.userId, productId } });
  return NextResponse.json({ success: true });
}
