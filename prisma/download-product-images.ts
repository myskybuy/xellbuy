/**
 * Download category-matched women's clothing images — one unique Pexels ID per file.
 * Usage: npx tsx prisma/download-product-images.ts
 */
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";

const OUT_DIR = path.join(__dirname, "..", "public", "images", "products");

const PEXELS_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Referer: "https://www.pexels.com/",
};

type ImageEntry = { file: string; url: string; product: string; category: string };

function pex(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;
}

/** Each file has a unique photo ID — no duplicates across products */
const IMAGES: ImageEntry[] = [
  // extra CSV — Dresses
  { file: "extra-001.jpg", product: "A-Line Midi Dress - Navy", category: "Dresses", url: pex(994523) },
  { file: "extra-002.jpg", product: "Wrap Midi Dress - Rust", category: "Dresses", url: pex(985635) },
  { file: "extra-003.jpg", product: "Linen Shirt Dress - Olive", category: "Dresses", url: pex(6311392) },
  { file: "extra-004.jpg", product: "Smocked Maxi Dress - Terracotta", category: "Dresses", url: pex(7674727) },
  { file: "extra-005.jpg", product: "Belted Shirt Dress - Khaki", category: "Dresses", url: pex(4672081) },
  { file: "extra-006.jpg", product: "Floral Tiered Dress - Coral", category: "Dresses", url: pex(1536619) },
  { file: "extra-007.jpg", product: "Ribbed Bodycon Midi - Black", category: "Dresses", url: pex(1126993) },
  { file: "extra-008.jpg", product: "Puff Sleeve Mini Dress - Lavender", category: "Dresses", url: pex(1462637) },
  // Tops
  { file: "extra-009.jpg", product: "Linen Crop Top - Sand", category: "Tops", url: pex(1036623) },
  { file: "extra-010.jpg", product: "Oversized Cotton Tee - Stripe", category: "Tops", url: pex(1926769) },
  { file: "extra-011.jpg", product: "Ruched Bardot Top - White", category: "Tops", url: pex(1485031) },
  { file: "extra-012.jpg", product: "Knit Tank Top - Sage", category: "Tops", url: pex(1884581) },
  // Blouses
  { file: "extra-013.jpg", product: "Puff Sleeve Blouse - Cream", category: "Blouses", url: pex(5886030) },
  { file: "extra-014.jpg", product: "Satin Wrap Blouse - Emerald", category: "Blouses", url: pex(7679081) },
  { file: "extra-015.jpg", product: "Peplum Cotton Blouse - Dusty Blue", category: "Blouses", url: pex(2983464) },
  { file: "extra-016.jpg", product: "Tie-Front Blouse - Peach", category: "Blouses", url: pex(298863) },
  // Sarees
  { file: "extra-017.jpg", product: "Banarasi Silk Saree - Gold", category: "Sarees", url: pex(38998852) },
  { file: "extra-018.jpg", product: "Georgette Saree - Teal", category: "Sarees", url: pex(13824468) },
  { file: "extra-019.jpg", product: "Cotton Handloom Saree - Mustard", category: "Sarees", url: pex(27575174) },
  { file: "extra-020.jpg", product: "Pastel Ombre Saree - Blush", category: "Sarees", url: pex(1570807) },
  { file: "extra-021.jpg", product: "Zari Border Saree - Royal Blue", category: "Sarees", url: pex(28943610) },
  // Ethnic
  { file: "extra-022.jpg", product: "Printed Anarkali Kurta - Indigo", category: "Ethnic Wear", url: pex(37523792) },
  { file: "extra-023.jpg", product: "Cotton Straight Kurta - Mint", category: "Ethnic Wear", url: pex(28512779) },
  { file: "extra-024.jpg", product: "Kurta Set with Palazzo - Yellow", category: "Ethnic Sets", url: pex(20792015) },
  { file: "extra-025.jpg", product: "Sharara Set - Emerald", category: "Ethnic Sets", url: pex(34029707) },
  { file: "extra-026.jpg", product: "Anarkali Suit Set - Wine", category: "Ethnic Sets", url: pex(1927259) },
  { file: "extra-027.jpg", product: "Straight Suit with Dupatta - Beige", category: "Ethnic Sets", url: pex(1813940) },
  { file: "extra-028.jpg", product: "Printed Lehenga Set - Peach", category: "Ethnic Sets", url: pex(2533265) },
  { file: "extra-029.jpg", product: "Chikankari Kurta Set - White", category: "Ethnic Sets", url: pex(1266808) },
  // Jeans / Skirts
  { file: "extra-030.jpg", product: "Mom Fit Jeans - Light Blue", category: "Jeans", url: pex(1545244) },
  { file: "extra-031.jpg", product: "Skinny High-Rise Jeans - Black", category: "Jeans", url: pex(2896632) },
  { file: "extra-032.jpg", product: "Cropped Wide Jeans - Washed Blue", category: "Jeans", url: pex(2983468) },
  { file: "extra-033.jpg", product: "A-Line Midi Skirt - Denim", category: "Skirts", url: pex(8419989) },
  { file: "extra-034.jpg", product: "Pleated Maxi Skirt - Olive", category: "Skirts", url: pex(3184393) },
  { file: "extra-035.jpg", product: "Wrap Midi Skirt - Burgundy", category: "Skirts", url: pex(24285296) },
  // Layering / Outerwear
  { file: "extra-036.jpg", product: "Cotton Shrug - Ivory", category: "Layering", url: pex(3363726) },
  { file: "extra-037.jpg", product: "Knit Cardigan - Camel", category: "Layering", url: pex(31742298) },
  { file: "extra-038.jpg", product: "Denim Jacket - Light Wash", category: "Outerwear", url: pex(36059955) },
  { file: "extra-039.jpg", product: "Trench Coat - Beige", category: "Outerwear", url: pex(3754552) },
  { file: "extra-040.jpg", product: "Quilted Puffer Vest - Stone", category: "Outerwear", url: pex(3965555) },
  // New blouses
  { file: "extra-041.jpg", product: "Lace Trim Blouse - Ivory", category: "Blouses", url: pex(7357788) },
  { file: "extra-042.jpg", product: "Striped Office Blouse - Navy", category: "Blouses", url: pex(28223459) },
  { file: "extra-043.jpg", product: "Ruffled Chiffon Blouse - Blush", category: "Blouses", url: pex(4964443) },
  { file: "extra-044.jpg", product: "Floral Cotton Blouse - Green", category: "Blouses", url: pex(17459766) },
  { file: "extra-045.jpg", product: "High-Neck Satin Blouse - Black", category: "Blouses", url: pex(1040945) },
  { file: "extra-046.jpg", product: "Bell Sleeve Blouse - Mustard", category: "Blouses", url: pex(10532718) },
  // New jeans
  { file: "extra-047.jpg", product: "Boyfriend Jeans - Mid Blue", category: "Jeans", url: pex(31556454) },
  { file: "extra-048.jpg", product: "Straight Leg Jeans - Dark Wash", category: "Jeans", url: pex(18481017) },
  { file: "extra-049.jpg", product: "High-Rise Bootcut Jeans - Indigo", category: "Jeans", url: pex(7679864) },
  { file: "extra-050.jpg", product: "Distressed Slim Jeans - Light Wash", category: "Jeans", url: pex(9963295) },
  { file: "extra-051.jpg", product: "Cargo Jeans - Olive", category: "Jeans", url: pex(6311653) },
  { file: "extra-052.jpg", product: "Paperbag Waist Jeans - Cream", category: "Jeans", url: pex(7680067) },
  // Main catalogue local images
  { file: "embroidered-silk-saree-wine.jpg", product: "Embroidered Silk Saree - Wine", category: "Sarees", url: pex(12797125) },
  { file: "organza-floral-saree-ivory.jpg", product: "Organza Floral Saree - Ivory", category: "Sarees", url: pex(2679680) },
  { file: "chanderi-silk-saree-rose.jpg", product: "Chanderi Silk Saree - Rose", category: "Sarees", url: pex(8034033) },
  { file: "embroidered-anarkali-maroon.jpg", product: "Embroidered Anarkali - Maroon", category: "Ethnic Wear", url: pex(1755428) },
  { file: "sharara-set-dusty-pink.jpg", product: "Sharara Set - Dusty Pink", category: "Ethnic Sets", url: pex(2233350) },
  { file: "rose-gold-lehenga-choli.jpg", product: "Rose Gold Lehenga Choli", category: "Ethnic Sets", url: pex(9963296) },
  { file: "satin-slip-midi-dress-champagne.jpg", product: "Satin Slip Midi Dress - Champagne", category: "Dresses", url: pex(7680086) },
  { file: "pleated-chiffon-maxi-dress-sage.jpg", product: "Pleated Chiffon Maxi Dress - Sage", category: "Dresses", url: pex(6311393) },
  { file: "tailored-blazer-ivory.jpg", product: "Tailored Blazer - Ivory", category: "Outerwear", url: pex(5292231) },
  { file: "high-rise-flare-jeans-indigo.jpg", product: "High-Rise Flare Jeans - Indigo", category: "Jeans", url: pex(1703272) },
  { file: "satin-cowl-neck-blouse-champagne.jpg", product: "Satin Cowl-Neck Blouse - Champagne", category: "Blouses", url: pex(1102341) },
  { file: "pleated-midi-skirt-black.jpg", product: "Pleated Midi Skirt - Black", category: "Skirts", url: pex(3003460) },
  { file: "wide-cut-jeans-grey.jpg", product: "Wide Cut Jeans - Grey", category: "Jeans", url: pex(4558611) },
];

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, { headers: PEXELS_HEADERS }, (res: http.IncomingMessage) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuffer(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`${url} → HTTP ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function main() {
  const ids = IMAGES.map((i) => i.url.match(/photos\/(\d+)\//)?.[1]);
  const unique = new Set(ids);
  if (unique.size !== IMAGES.length) {
    console.error(`Duplicate Pexels IDs: ${IMAGES.length} images but ${unique.size} unique IDs`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let ok = 0;
  let fail = 0;
  for (const { file, url, product, category } of IMAGES) {
    const dest = path.join(OUT_DIR, file);
    try {
      const buf = await fetchBuffer(url);
      if (buf.length < 5000) throw new Error(`too small (${buf.length} bytes)`);
      fs.writeFileSync(dest, buf);
      console.log("ok", file, `[${category}]`, product, buf.length);
      ok++;
    } catch (e) {
      console.error("fail", file, `[${category}]`, product, (e as Error).message);
      fail++;
    }
  }
  console.log(`Done: ${ok} saved, ${fail} failed (${IMAGES.length} total)`);
  if (fail > 0) process.exit(1);
}

main();
