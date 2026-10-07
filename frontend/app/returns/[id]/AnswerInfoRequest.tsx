"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/app/lib/format";

export function AnswerInfoRequest({
  returnId,
  question,
}: {
  returnId: string;
  question: string;
}) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("answer", answer);
    const res = await fetch(`/api/rg/returns/${returnId}/info-request`, {
      method: "POST",
      body: fd,
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setErr(await errorMessage(res, "Your answer couldn't be sent"));
  }

  return (
    <section className="notice warn stack" aria-labelledby="info-q">
      <strong id="info-q">The reviewer has a question:</strong>
      <p style={{ fontSize: 15.5 }}>{question}</p>
      <label htmlFor="info-answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="info-answer"
        className="input"
        rows={3}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Your answer…"
      />
      {err && (
        <div className="notice danger" role="alert">
          {err}
        </div>
      )}
      <div>
        <button
          className="btn"
          disabled={busy || !answer.trim()}
          onClick={send}
        >
          {busy ? "Sending…" : "Send answer — this re-opens the review"}
        </button>
      </div>
    </section>
  );
}
