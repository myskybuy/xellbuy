"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";

export default function ProductPage() {
  const params = useParams();
  const { addToCart, isInCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [params.id]);

  useEffect(() => {
    if (feedback !== "added") return;
    const t = setTimeout(() => setFeedback("idle"), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

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
  const inCart = isInCart(product.id);
  const btnLabel = feedback === "added" ? "Item added to cart" : inCart ? "In cart" : "Add to cart";

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
          <div className="price-row">
            <span className="price-now">₹{product.salePrice}</span>
            {product.price > product.salePrice ? <span className="price-old">₹{product.price}</span> : null}
          </div>
          <p className="product-desc">{product.description}</p>
          <div className="qty-row">
            <label>Quantity</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
          </div>
          <button
            className={`btn btn-accent ${feedback === "added" ? "added" : ""}`}
            type="button"
            onClick={() => {
              addToCart(
                { id: product.id, name: product.name, image: product.image, salePrice: product.salePrice },
                qty
              );
              setFeedback("added");
            }}
          >
            {btnLabel}
          </button>
          <Link href="/cart" className="btn btn-outline" style={{ marginLeft: 10 }}>
            Go to cart
          </Link>
        </div>
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
