"use client";

import { useState } from "react";

/** Tombol salin ke clipboard dengan feedback "Tersalin". */
export function CopyButton({
  text,
  label = "Salin",
  copiedLabel = "Tersalin",
  className = "",
  title,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback untuk konteks non-secure / izin ditolak.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* tidak bisa menyalin */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={title ?? "Salin teks ke papan klip"}
      aria-live="polite"
      className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[3px] border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-semibold text-[#0A192F] transition hover:border-[#0A192F] ${className}`}
    >
      {copied ? (
        <>
          <span aria-hidden>✓</span>
          {copiedLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
