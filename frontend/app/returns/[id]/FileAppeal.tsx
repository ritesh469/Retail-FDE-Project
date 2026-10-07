"use client";
import { useState } from "react";
import { errorMessage } from "@/app/lib/format";

export function FileAppeal({ returnId }: { returnId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function send() {
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/rg/appeals/returns/${returnId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setBusy(false);
    if (res.ok) {
      // no router.refresh() here: opening the appeal flips returns.status away
      // from "denied" server-side, which would unmount this component (via the
      // `status === "denied"` check in page.tsx) before the confirmation ever
      // painted. The next real page load picks up the fresh status normally.
      setDone(true);
    } else setErr(await errorMessage(res, "The appeal couldn't be sent"));
  }

  if (done) {
    return (
      <div className="notice ok" role="status">
        Appeal submitted — a different reviewer than the one who decided this
        case will take another look.
      </div>
    );
  }

  if (!open) {
    return (
      <section className="panel stack">
        <h2 style={{ marginBottom: 0 }}>Disagree with this decision?</h2>
        <p className="muted">
          Appeal it with your own explanation. A different reviewer than the one
          who declined it will decide.
        </p>
        <div>
          <button className="btn" onClick={() => setOpen(true)}>
            Appeal this decision
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="panel stack">
      <div className="field">
        <label className="field-label" htmlFor="appeal">
          Tell us why this should be reconsidered
        </label>
        <textarea
          id="appeal"
          className="input"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. The photo does show the defect described…"
        />
      </div>
      {err && (
        <div className="notice danger" role="alert">
          {err}
        </div>
      )}
      <div className="row">
        <button
          className="btn"
          disabled={busy || !reason.trim()}
          onClick={send}
        >
          {busy ? "Sending…" : "Submit appeal"}
        </button>
        <button className="btn secondary" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </section>
  );
}
