import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-12 text-center">
      <p className="font-sans text-5xl font-semibold text-white/70">404</p>
      <h1 className="mt-3 font-medium text-[#0F172A]">Data tidak ditemukan</h1>
      <p className="mt-1 text-sm text-[#64748B]">Item yang Anda cari tidak ada atau sudah dihapus.</p>
      <Link
        href="/admin"
        className="mt-5 inline-block rounded-[3px] bg-[#0A192F] px-5 py-2 text-sm font-medium text-white hover:bg-[#13233F]"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
