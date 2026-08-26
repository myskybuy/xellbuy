import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import { getRatingSummaries } from "./reviews";

export type ProductFilters = {
  category?: string;
  sale?: boolean;
  q?: string;
};

export async function listProducts(filters: ProductFilters = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.category) where.category = filters.category;

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let products = await prisma.product.findMany({
    where,
    orderBy: { id: "asc" },
  });

  if (filters.sale) {
    products = products.filter((p) => p.salePrice < p.price);
  }

  const ratings = await getRatingSummaries(products.map((p) => p.id));
  return products.map((p) => ({
    ...p,
    avgRating: ratings.get(p.id)?.avgRating || 0,
    reviewCount: ratings.get(p.id)?.reviewCount || 0,
  }));
}

export async function getProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;
  const ratings = await getRatingSummaries([id]);
  return {
    ...product,
    avgRating: ratings.get(id)?.avgRating || 0,
    reviewCount: ratings.get(id)?.reviewCount || 0,
  };
}

export async function getBanner() {
  let banner = await prisma.banner.findUnique({ where: { id: 1 } });
  if (!banner) {
    banner = await prisma.banner.create({
      data: {
        id: 1,
        active: false,
        title: "",
        subtitle: "",
        image: "",
        buttonText: "Shop Now",
        buttonLink: "/shop",
      },
    });
  }
  return {
    active: banner.active,
    title: banner.title,
    subtitle: banner.subtitle,
    image: banner.image,
    buttonText: banner.buttonText,
    buttonLink: banner.buttonLink,
  };
}
