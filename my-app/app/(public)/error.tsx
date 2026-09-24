"use client";

import Link from "next/link";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center" role="alert">
      <h1 className="font-sans text-3xl font-semibold text-[#0F172A]">Halaman gagal dimuat</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
        Terjadi gangguan sementara. Silakan coba lagi atau kembali ke beranda.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-[3px] bg-[#0A192F] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A192F]"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-[3px] border border-[#CBD5E1] px-6 py-2.5 text-sm font-medium text-[#0F172A] transition hover:border-ink"
        >
          Beranda
        </Link>
      </div>
    </main>
  );
}
