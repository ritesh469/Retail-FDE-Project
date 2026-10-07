"use client";
import Link from "next/link";
import { useCart } from "@/app/lib/cart";
import { money } from "@/app/lib/format";

export default function CartPage() {
  const { items, setQty, total, count } = useCart();

  if (items.length === 0)
    return (
      <div className="empty">
        <h1 className="display" style={{ fontSize: "1.5rem" }}>
          Your cart is empty
        </h1>
        <p className="muted">
          Add something from the shop and it will show up here.
        </p>
        <Link href="/" className="btn">
          Browse products
        </Link>
      </div>
    );

  return (
    <>
      <div className="page-head">
        <h1 className="display">Cart</h1>
        <p>
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="split">
        <ul className="list" aria-label="Items in your cart">
          {items.map((i) => (
            <li key={i.product_id} className="list-row">
              <div className="list-main">
                <span className="list-title">{i.name}</span>
                <span className="list-meta">{money(i.price)} each</span>
              </div>
              <div
                className="qty"
                role="group"
                aria-label={`Quantity of ${i.name}`}
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty(i.product_id, i.qty - 1)}
                >
                  −
                </button>
                <output aria-live="polite">{i.qty}</output>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={i.qty >= 20}
                  onClick={() => setQty(i.product_id, i.qty + 1)}
                >
                  +
                </button>
              </div>
              <span
                className="amount"
                style={{ minWidth: "5.5rem", textAlign: "right" }}
              >
                {money(i.price * i.qty)}
              </span>
              <button
                className="btn ghost"
                onClick={() => setQty(i.product_id, 0)}
                aria-label={`Remove ${i.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <aside className="panel" aria-label="Order summary">
          <h2>Summary</h2>
          <div className="summary-line">
            <span>Subtotal</span>
            <span className="amount">{money(total)}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span className="muted">Free</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span className="amount">{money(total)}</span>
          </div>
          <Link
            href="/shop/checkout"
            className="btn lg block"
            style={{ marginTop: "1rem" }}
          >
            Checkout
          </Link>
          <Link
            href="/"
            className="btn ghost block"
            style={{ marginTop: "0.4rem" }}
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </>
  );
}
