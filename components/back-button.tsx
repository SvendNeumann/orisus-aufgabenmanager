"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy shadow-card focus-ring"
      aria-label="Eine Seite zurück"
    >
      <ArrowLeft className="h-4 w-4" />
      Zurück
    </button>
  );
}
