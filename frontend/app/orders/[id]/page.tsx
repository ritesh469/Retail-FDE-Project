import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Order, ReturnRow } from "@/app/lib/api";
import { caseNo, dateTime, money, returnStatus } from "@/app/lib/format";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  const { id } = await params;
  const token = (session as unknown as { accessToken?: string }).accessToken;
  const h = { authorization: `Bearer ${token}` };
  const [o, returns]: [Order, ReturnRow[]] = await Promise.all([
    fetch(`${BACKEND}/orders/${id}`, { headers: h, cache: "no-store" }).then(
      (r) => r.json(),
    ),
    fetch(`${BACKEND}/returns`, { headers: h, cache: "no-store" }).then((r) =>
      r.json(),
    ),
  ]);
  const returnsFor = (itemId: string) =>
    returns.filter((r) => r.order_item_id === itemId);

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/orders">My orders</Link>
        <span aria-hidden="true">/</span>
        <span className="mono">#{caseNo(o.id)}</span>
      </nav>
      <div className="page-head">
        <h1 className="display">
          Order <span className="mono">#{caseNo(o.id)}</span>
        </h1>
        <p>
          Placed {dateTime(o.placed_at)} · paid with card ending{" "}
          <span className="mono">{o.payment_last4}</span> ·{" "}
          <span className="badge">{o.status}</span>
        </p>
      </div>

      <div className="split">
        <ul className="list" aria-label="Items in this order">
          {o.items.map((it) => {
            // mirrors the backend rule: any return that isn't denied blocks a new one
            const open = returnsFor(it.id).find((r) => r.status !== "denied");
            return (
              <li key={it.id} className="list-row">
                <div className="list-main">
                  <Link
                    href={`/shop/product/${it.product_id}`}
                    className="list-title"
                  >
                    {it.name}
                  </Link>
                  <span className="list-meta">
                    {money(it.unit_price)} × {it.qty}
                  </span>
                  {returnsFor(it.id).map((r) => (
                    <Link
                      key={r.id}
                      href={`/returns/${r.id}`}
                      className="list-meta link"
                    >
                      Return <span className="mono">#{caseNo(r.id)}</span>:{" "}
                      {returnStatus(r.status, r.refund_state).label}
                    </Link>
                  ))}
                </div>
                {open ? (
                  <Link href={`/returns/${open.id}`} className="btn secondary">
                    View return
                  </Link>
                ) : (
                  <Link
                    href={`/returns/new?item=${it.id}&name=${encodeURIComponent(it.name)}`}
                    className="btn secondary"
                  >
                    Return this
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <aside className="panel" aria-label="Order total">
          <h2>Total paid</h2>
          <span className="price lg">{money(o.total)}</span>
          <p className="muted" style={{ fontSize: 13.5, marginTop: "0.75rem" }}>
            Something wrong with an item? Choose <strong>Return this</strong>{" "}
            next to it. You&apos;ll need a photo of the item.
          </p>
        </aside>
      </div>
    </>
  );
}
