/** Display helpers shared by the storefront pages. */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function money(v: string | number): string {
  return USD.format(Number(v));
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Case / order numbers are the first 8 chars of the UUID, shown in mono. */
export function caseNo(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/** Return reasons, in the order the wizard offers them. `code` is what the API stores. */
export const REASONS = [
  {
    code: "damaged",
    label: "Damaged",
    hint: "Broken, cracked or dented on arrival",
  },
  { code: "defective", label: "Defective", hint: "Doesn't work as it should" },
  {
    code: "not_as_described",
    label: "Not as described",
    hint: "Differs from the listing",
  },
  {
    code: "wrong_item",
    label: "Wrong item",
    hint: "You received something else",
  },
  { code: "quality", label: "Quality", hint: "Poorer quality than expected" },
  {
    code: "arrived_late",
    label: "Arrived late",
    hint: "Came after you needed it",
  },
  {
    code: "no_longer_needed",
    label: "No longer needed",
    hint: "You changed your mind",
  },
] as const;

export function reasonLabel(code: string): string {
  return REASONS.find((r) => r.code === code)?.label ?? code.replace(/_/g, " ");
}

export type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

/** Customer-facing meaning of each `returns.status` value. */
const STATUS: Record<string, { label: string; tone: Tone; blurb: string }> = {
  pending: {
    label: "Received",
    tone: "neutral",
    blurb: "We have your request. The review starts automatically in a moment.",
  },
  in_review: {
    label: "Being checked",
    tone: "info",
    blurb:
      "Review agents are checking your order, the return policy, your photo and your account history.",
  },
  escalated: {
    label: "With a reviewer",
    tone: "warn",
    blurb:
      "A person is reviewing your return. You'll get an email when they decide.",
  },
  info_requested: {
    label: "Question for you",
    tone: "warn",
    blurb:
      "The reviewer needs one more detail. Answer below and the review picks up again.",
  },
  approved: {
    label: "Approved",
    tone: "ok",
    blurb:
      "Your return is approved. The refund goes to your original payment method.",
  },
  denied: {
    label: "Declined",
    tone: "danger",
    blurb:
      "A reviewer declined this return. If you think that's wrong, appeal below - a different reviewer will decide.",
  },
  refunded: {
    label: "Refunded",
    tone: "ok",
    blurb: "The refund has been issued to your original payment method.",
  },
};

export function returnStatus(status: string, refundState?: string) {
  if (refundState === "refunded") return STATUS.refunded;
  return (
    STATUS[status] ?? { label: status, tone: "neutral" as Tone, blurb: "" }
  );
}

/** FastAPI errors are `{detail: string}` or `{detail: [{msg}, ...]}`. */
export async function errorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await res.json();
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d))
      return d.map((e: { msg?: string }) => e?.msg ?? String(e)).join("; ");
  } catch {
    /* not JSON */
  }
  if (res.status === 429)
    return "Too many requests - wait a minute and try again.";
  if (res.status === 401) return "Your session expired - sign in again.";
  return `${fallback} (HTTP ${res.status}).`;
}
