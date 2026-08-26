import { NextRequest, NextResponse } from "next/server";
import { listRecentReviews } from "@/lib/reviews";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit")) || 6;
  const reviews = await listRecentReviews(limit);
  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      userName: r.user.name,
      product: r.product,
    }))
  );
}
