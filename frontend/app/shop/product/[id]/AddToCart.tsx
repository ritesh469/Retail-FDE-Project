"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/lib/cart";

export function AddToCart({
  id,
  name,
  price,
  max,
}: {
  id: string;
  name: string;
  price: number;
  max: number;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const router = useRouter();
  return (
    <div className="row">
      <div className="qty" role="group" aria-label="Quantity">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= 1}
          onClick={() => setQty(qty - 1)}
        >
          −
        </button>
        <output aria-live="polite">{qty}</output>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={qty >= max}
          onClick={() => setQty(qty + 1)}
        >
          +
        </button>
      </div>
      <button
        className="btn lg"
        onClick={() => {
          add({ product_id: id, name, price }, qty);
          router.push("/shop/cart");
        }}
      >
        Add to cart
      </button>
    </div>
  );
}
