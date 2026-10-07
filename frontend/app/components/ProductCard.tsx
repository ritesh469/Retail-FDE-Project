"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import type { Product } from "../lib/api";

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(t);
  }, [added]);

  const href = `/shop/product/${p.id}`;
  return (
    <article className="product-card">
      <Link
        href={href}
        className="product-img"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_url} alt="" loading="lazy" />
      </Link>
      <div className="product-body">
        <span className="eyebrow">{p.category}</span>
        <Link href={href} className="product-name">
          {p.name}
        </Link>
        <div className="product-foot">
          <span className="price">{money(p.price)}</span>
          <button
            className={added ? "btn secondary" : "btn"}
            onClick={() => {
              add({ product_id: p.id, name: p.name, price: Number(p.price) });
              setAdded(true);
            }}
            aria-live="polite"
          >
            {added ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
