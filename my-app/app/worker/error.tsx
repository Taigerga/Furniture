"use client";

export default function WorkerError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-[3px] border border-[#FECACA] bg-[#FEE2E2] p-8 text-center" role="alert">
      <h1 className="font-medium text-red-900">Terjadi kesalahan</h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#DC2626]">Coba muat ulang halaman ini.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-[3px] bg-red-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-800"
      >
        Coba Lagi
      </button>
    </div>
  );
}
