"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "./CartProvider";

export type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number;
  image: string;
  stock: number;
  description: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, isInCart } = useCart();
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");
  const inCart = isInCart(product.id);
  const discount = product.price > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  useEffect(() => {
    if (feedback !== "added") return;
    const t = setTimeout(() => setFeedback("idle"), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  function handleAdd() {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      salePrice: product.salePrice,
    });
    setFeedback("added");
    toast.success("Added to cart");
  }

  const btnLabel =
    feedback === "added" ? "Added" : inCart ? "In cart" : "Add to cart";

  return (
    <article className="product-card">
      <Link href={`/product/${product.id}`} className="thumb">
        {discount > 0 ? <span className="badge-sale">-{discount}%</span> : null}
        {product.category ? <span className="badge-cat">{product.category}</span> : null}
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="info">
        <span className="brand">{product.brand || "Xellbuy"}</span>
        <Link href={`/product/${product.id}`} className="name-link">
          <h3 className="name">{product.name}</h3>
        </Link>
        <div className="product-card-footer">
          <div className="price-row">
            <span className="price-now">₹{product.salePrice.toLocaleString("en-IN")}</span>
            {product.price > product.salePrice ? (
              <span className="price-old">₹{product.price.toLocaleString("en-IN")}</span>
            ) : null}
          </div>
          <button
            className={`add-btn ${feedback === "added" ? "added" : ""} ${inCart && feedback === "idle" ? "in-cart" : ""}`}
            onClick={handleAdd}
            type="button"
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
