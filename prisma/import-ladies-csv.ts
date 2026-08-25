/**
 * Replace products + categories from ladies CSV.
 * Keeps users, orders, coupons, banner.
 *
 * Usage: npx tsx prisma/import-ladies-csv.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const PLACEHOLDER = "/images/product-placeholder.svg";
const CSV_PATH = path.join(__dirname, "data", "xellbuy_ladies.csv");

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i <= text.length; i++) {
    const c = text[i] ?? "\n";
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
        continue;
      }
      if (c === '"') {
        quoted = false;
        continue;
      }
      field += c;
      continue;
    }
    if (c === '"') {
      quoted = true;
      continue;
    }
    if (c === "," || c === "\n" || c === "\r") {
      if (c === "\r") continue;
      row.push(field);
      field = "";
      if (c === ",") continue;
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  return rows;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found: ${CSV_PATH}`);
  }

  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  if (rows.length < 2) throw new Error("CSV has no data rows");

  const headers = rows[0].map((h) => h.trim());
  const data = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });

  const products = data
    .filter((d) => d.product_name)
    .map((d) => {
      const price = Math.round(Number(d.mrp_inr) || 0);
      const salePrice = Math.round(Number(d.sale_price_inr) || price);
      const image = d.image_url || PLACEHOLDER;
      return {
        name: d.product_name,
        brand: d.brand || "Xellbuy",
        category: d.category || "Other",
        price,
        salePrice: salePrice > 0 ? salePrice : price,
        image,
        stock: /in stock/i.test(d.availability || "") ? 25 : 0,
        description: d.description || d.product_name,
      };
    });

  const categoryNames = [...new Set(products.map((p) => p.category))];

  console.log(`Importing ${products.length} products across ${categoryNames.length} categories…`);

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  for (const name of categoryNames) {
    const firstWithImage = products.find((p) => p.category === name && p.image !== PLACEHOLDER);
    await prisma.category.create({
      data: {
        name,
        image: firstWithImage?.image || PLACEHOLDER,
      },
    });
  }

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`Done: ${categoryNames.length} categories, ${products.length} products`);
  console.log("Categories:", categoryNames.join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
