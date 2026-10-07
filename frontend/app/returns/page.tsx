import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Order, ReturnRow } from "../lib/api";
import {
  caseNo,
  money,
  reasonLabel,
  returnStatus,
  shortDate,
} from "../lib/format";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default async function ReturnsPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  const token = (session as unknown as { accessToken?: string }).accessToken;
  const h = { authorization: `Bearer ${token}` };
  const [rows, orders]: [ReturnRow[], Order[]] = await Promise.all([
    fetch(`${BACKEND}/returns`, { headers: h, cache: "no-store" }).then((r) =>
      r.json(),
    ),
    fetch(`${BACKEND}/orders`, { headers: h, cache: "no-store" }).then((r) =>
      r.json(),
    ),
  ]);
  const itemName = new Map(
    orders.flatMap((o) => o.items.map((it) => [it.id, it.name])),
  );

  return (
    <>
      <div className="page-head">
        <h1 className="display">My returns</h1>
        <p>
          Open a return to see where it is in the review and what was decided.
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="empty">
          <h2 className="display">No returns yet</h2>
          <p className="muted">
            To send something back, open the order it came in.
          </p>
          <Link href="/orders" className="btn">
            Go to my orders
          </Link>
        </div>
      ) : (
        <div className="list">
          {rows.map((r) => {
            const s = returnStatus(r.status, r.refund_state);
            return (
              <Link key={r.id} href={`/returns/${r.id}`} className="list-row">
                <div className="list-main">
                  <span className="list-title">
                    {itemName.get(r.order_item_id) ?? "Returned item"}
                  </span>
                  <span className="list-meta">
                    <span className="mono">#{caseNo(r.id)}</span> ·{" "}
                    {reasonLabel(r.reason_code)} · {shortDate(r.created_at)}
                  </span>
                </div>
                <span className={`badge ${s.tone === "neutral" ? "" : s.tone}`}>
                  {s.label}
                </span>
                <span className="amount">{money(r.amount)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
