"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useCart } from "@/app/lib/cart";
import { client } from "@/app/lib/api";
import { money } from "@/app/lib/format";

/** FastAPI errors are `{detail: string}` or `{detail: [{msg}, …]}` — never render the object. */
function errText(error: unknown, status?: number): string {
  const d = (error as { detail?: unknown } | null | undefined)?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d))
    return d.map((e) => (e as { msg?: string })?.msg ?? String(e)).join("; ");
  return status ? `Checkout failed (HTTP ${status}).` : "Checkout failed.";
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    line1: "1 Market St",
    city: "San Francisco",
    zip: "94105",
    card_number: "4242 4242 4242 4242",
    card_exp: "12/30",
    card_cvc: "123",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { data, error, response } = await client.POST("/orders", {
      body: {
        lines: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        shipping_address: { line1: form.line1, city: form.city, zip: form.zip },
        card_number: form.card_number,
        card_exp: form.card_exp,
        card_cvc: form.card_cvc,
      },
    });
    if (error || !data) {
      if (response?.status === 401) {
        // not signed in (or session expired) — send them to Keycloak, then back
        // here; the cart is in localStorage so it survives the round trip.
        void signIn("keycloak", { callbackUrl: "/shop/checkout" });
        return;
      }
      setErr(errText(error, response?.status));
      setBusy(false);
      return;
    }
    clear();
    router.push(`/orders/${data.id}`);
  }

  if (items.length === 0)
    return (
      <div className="empty">
        <h1 className="display" style={{ fontSize: "1.5rem" }}>
          Your cart is empty
        </h1>
        <p className="muted">There&apos;s nothing to check out yet.</p>
        <Link href="/" className="btn">
          Browse products
        </Link>
      </div>
    );

  return (
    <>
      <div className="page-head">
        <h1 className="display">Checkout</h1>
        <p>You&apos;ll be asked to sign in if you aren&apos;t already.</p>
      </div>
      <form className="split" onSubmit={submit}>
        <div className="stack" style={{ gap: "1.25rem" }}>
          <section className="panel stack">
            <h2>Shipping address</h2>
            <div className="field">
              <label className="field-label" htmlFor="line1">
                Street address
              </label>
              <input
                id="line1"
                className="input"
                value={form.line1}
                onChange={set("line1")}
                required
                autoComplete="address-line1"
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  className="input"
                  value={form.city}
                  onChange={set("city")}
                  required
                  autoComplete="address-level2"
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="zip">
                  ZIP code
                </label>
                <input
                  id="zip"
                  className="input"
                  value={form.zip}
                  onChange={set("zip")}
                  required
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </section>

          <section className="panel stack">
            <h2>Payment</h2>
            <div className="notice">
              Test mode: no money moves. Keep the pre-filled test card - the
              number is checked with the Luhn algorithm and only the last 4
              digits are stored.
            </div>
            <div className="field">
              <label className="field-label" htmlFor="card_number">
                Card number
              </label>
              <input
                id="card_number"
                className="input mono"
                value={form.card_number}
                onChange={set("card_number")}
                required
                inputMode="numeric"
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="card_exp">
                  Expiry (MM/YY)
                </label>
                <input
                  id="card_exp"
                  className="input mono"
                  value={form.card_exp}
                  onChange={set("card_exp")}
                  required
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="card_cvc">
                  CVC
                </label>
                <input
                  id="card_cvc"
                  className="input mono"
                  value={form.card_cvc}
                  onChange={set("card_cvc")}
                  required
                  inputMode="numeric"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="panel" aria-label="Order summary">
          <h2>Your order</h2>
          {items.map((i) => (
            <div key={i.product_id} className="summary-line">
              <span>
                {i.name} <span className="muted">× {i.qty}</span>
              </span>
              <span className="amount">{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="summary-line total">
            <span>Total</span>
            <span className="amount">{money(total)}</span>
          </div>
          {err && (
            <div
              className="notice danger"
              role="alert"
              style={{ marginTop: "0.75rem" }}
            >
              {err}
            </div>
          )}
          <button
            className="btn lg block"
            disabled={busy}
            style={{ marginTop: "1rem" }}
          >
            {busy ? "Placing order…" : `Pay ${money(total)}`}
          </button>
        </aside>
      </form>
    </>
  );
}
