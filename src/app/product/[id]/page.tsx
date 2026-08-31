"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Product } from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useAuth } from "@/components/AuthProvider";
import { StarRatingDisplay, StarRatingInput } from "@/components/StarRating";
import SizeGuide from "@/components/SizeGuide";
import { SIZES, getSizeGuide } from "@/lib/sizeGuide";
import { toast } from "sonner";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  isMine: boolean;
};

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const { addToCart, isInCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");
  const [size, setSize] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState({ avgRating: 0, reviewCount: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [params.id]);

  const loadReviews = useCallback(() => {
    if (!productId) return;
    setReviewsLoading(true);
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setRatingSummary({ avgRating: data.avgRating || 0, reviewCount: data.reviewCount || 0 });
        const mine = (data.reviews || []).find((r: Review) => r.isMine);
        if (mine) {
          setMyRating(mine.rating);
          setMyComment(mine.comment);
        }
      })
      .finally(() => setReviewsLoading(false));
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    if (feedback !== "added") return;
    const t = setTimeout(() => setFeedback("idle"), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function submitReview() {
    if (!user) {
      toast.error("Login to write a review", {
        action: { label: "Login", onClick: () => router.push("/account") },
      });
      return;
    }
    if (myRating < 1) {
      toast.error("Pick a star rating first");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, rating: myRating, comment: myComment }),
      });
      if (!res.ok) throw new Error();
      toast.success("Thanks for your review!");
      loadReviews();
    } catch {
      toast.error("Couldn't submit your review, try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="container" style={{ padding: "40px 24px" }}>
          Loading…
        </div>
        <SiteFooter />
      </StoreShell>
    );
  }

  const discount = product.price > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const sizeInfo = getSizeGuide(product.category);
  const needsSize = !!sizeInfo && sizeInfo.kind !== "freesize";
  const inCart = isInCart(product.id, size || undefined);
  const wishlisted = isWishlisted(product.id);
  const btnLabel = feedback === "added" ? "Item added to cart" : inCart ? "In cart" : "Add to cart";
  const myExistingReview = reviews.find((r) => r.isMine);

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="product-page">
        <div className="product-gallery">
          {discount > 0 ? <span className="badge-sale">{discount}% OFF</span> : null}
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <span className="brand">{product.brand}</span>
          <h1>{product.name}</h1>
          {ratingSummary.reviewCount > 0 ? (
            <a href="#reviews" className="product-rating-link">
              <StarRatingDisplay rating={ratingSummary.avgRating} count={ratingSummary.reviewCount} size={16} />
            </a>
          ) : null}
          {product.occasion ? <span className="occasion-tag">{product.occasion}</span> : null}
          <div className="price-row">
            <span className="price-now">₹{product.salePrice}</span>
            {product.price > product.salePrice ? <span className="price-old">₹{product.price}</span> : null}
          </div>
          <p className="product-desc">{product.description}</p>
          {product.careInfo ? (
            <details className="size-guide">
              <summary>Fabric &amp; care</summary>
              <p className="size-guide-note">{product.careInfo}</p>
            </details>
          ) : null}
          {needsSize ? (
            <div className="size-row">
              <label>Size</label>
              <div className="size-chips">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-chip ${size === s ? "active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <SizeGuide category={product.category} />
          <div className="qty-row">
            <label>Quantity</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
          </div>
          <div className="product-actions-row">
            <button
              className={`btn btn-accent ${feedback === "added" ? "added" : ""}`}
              type="button"
              onClick={() => {
                if (needsSize && !size) {
                  toast.error("Please select a size");
                  return;
                }
                addToCart(
                  {
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    salePrice: product.salePrice,
                    size: size || undefined,
                  },
                  qty
                );
                setFeedback("added");
                toast.success(qty > 1 ? `Added ${qty} items to cart` : "Added to cart");
              }}
            >
              {btnLabel}
            </button>
            <button
              type="button"
              className={`btn btn-outline wishlist-toggle-btn ${wishlisted ? "active" : ""}`}
              onClick={() => toggleWishlist(product.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                <path d="M12 20.5s-7.5-4.6-10-9.3C.4 7.7 2.2 4 5.9 4c2.1 0 3.7 1.1 4.6 2.6C11.4 5.1 13 4 15.1 4c3.7 0 5.5 3.7 3.9 7.2-2.5 4.7-10 9.3-10 9.3z" />
              </svg>
              {wishlisted ? "Saved" : "Save"}
            </button>
            <Link href="/cart" className="btn btn-outline">
              Go to cart
            </Link>
          </div>
        </div>
      </div>

      <section className="section reviews-section" id="reviews">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Customer reviews</div>
              <h2>{ratingSummary.reviewCount > 0 ? "What customers say" : "Be the first to review"}</h2>
            </div>
            {ratingSummary.reviewCount > 0 ? (
              <StarRatingDisplay rating={ratingSummary.avgRating} count={ratingSummary.reviewCount} size={22} />
            ) : null}
          </div>

          <div className="review-form">
            <h3>{myExistingReview ? "Update your review" : "Write a review"}</h3>
            <StarRatingInput value={myRating} onChange={setMyRating} />
            <textarea
              placeholder="Share your experience with this product…"
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              rows={3}
            />
            <button type="button" className="btn btn-accent" onClick={submitReview} disabled={submitting}>
              {submitting ? "Submitting…" : myExistingReview ? "Update review" : "Submit review"}
            </button>
          </div>

          <div className="review-list">
            {reviewsLoading ? (
              <p className="review-empty">Loading reviews…</p>
            ) : reviews.length ? (
              reviews.map((r) => (
                <div className="review-card" key={r.id}>
                  <div className="review-card-head">
                    <StarRatingDisplay rating={r.rating} />
                    <span className="review-author">{r.userName}</span>
                    <span className="review-date">{new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  {r.comment ? <p className="review-comment">{r.comment}</p> : null}
                </div>
              ))
            ) : (
              <p className="review-empty">No reviews yet — be the first to share your thoughts.</p>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </StoreShell>
  );
}
