"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy shadow-card focus-ring"
      aria-label="Seite neu laden"
    >
      <RefreshCw className="h-4 w-4" />
      Neu laden
    </button>
  );
}
