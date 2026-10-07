"use client";
import Link from "next/link";
import { useCart } from "../lib/cart";

export function CartBadge() {
  const { count } = useCart();
  return (
    <Link
      href="/shop/cart"
      className="cart-link"
      aria-label={
        count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"
      }
    >
      Cart
      {count > 0 && <span className="cart-count">{count}</span>}
    </Link>
  );
}
