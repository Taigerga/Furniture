import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-sans text-6xl font-semibold text-[#0063CE]">404</p>
      <h1 className="mt-4 text-xl font-semibold text-[#0F172A]">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-[#64748B]">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-[3px] bg-[#0A192F] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0A192F]"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
