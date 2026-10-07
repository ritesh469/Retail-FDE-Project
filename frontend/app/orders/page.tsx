import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Order } from "../lib/api";
import { caseNo, money, shortDate } from "../lib/format";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  const token = (session as unknown as { accessToken?: string }).accessToken;
  const orders: Order[] = await fetch(`${BACKEND}/orders`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  }).then((r) => r.json());

  return (
    <>
      <div className="page-head">
        <h1 className="display">My orders</h1>
        <p>Open an order to start a return for any item in it.</p>
      </div>
      {orders.length === 0 ? (
        <div className="empty">
          <h2 className="display">No orders yet</h2>
          <p className="muted">Orders you place will show up here.</p>
          <Link href="/" className="btn">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="list">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="list-row">
              <div className="list-main">
                <span className="list-title">
                  {o.items.map((it) => it.name).join(", ")}
                </span>
                <span className="list-meta">
                  <span className="mono">#{caseNo(o.id)}</span> ·{" "}
                  {shortDate(o.placed_at)} ·{" "}
                  {o.items.reduce((n, it) => n + it.qty, 0)} item(s)
                </span>
              </div>
              <span className="badge">{o.status}</span>
              <span className="amount">{money(o.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
