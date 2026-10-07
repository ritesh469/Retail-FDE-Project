"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches the (server-rendered) return page on an interval while it can still change. */
export function AutoRefresh({ everyMs }: { everyMs: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), everyMs);
    return () => clearInterval(t);
  }, [router, everyMs]);
  return (
    <span className="muted" style={{ fontSize: 13 }}>
      This page updates automatically.
    </span>
  );
}
