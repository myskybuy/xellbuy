import { prisma } from "./db";

export async function getRatingSummaries(productIds: number[]) {
  if (!productIds.length) return new Map<number, { avgRating: number; reviewCount: number }>();

  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const map = new Map<number, { avgRating: number; reviewCount: number }>();
  for (const row of grouped) {
    map.set(row.productId, {
      avgRating: Math.round((row._avg.rating || 0) * 10) / 10,
      reviewCount: row._count.rating,
    });
  }
  return map;
}

export async function getRatingSummary(productId: number) {
  const map = await getRatingSummaries([productId]);
  return map.get(productId) || { avgRating: 0, reviewCount: 0 };
}

export async function listProductReviews(productId: number) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function listRecentReviews(limit = 6) {
  return prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: "" } },
    include: { user: { select: { name: true } }, product: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
