export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

const TOP_CHART: Array<{ size: Size; bust: string; waist: string; hip: string; length: string }> = [
  { size: "XS", bust: "32", waist: "26", hip: "35", length: "36" },
  { size: "S", bust: "34", waist: "28", hip: "37", length: "37" },
  { size: "M", bust: "36", waist: "30", hip: "39", length: "38" },
  { size: "L", bust: "38", waist: "32", hip: "41", length: "39" },
  { size: "XL", bust: "40", waist: "34", hip: "43", length: "40" },
  { size: "XXL", bust: "42", waist: "36", hip: "45", length: "41" },
];

const BOTTOM_CHART: Array<{ size: Size; waist: string; hip: string; inseam: string }> = [
  { size: "XS", waist: "26", hip: "35", inseam: "29" },
  { size: "S", waist: "28", hip: "37", inseam: "29.5" },
  { size: "M", waist: "30", hip: "39", inseam: "30" },
  { size: "L", waist: "32", hip: "41", inseam: "30.5" },
  { size: "XL", waist: "34", hip: "43", inseam: "31" },
  { size: "XXL", waist: "36", hip: "45", inseam: "31.5" },
];

export type SizeGuide =
  | { kind: "top"; rows: typeof TOP_CHART; fitNote: string }
  | { kind: "bottom"; rows: typeof BOTTOM_CHART; fitNote: string }
  | { kind: "freesize"; note: string };

export function getSizeLabel(category: string): string {
  if (category === "Sarees") return "Free size";
  if (category === "Ethnic Wear" || category === "Ethnic Sets") return "S–XL";
  return "XS–XXL";
}

export function getSizeGuide(category: string): SizeGuide | null {
  switch (category) {
    case "Dresses":
      return {
        kind: "top",
        rows: TOP_CHART,
        fitNote: "Dresses here run true to size with a little room through the waist. Between sizes? Size up for a relaxed drape, size down for a fitted look.",
      };
    case "Tops":
    case "Blouses":
    case "Layering":
    case "Outerwear":
    case "Shirts":
      return {
        kind: "top",
        rows: TOP_CHART,
        fitNote: "Measured flat, unstretched. If your bust and waist fall in different size rows, go with your bust measurement for the best fit through the shoulders.",
      };
    case "Ethnic Wear":
    case "Ethnic Sets":
      return {
        kind: "top",
        rows: TOP_CHART,
        fitNote: "Kurta/suit sets are cut for easy movement. Palazzos and trousers in a set follow the same size label as the top.",
      };
    case "Jeans":
    case "Skirts":
      return {
        kind: "bottom",
        rows: BOTTOM_CHART,
        fitNote: "Waist is measured at the narrowest point, unstretched. Stretch-fabric styles have a little extra give beyond these numbers.",
      };
    case "Sarees":
      return {
        kind: "freesize",
        note: "Sarees are one size (5.5–6.3m unstitched) and drape to fit any body type. The attached blouse piece is unstitched fabric, ready for your tailor to make to your exact measurements.",
      };
    default:
      return null;
  }
}
