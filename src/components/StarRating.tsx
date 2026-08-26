"use client";

export function StarRatingDisplay({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  if (!rating && !count) {
    return <span className="star-rating star-rating--empty">No reviews yet</span>;
  }
  return (
    <span className="star-rating" aria-label={`Rated ${rating} out of 5`}>
      <span className="star-rating-stars" style={{ fontSize: size }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`star ${rating >= n - 0.25 ? "full" : rating >= n - 0.75 ? "half" : ""}`}>
            ★
          </span>
        ))}
      </span>
      {count !== undefined ? <span className="star-rating-count">({count})</span> : null}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
  size = 26,
}: {
  value: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  return (
    <span className="star-rating-input" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-input-btn ${value >= n ? "full" : ""}`}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
