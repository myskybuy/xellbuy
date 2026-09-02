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
const EXTRA_CSV_PATH = path.join(__dirname, "data", "xellbuy_ladies_extra.csv");
const BLOUSES_JEANS_CSV = path.join(__dirname, "data", "xellbuy_ladies_blouses_jeans.csv");
const BRAND = "Xellbuy";

/** Rename third-party / designer titles to Xellbuy descriptive names */
const TITLE_RENAMES: Record<string, string> = {
  "Lottie Dress - Bright Checker": "Checkerboard Knit Mini Dress",
  "Sofia Dress - Blue Floral/White": "Floral Mini Dress - Blue White",
  "Kasey Top - White": "Collared Wrap Top - White",
  "Halls Cardigan - Verbena": "French Terry Cardigan - Verbena",
  "Core Crop Tank Top - Vibrant Red": "Racerback Crop Tank - Red",
  "Jemma Bubble Top - Black Pink Bow": "Bubble Hem Party Top - Black Pink",
  "Mindy Blouse - White": "Puff Sleeve Peplum Blouse - White",
  "Core Butterfly Baby Tee - White": "Slim Fit Baby Tee - White",
  "Gabrielle Maxi - Black": "Black Flared-Sleeve Maxi Dress",
  "Virelle Mesh Dress - Butterfly Print": "Butterfly Print Mesh Midi Dress",
  "Maraschino Slip Dress": "Cherry Print Slip Mini Dress",
  "Natasha Strapless Jacquard Maxi Dress": "Strapless Jacquard Maxi Dress",
  "Mari Mesh Dress - Red Floral": "Red Floral Mesh Midi Dress",
  "SARMAYA Black Chiffon Saree": "Black Chiffon Saree - Mirror Border",
  "Autumn Dress - Grey": "Grey Fit-and-Flare Midi Dress",
  "Classic Printed Saree Set": "Mist Blue Printed Organza Saree Set",
  "Libas Blue Embroidered Cotton Straight Suit Set With Dupatta":
    "Blue Embroidered Cotton Straight Suit Set",
  "Libas Rust Cotton Anarkali Suit Set with Dupatta": "Rust Cotton Anarkali Suit Set",
  "Libas Pink Printed Cotton Anarkali Suit Set With Dupatta": "Pink Printed Cotton Anarkali Suit Set",
  "Gerua Orange Floral Printed Cotton Blend Straight Suit Set": "Orange Floral Straight Suit Set",
};

const DROP_NAMES = new Set([
  "Samita Saree Set",
  "Neera Saree - Purple",
  "NMA Saree - Bottle Green",
  "Olive A-Line Silk Kurta Set",
  "Ghazal Kurta Set",
  "Libas Pink Printed Cotton Anarkali Kurta Set",
  "Libas Pink Printed Cotton Anarkali Kurta With Palazzos",
  "Libas Off-White Yoke Design Cotton Straight Kurta With Palazzos & Dupatta",
  "Libas Blue Printed Cotton Straight Kurta With Trousers and Dupatta",
  "Libas Blue Printed Cotton Straight Kurta With Trousers & Dupatta",
  "Libas Off White Printed Cotton A-Line Kurta With Palazzos & Dupatta",
  "Libas Blue Printed Cotton Straight Kurta With Trousers & Dupatta - 34182",
  "Libas Blue Printed Cotton Straight Kurta With Trousers & Dupatta - 34292",
]);

const SALE_CAPS: Record<string, number> = {
  Tops: 2499,
  Blouses: 2499,
  Layering: 2499,
  Shirts: 2499,
  Dresses: 5499,
  Jeans: 3499,
  Skirts: 2499,
  Sarees: 5999,
  "Ethnic Wear": 4999,
  "Ethnic Sets": 4999,
  Outerwear: 4999,
};

type CsvRow = Record<string, string>;

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

function normalizeBrand(): string {
  return BRAND;
}

function reprice(category: string, saleHint: number): { price: number; salePrice: number } {
  const cap = SALE_CAPS[category] ?? 3999;
  let sale = Math.max(999, Math.min(saleHint, cap));
  sale = Math.round(sale / 50) * 50 - (sale % 50 === 0 ? 0 : 0);
  if (sale % 100 !== 99 && sale > 1500) sale = Math.round(sale / 100) * 100 - 1;
  const price = Math.round(sale / 0.75);
  return { price, salePrice: sale };
}

function sizeLine(category: string): string {
  if (category === "Sarees") return "Available as free size (unstitched blouse piece included).";
  if (category === "Ethnic Wear" || category === "Ethnic Sets") return "Sizes available: S, M, L, XL.";
  return "Sizes available: XS, S, M, L, XL, XXL.";
}

function occasionFor(category: string, sub: string): string {
  if (category === "Sarees") return "Festive & wedding";
  if (category === "Ethnic Wear" || category === "Ethnic Sets") return "Festive & celebrations";
  if (/evening|party|mesh|slip/i.test(sub)) return "Party & evening";
  if (category === "Jeans" || category === "Tops") return "Casual everyday";
  if (category === "Dresses") return "Day to evening";
  if (category === "Outerwear") return "Work & smart casual";
  return "Everyday wear";
}

function careFor(category: string): string {
  if (category === "Sarees") return "Dry clean recommended. Store folded in a muslin bag away from direct sunlight.";
  if (category === "Ethnic Wear" || category === "Ethnic Sets")
    return "Gentle hand wash or dry clean. Iron on reverse at low heat.";
  if (category === "Jeans") return "Machine wash cold, inside out. Do not bleach. Tumble dry low.";
  if (category === "Dresses" || category === "Tops" || category === "Blouses")
    return "Hand wash cold or gentle machine cycle. Lay flat to dry. Cool iron if needed.";
  return "Follow care label. Wash separately for first few wears.";
}

function parseColor(name: string): string | null {
  const afterDash = name.split(" - ").pop()?.trim();
  if (!afterDash) return null;
  const colors =
    /^(navy|rust|olive|terracotta|khaki|coral|black|lavender|sand|white|sage|cream|emerald|peach|gold|teal|mustard|blush|royal blue|indigo|mint|yellow|wine|beige|light blue|washed blue|burgundy|ivory|camel|light wash|stone|champagne|grey|gray|red|maroon|purple|pink|dusty blue|rose|blue floral\/white|butterfly print|red floral|stripe)$/i;
  if (colors.test(afterDash)) return afterDash;
  const match = name.match(
    /\b(navy|rust|olive|black|white|cream|gold|teal|mustard|indigo|mint|yellow|wine|beige|burgundy|ivory|camel|maroon|purple|pink|champagne|grey|gray|red|emerald|peach|coral|lavender|sage|khaki|terracotta|blush|stone)\b/i,
  );
  return match ? match[1] : null;
}

function fabricHint(category: string, sub: string, name: string): string {
  const n = (name + " " + sub).toLowerCase();
  if (/mesh/i.test(n)) return "polyester-spandex mesh with a soft lining";
  if (/banarasi|kanjeevaram|zari|silk saree|chanderi/i.test(n)) return "silk blend with woven zari detailing";
  if (/georgette/i.test(n)) return "lightweight georgette with a fluid fall";
  if (/organza|ombre/i.test(n)) return "sheer organza with a delicate handfeel";
  if (/handloom|cotton saree/i.test(n)) return "breathable cotton handloom weave";
  if (/chikankari/i.test(n)) return "cotton with hand-embroidered chikankari work";
  if (/sharara|lehenga|anarkali/i.test(n)) return "premium woven fabric with festive finish";
  if (/linen/i.test(n)) return "breathable linen blend";
  if (/satin|slip|cowl/i.test(n)) return "satin-finish woven fabric with a smooth drape";
  if (/chiffon|pleated chiffon/i.test(n)) return "soft chiffon with gentle movement";
  if (/denim|jeans/i.test(n)) return "cotton denim with comfortable stretch";
  if (/knit|ribbed|cardigan/i.test(n)) return "soft knit with natural stretch";
  if (/puffer|quilted|vest/i.test(n)) return "quilted shell with lightweight fill";
  if (/trench|coat/i.test(n)) return "woven twill with a structured finish";
  if (/cotton|kurta/i.test(n)) return "breathable cotton blend";
  if (category === "Layering") return "soft cotton blend ideal for layering";
  if (category === "Skirts") return /denim/i.test(n) ? "cotton denim" : "flowing woven fabric";
  return "premium woven fabric";
}

function featureLines(category: string, sub: string, name: string): string {
  const n = (name + " " + sub).toLowerCase();
  if (category === "Sarees") {
    if (/banarasi|zari/i.test(n)) return "Features a woven border, rich pallu drape and unstitched blouse fabric for custom tailoring";
    if (/georgette/i.test(n)) return "Lightweight construction with a graceful drape and unstitched blouse piece included";
    if (/handloom/i.test(n)) return "Textured handloom weave with a comfortable all-day drape and unstitched blouse fabric";
    if (/organza|ombre/i.test(n)) return "Delicate sheer layers with a soft gradient finish and matching blouse piece";
    return "Elegant drape with unstitched blouse fabric for a personalised fit";
  }
  if (category === "Ethnic Wear" || category === "Ethnic Sets") {
    if (/sharara/i.test(n)) return "Mirror-work yoke with flared sharara pants and coordinating dupatta";
    if (/lehenga/i.test(n)) return "Festive lehenga skirt with matching choli and net dupatta";
    if (/anarkali/i.test(n)) return "Flared silhouette with embroidered bodice and flowing hem";
    if (/chikankari/i.test(n)) return "Hand-embroidered chikankari detailing with cotton trousers and sheer dupatta";
    if (/palazzo|kurta set/i.test(n)) return "Coordinated kurta with palazzo pants and matching dupatta";
    if (/straight suit|dupatta/i.test(n)) return "Straight-cut kurta with tonal thread work and lightweight dupatta";
    return "Thoughtful ethnic detailing with a comfortable, occasion-ready silhouette";
  }
  if (category === "Dresses") {
    if (/maxi/i.test(n)) return "Floor-grazing length with tiered movement and adjustable straps";
    if (/midi|a-line/i.test(n)) return "Flattering midi length with a gentle flare and easy movement";
    if (/shirt dress|belted/i.test(n)) return "Utility-inspired detailing with a defined waist and practical pockets";
    if (/wrap/i.test(n)) return "Wrap-front closure with tie waist for an adjustable fit";
    if (/bodycon|ribbed/i.test(n)) return "Figure-skimming ribbed knit with stretch comfort";
    if (/mesh/i.test(n)) return "Sheer mesh overlay with lining and adjustable shoulder straps";
    if (/mini|tiered/i.test(n)) return "Playful tiered volume with a feminine neckline";
    return "Flattering silhouette with comfortable room to move";
  }
  if (category === "Jeans") {
    if (/mom/i.test(n)) return "High-rise waist with a relaxed tapered leg and classic five-pocket styling";
    if (/skinny|high-rise/i.test(n)) return "High-rise waist with stretch denim and a sleek leg line";
    if (/wide|cropped/i.test(n)) return "Relaxed wide leg with a cropped raw hem and high waist";
    return "Classic five-pocket construction with comfortable stretch";
  }
  if (category === "Skirts") {
    if (/denim/i.test(n)) return "A-line shape with front slit detail and a high-rise waist";
    if (/pleated/i.test(n)) return "Fluid pleats with an elastic waist for easy all-day wear";
    if (/wrap/i.test(n)) return "Wrap closure with a soft satin handfeel and midi length";
    return "Easy-wear silhouette with a polished finish";
  }
  if (category === "Tops" || category === "Blouses") {
    if (/crop/i.test(n)) return "Cropped length with a square neckline and back tie detail";
    if (/bardot|off/i.test(n)) return "Off-shoulder neckline with ruched detailing";
    if (/puff sleeve/i.test(n)) return "Romantic puff sleeves with a soft peplum or button front";
    if (/wrap|satin/i.test(n)) return "Wrap-style closure with a deep V and tie waist";
    if (/peplum/i.test(n)) return "Structured peplum hem with a mandarin collar";
    return "Clean finishing with everyday versatility";
  }
  if (category === "Layering") {
    if (/cardigan/i.test(n)) return "Open-front knit with ribbed cuffs and a relaxed hip length";
    if (/shrug/i.test(n)) return "Lightweight open-front layer with three-quarter sleeves";
    return "Easy layering piece for transitional weather";
  }
  if (category === "Outerwear") {
    if (/denim/i.test(n)) return "Button-front denim with chest pockets and a classic collar";
    if (/trench/i.test(n)) return "Belted waist with storm flap and structured lapels";
    if (/puffer|vest|quilted/i.test(n)) return "Quilted construction with zip front and stand collar";
    if (/blazer/i.test(n)) return "Tailored lapels with a structured, polished silhouette";
    return "Smart outer layer for everyday wear";
  }
  return "Quality construction with attention to fit and finish";
}

function fitLine(category: string, sub: string, name: string): string {
  const n = (name + " " + sub).toLowerCase();
  if (category === "Jeans") return "High-rise fit with comfortable stretch through the hip and thigh";
  if (category === "Sarees") return "Free-size drape designed to suit most body types";
  if (category === "Dresses" && /bodycon|mesh/i.test(n)) return "Fitted true-to-size silhouette";
  if (category === "Dresses") return "Flattering true-to-size fit with room to move";
  if (category === "Ethnic Wear" || category === "Ethnic Sets") return "Relaxed ethnic fit — size up for a looser drape";
  return "Relaxed true-to-size fit";
}

function stylingTip(category: string, sub: string): string {
  if (category === "Sarees") return "style with statement earrings and heeled sandals for festive occasions";
  if (category === "Ethnic Wear" || category === "Ethnic Sets") return "pair with juttis or block heels and minimal gold jewellery";
  if (/evening|party|mesh|slip|satin/i.test(sub)) return "pair with heels and a clutch for evening plans";
  if (category === "Jeans") return "style with sneakers and a tucked-in tee for casual days";
  if (category === "Dresses") return "dress up with heels or keep it easy with flats and a crossbody bag";
  if (category === "Outerwear") return "layer over dresses or denim for smart-casual outings";
  if (category === "Skirts") return "team with a fitted top and sandals for brunch or office";
  if (category === "Tops" || category === "Blouses") return "tuck into high-waist jeans or wear loose over tailored trousers";
  return "mix and match with your everyday wardrobe staples";
}

function enrichDescription(row: CsvRow): string {
  const name = row.product_name;
  const category = row.category || "Other";
  const sub = row.sub_category || category;
  const base = (row.description || name).trim();
  const fabric = fabricHint(category, sub, name);
  const color = parseColor(name);
  const colorPhrase = color ? ` The ${color.toLowerCase()} tone adds versatile styling options.` : "";
  const features = featureLines(category, sub, name);
  const fit = fitLine(category, sub, name);
  const occasion = occasionFor(category, sub).toLowerCase();
  const tip = stylingTip(category, sub);

  const para1 = `${base} Crafted in ${fabric}.${colorPhrase} ${features}.`;
  const para2 = `${fit}. ${sizeLine(category)}`;
  const para3 = `Ideal for ${occasion} — ${tip}. From the ${BRAND} women's collection.`;

  return [para1, para2, para3].join("\n\n");
}

function fixKnownBadRows(row: CsvRow): CsvRow {
  const out = { ...row };
  const renamed = TITLE_RENAMES[out.product_name];
  if (renamed) out.product_name = renamed;

  if (out.product_name === "Wide Cut Jeans - Grey") {
    out.image_url = "/images/products/wide-cut-jeans-grey.jpg";
    out.description =
      "High-waist wide-leg grey denim jeans with a relaxed extra-long leg, five-pocket styling and a comfortable stretch waistband.";
  }
  if (out.product_name === "Mari Mesh Dress - Red Floral") {
    out.description =
      "Fitted red floral mesh midi dress with an asymmetric waterfall neckline, adjustable shoulder straps and a soft side frill for movement.";
  }
  if (out.product_name === "Floral Mini Dress - Blue White") {
    out.description =
      "Blue floral mini dress with adjustable straps and a feminine A-line silhouette for summer and brunch styling.";
  }
  if (out.product_name === "Black Chiffon Saree - Mirror Border") {
    out.description =
      "Black chiffon saree with floral mirror-work embroidered border and an elegant festive drape.";
  }
  if (out.product_name === "Checkerboard Knit Mini Dress") {
    out.description =
      "Sweater-knit patchwork mini dress in a bright checker pattern for casual and party styling.";
  }
  if (out.product_name === "Black Flared-Sleeve Maxi Dress") {
    out.description =
      "Black flared-sleeve maxi dress with a boatneck neckline, waist cut-outs and a flowing silhouette.";
  }
  if (out.product_name === "Butterfly Print Mesh Midi Dress") {
    out.description =
      "Fitted mesh midi dress with butterfly print, asymmetric neckline and adjustable shoulder straps.";
  }
  out.brand = BRAND;
  return out;
}

function dedupe(rows: CsvRow[]): CsvRow[] {
  return rows.filter((r) => r.product_name && !DROP_NAMES.has(r.product_name));
}

function loadCsvRows(filePath: string): CsvRow[] {
  if (!fs.existsSync(filePath)) return [];
  const parsed = parseCsv(fs.readFileSync(filePath, "utf8"));
  if (parsed.length < 2) return [];
  const headers = parsed[0].map((h) => h.trim());
  return parsed.slice(1).map((r) => {
    const obj: CsvRow = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? "").trim();
    });
    return obj;
  });
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found: ${CSV_PATH}`);
  }

  let data = [
    ...loadCsvRows(CSV_PATH),
    ...loadCsvRows(EXTRA_CSV_PATH),
    ...loadCsvRows(BLOUSES_JEANS_CSV),
  ];
  if (!data.length) throw new Error("No product rows found in CSV files");

  data = dedupe(data);

  const products = data.map((raw) => {
    const d = fixKnownBadRows(raw);
    const category = d.category || "Other";
    const saleHint = Math.round(Number(d.sale_price_inr) || Number(d.mrp_inr) || 1999);
    const { price, salePrice } = reprice(category, saleHint);
    const image = d.image_url || PLACEHOLDER;
    return {
      name: d.product_name,
      brand: normalizeBrand(),
      category,
      price,
      salePrice,
      image,
      stock: /in stock/i.test(d.availability || "") ? 25 : 0,
      description: enrichDescription(d),
      careInfo: careFor(category),
      occasion: occasionFor(category, d.sub_category || ""),
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
