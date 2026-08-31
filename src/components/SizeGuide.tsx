"use client";

import { getSizeGuide } from "@/lib/sizeGuide";

export default function SizeGuide({ category }: { category: string }) {
  const guide = getSizeGuide(category);
  if (!guide) return null;

  if (guide.kind === "freesize") {
    return (
      <details className="size-guide">
        <summary>Size &amp; fit info</summary>
        <p className="size-guide-note">{guide.note}</p>
      </details>
    );
  }

  const isTop = guide.kind === "top";

  return (
    <details className="size-guide">
      <summary>Size chart &amp; fit info</summary>
      <p className="size-guide-note">{guide.fitNote}</p>
      <div className="size-guide-table-wrap">
        <table className="size-guide-table">
          <thead>
            <tr>
              <th>Size</th>
              {isTop ? (
                <>
                  <th>Bust (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                  <th>Length (in)</th>
                </>
              ) : (
                <>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                  <th>Inseam (in)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) =>
              isTop && "bust" in row ? (
                <tr key={row.size}>
                  <td>{row.size}</td>
                  <td>{row.bust}</td>
                  <td>{row.waist}</td>
                  <td>{row.hip}</td>
                  <td>{row.length}</td>
                </tr>
              ) : !isTop && "inseam" in row ? (
                <tr key={row.size}>
                  <td>{row.size}</td>
                  <td>{row.waist}</td>
                  <td>{row.hip}</td>
                  <td>{row.inseam}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
      <p className="size-guide-hint">All measurements are body measurements in inches, not garment measurements.</p>
    </details>
  );
}
