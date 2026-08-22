import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const products = await listProducts({
    category: searchParams.get("category") || undefined,
    sale: searchParams.get("sale") === "1",
    q: searchParams.get("q") || undefined,
  });
  return NextResponse.json(products);
}
