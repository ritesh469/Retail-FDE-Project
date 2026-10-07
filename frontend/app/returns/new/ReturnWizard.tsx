"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REASONS, errorMessage, reasonLabel } from "@/app/lib/format";

const STEPS = ["Reason", "Details", "Photo"];
const MAX_MB = 8; // the backend rejects uploads above 8 MB

export function ReturnWizard({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName: string;
}) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("damaged");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function setPhoto(f: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
    setFile(f);
  }

  function pick(f: File | null | undefined) {
    setErr("");
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("That file isn't an image. Choose a JPG, PNG or WebP photo.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setErr(`That photo is over ${MAX_MB} MB. Choose a smaller one.`);
      return;
    }
    setPhoto(f);
  }

  async function submit() {
    if (!file) {
      setErr("A photo is required.");
      return;
    }
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.set("order_item_id", itemId);
    fd.set("reason_code", reason);
    fd.set("reason_text", text);
    fd.set("photo", file);
    const res = await fetch("/api/rg/returns", { method: "POST", body: fd });
    if (!res.ok) {
      setErr(await errorMessage(res, "The return couldn't be submitted"));
      setBusy(false);
      return;
    }
    const r = await res.json();
    router.push(`/returns/${r.id}`);
  }

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/orders">My orders</Link>
        <span aria-hidden="true">/</span>
        <span>Start a return</span>
      </nav>
      <div className="page-head">
        <span className="eyebrow">Start a return</span>
        <h1 className="display">{itemName}</h1>
      </div>

      <div className="split">
        <div className="panel">
          <ol className="steps" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li
                key={s}
                aria-current={step === i + 1 ? "step" : undefined}
                className={step > i + 1 ? "done" : undefined}
              >
                <span>{step > i + 1 ? "✓" : i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <p className="muted" style={{ fontSize: 13.5, marginBottom: "1rem" }}>
            Step {step} of 3
          </p>

          {step === 1 && (
            <div className="stack" style={{ gap: "1rem" }}>
              <fieldset className="reason-grid">
                <legend>Why are you returning this?</legend>
                {REASONS.map((r) => (
                  <label key={r.code} className="reason">
                    <input
                      type="radio"
                      name="reason"
                      value={r.code}
                      checked={reason === r.code}
                      onChange={() => setReason(r.code)}
                    />
                    <strong>{r.label}</strong>
                    <small>{r.hint}</small>
                  </label>
                ))}
              </fieldset>
              <div className="row">
                <button className="btn" onClick={() => setStep(2)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stack" style={{ gap: "1rem" }}>
              <div className="field">
                <label className="field-label" htmlFor="details">
                  Tell us more (optional)
                </label>
                <textarea
                  id="details"
                  className="input"
                  rows={5}
                  maxLength={2000}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. The rim was cracked when it arrived."
                />
                <span className="field-hint">
                  Reason: {reasonLabel(reason)}. Describe what you see - the
                  reviewer reads this next to your photo.
                </span>
              </div>
              <div className="row">
                <button className="btn secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn" onClick={() => setStep(3)}>
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="stack" style={{ gap: "1rem" }}>
              <span className="field-label" id="photo-label">
                Upload a photo of the item (required)
              </span>
              {file && preview ? (
                <div className="preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Your photo of the item" />
                  <div className="list-main">
                    <span
                      className="list-title"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {file.name}
                    </span>
                    <span className="list-meta">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <button className="btn ghost" onClick={() => setPhoto(null)}>
                    Change
                  </button>
                </div>
              ) : (
                <label
                  className={`dropzone${drag ? " drag" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    pick(e.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    aria-labelledby="photo-label"
                    onChange={(e) => pick(e.target.files?.[0])}
                  />
                  <strong>Choose a photo</strong>
                  <span className="muted" style={{ fontSize: 13.5 }}>
                    or drag it here · JPG, PNG or WebP, up to {MAX_MB} MB
                  </span>
                </label>
              )}
              <span className="field-hint">
                Photograph the actual item you received. The review compares it
                with the product photo.
              </span>
              {err && (
                <div className="notice danger" role="alert">
                  {err}
                </div>
              )}
              <div className="row">
                <button className="btn secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button
                  className="btn"
                  disabled={busy || !file}
                  aria-describedby={file ? undefined : "photo-needed"}
                  onClick={submit}
                >
                  {busy ? "Submitting…" : "Submit return"}
                </button>
                {!file && (
                  <span id="photo-needed" className="field-hint">
                    Choose a photo to submit.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="panel" aria-label="What happens next">
          <h2>What happens next</h2>
          <ol className="route" style={{ border: 0, padding: 0 }}>
            <li>
              <span>1</span>
              <span>
                Review agents check your order, the return policy, your photo
                and your history.
              </span>
            </li>
            <li className="human">
              <span>2</span>
              <span>
                A person reviews anything unclear. Nothing is refused without
                one.
              </span>
            </li>
            <li>
              <span>3</span>
              <span>
                You can follow every step on the return&apos;s page. We email
                you when a reviewer decides or your refund is issued.
              </span>
            </li>
          </ol>
        </aside>
      </div>
    </>
  );
}
