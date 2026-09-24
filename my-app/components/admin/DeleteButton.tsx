"use client";

import { useState } from "react";

export function DeleteButton({ label = "Hapus", confirmText }: { label?: string; confirmText: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-[3px] border border-[#FECACA] px-3 py-1.5 text-sm text-[#DC2626] transition hover:bg-[#FEE2E2]"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sm text-[#64748B]">{confirmText}</span>
      <button
        type="submit"
        className="rounded-[3px] bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Ya, hapus
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm text-[#334155] hover:border-[#64748B]"
      >
        Batal
      </button>
    </span>
  );
}
