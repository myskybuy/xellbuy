import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getRatingSummary, listProductReviews } from "@/lib/reviews";

export async function GET(req: NextRequest) {
  const productId = Number(req.nextUrl.searchParams.get("productId"));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const session = await getSession();
  const [reviews, summary] = await Promise.all([listProductReviews(productId), getRatingSummary(productId)]);

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user.name,
      isMine: r.userId === session.userId,
    })),
    ...summary,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json();
  const productId = Number(body.productId);
  const rating = Math.round(Number(body.rating));
  const comment = String(body.comment || "").trim().slice(0, 1000);

  if (!productId || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Valid productId and rating (1-5) required" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { userId_productId: { userId: session.userId, productId } },
    update: { rating, comment },
    create: { userId: session.userId, productId, rating, comment },
  });
  return NextResponse.json({ success: true, review });
}
