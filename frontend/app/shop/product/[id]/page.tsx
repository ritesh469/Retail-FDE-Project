import Link from "next/link";
import { AddToCart } from "./AddToCart";
import type { Product } from "@/app/lib/api";
import { money } from "@/app/lib/format";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p: Product = await fetch(`${BACKEND}/products/${id}`, {
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/?category=${encodeURIComponent(p.category)}`}>
          {p.category}
        </Link>
      </nav>
      <div className="pdp">
        <div className="pdp-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image_url} alt={p.name} />
        </div>
        <div className="stack" style={{ gap: "1rem" }}>
          <span className="eyebrow">
            {p.category} · SKU {p.sku}
          </span>
          <h1 className="display">{p.name}</h1>
          <div className="row" style={{ gap: "1rem" }}>
            <span className="price lg">{money(p.price)}</span>
            {p.stock >= 10 ? (
              <span className="badge ok">In stock</span>
            ) : p.stock > 0 ? (
              <span className="badge warn">Only {p.stock} left</span>
            ) : (
              <span className="badge danger">Out of stock</span>
            )}
          </div>
          <p style={{ maxWidth: "58ch" }}>{p.description}</p>
          {p.stock > 0 && (
            <AddToCart
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              max={Math.min(20, p.stock)}
            />
          )}
          <div className="notice" style={{ marginTop: "0.5rem" }}>
            <strong>If something&apos;s wrong, send it back.</strong> Start a
            return from <strong>My orders</strong> with a photo of the item.
            Review agents check it, and nothing is refused without a person
            signing off.
          </div>
        </div>
      </div>
    </>
  );
}
