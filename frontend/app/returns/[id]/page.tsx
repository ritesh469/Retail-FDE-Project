import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Order, ReturnRow } from "@/app/lib/api";
import {
  caseNo,
  dateTime,
  money,
  reasonLabel,
  returnStatus,
} from "@/app/lib/format";
import { AnswerInfoRequest } from "./AnswerInfoRequest";
import { AutoRefresh } from "./AutoRefresh";
import { FileAppeal } from "./FileAppeal";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

/** Where the return is on its route: 0 submitted, 1 under review, 2 decided, 3 refunded. */
function stageOf(r: ReturnRow): number {
  if (r.refund_state === "refunded" || r.status === "refunded") return 3;
  if (r.status === "approved" || r.status === "denied") return 2;
  if (r.status === "pending") return 0;
  return 1;
}

export default async function ReturnStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  const { id } = await params;
  const token = (session as unknown as { accessToken?: string }).accessToken;
  const h = { authorization: `Bearer ${token}` };
  const [r, infoReq]: [ReturnRow, { id?: string; question?: string }] =
    await Promise.all([
      fetch(`${BACKEND}/returns/${id}`, { headers: h, cache: "no-store" }).then(
        (res) => res.json(),
      ),
      fetch(`${BACKEND}/returns/${id}/info-request`, {
        headers: h,
        cache: "no-store",
      }).then((res) => res.json()),
    ]);
  const order: Order | null = await fetch(`${BACKEND}/orders/${r.order_id}`, {
    headers: h,
    cache: "no-store",
  }).then((res) => (res.ok ? res.json() : null));
  const item = order?.items.find((it) => it.id === r.order_item_id);

  const s = returnStatus(r.status, r.refund_state);
  const stage = stageOf(r);
  const decisionLabel =
    r.status === "denied" ? "Declined" : stage >= 2 ? "Approved" : "Decision";
  const track = ["Submitted", "Under review", decisionLabel, "Refunded"];
  const finished = stage === 3 || r.status === "denied";
  // poll quickly while the agents are working, slowly while waiting on a person or the refund
  const refreshMs = ["pending", "in_review"].includes(r.status) ? 4000 : 15000;

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/returns">My returns</Link>
        <span aria-hidden="true">/</span>
        <span className="mono">#{caseNo(r.id)}</span>
      </nav>

      {infoReq?.question && (
        <div style={{ marginBottom: "1.25rem" }}>
          <AnswerInfoRequest returnId={id} question={infoReq.question} />
        </div>
      )}

      <div className="split">
        <div className="stack" style={{ gap: "1.25rem" }}>
          <article className="slip" aria-label="Return slip">
            <div className="slip-band">
              <span className="display">RETURN</span>
              <span className="mono" style={{ fontWeight: 700 }}>
                #{caseNo(r.id)}
              </span>
            </div>
            <div className="slip-body">
              <div className="stack" style={{ gap: "1rem" }}>
                <dl className="slip-fields">
                  <div>
                    <dt>Item</dt>
                    <dd>{item?.name ?? "Returned item"}</dd>
                  </div>
                  <div>
                    <dt>Reason</dt>
                    <dd>{reasonLabel(r.reason_code)}</dd>
                  </div>
                  <div>
                    <dt>Refund amount</dt>
                    <dd className="amount">{money(r.amount)}</dd>
                  </div>
                  <div>
                    <dt>Filed</dt>
                    <dd>{dateTime(r.created_at)}</dd>
                  </div>
                  <div>
                    <dt>Status code</dt>
                    <dd className="mono">{r.status}</dd>
                  </div>
                  {r.refund_state !== "none" && (
                    <div>
                      <dt>Refund</dt>
                      <dd className="mono">{r.refund_state}</dd>
                    </div>
                  )}
                </dl>
                <p>{s.blurb}</p>
              </div>
              <span
                key={`${r.status}-${r.refund_state}`}
                className={`stamp ${s.tone === "neutral" ? "" : s.tone}`}
                role="status"
              >
                {s.label}
              </span>
            </div>
            <div className="perf" aria-hidden="true" />
            <div className="slip-foot stack">
              <ol className="track" aria-label="Return progress">
                {track.map((t, i) => (
                  <li
                    key={t}
                    className={
                      finished && i <= stage
                        ? "done"
                        : i < stage
                          ? "done"
                          : i === stage
                            ? "now"
                            : undefined
                    }
                    aria-current={!finished && i === stage ? "step" : undefined}
                  >
                    {t}
                  </li>
                ))}
              </ol>
              {!finished && <AutoRefresh everyMs={refreshMs} />}
            </div>
          </article>

          {r.decision_reason && (
            <section className="panel">
              <h2>Why this decision</h2>
              <p className="explanation">{r.decision_reason}</p>
            </section>
          )}

          {r.status === "denied" && <FileAppeal returnId={id} />}
        </div>

        <aside className="stack" style={{ gap: "1.25rem" }}>
          <section className="panel">
            <h2>Your photo</h2>
            <div className="evidence">
              {r.photo_urls.map((u) => (
                <a key={u} href={u} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="Photo you uploaded with this return" />
                </a>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>What you told us</h2>
            <p className={r.reason_text ? undefined : "muted"}>
              {r.reason_text || "No extra details were added."}
            </p>
          </section>
          {order && (
            <Link href={`/orders/${order.id}`} className="btn secondary">
              View order <span className="mono">#{caseNo(order.id)}</span>
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
