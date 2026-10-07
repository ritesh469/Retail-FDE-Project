import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

type Row = {
  id: string;
  status: string;
  decision: string | null;
  amount: string;
  reason_code: string;
  created_at: string;
  claimed_by: string | null;
  customer: string;
  item: string;
};

/** Waiting time as the largest sensible unit: 45m, 5h, 3d. */
function age(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60000));
  if (m < 60) return `${m}m`;
  if (m < 48 * 60) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}

function decisionBadge(decision: string | null) {
  const cls =
    decision === "approve"
      ? "ok"
      : decision === "deny"
        ? "danger"
        : decision === "escalate"
          ? "warn"
          : "";
  return (
    <span className={`d-badge ${cls}`}>
      <span className="dot" />
      {decision ?? "—"}
    </span>
  );
}

export default async function Queue({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "escalated";
  const session = await auth();
  if (!session) redirect("/");
  const token = (session as unknown as { accessToken?: string }).accessToken;
  const rows: Row[] = await fetch(
    `${BACKEND}/dashboard/queue?status=${status}`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  ).then((r) => r.json());
  // server component: one render per request, so a single "now" is stable here
  // eslint-disable-next-line react-hooks/purity -- RSC render is request-scoped
  const renderedAt = Date.now();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="d-head">
        <h1>Queue</h1>
      </div>
      <div className="d-tabs">
        {["escalated", "in_review", "info_requested", "approved", "denied"].map(
          (s) => (
            <Link
              key={s}
              href={`/dashboard?status=${s}`}
              className={`d-tab${s === status ? " active" : ""}`}
            >
              {s.replace("_", " ")}
            </Link>
          ),
        )}
      </div>
      <div className="d-section" style={{ padding: 0 }}>
        <table className="d-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 16 }}>Case</th>
              <th>Item</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Agent</th>
              <th>Age</th>
              <th style={{ paddingRight: 16 }}>Claimed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="d-mono" style={{ paddingLeft: 16 }}>
                  <Link href={`/dashboard/${r.id}`} style={{ color: "var(--accent)" }}>
                    #{r.id.slice(0, 8)}
                  </Link>
                </td>
                <td>{r.item}</td>
                <td className="muted">{r.reason_code}</td>
                <td className="num">${r.amount}</td>
                <td>{decisionBadge(r.decision)}</td>
                <td className="muted num">
                  {age(renderedAt - new Date(r.created_at).getTime())}
                </td>
                <td className="muted" style={{ paddingRight: 16 }}>
                  {r.claimed_by ? (
                    <span className="d-badge info">
                      <span className="dot" />
                      claimed
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="d-empty">nothing in {status.replace("_", " ")}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
