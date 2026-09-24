import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { workerGetInquiry } from "@/services/worker.service";
import { processWorkerInquiry } from "@/lib/actions/worker-inquiries";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Detail Inquiry" };

const STATUSES = ["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};

export default async function WorkerInquiryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const inq = await workerGetInquiry(id);
  if (!inq) notFound();

  const waLink = `https://wa.me/${inq.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo ${inq.name}, terima kasih atas inquiry Anda terkait ${inq.product?.name ?? "produk kami"}.`)}`;

  return (
    <div className="max-w-2xl">
      <PageHeader title={`Inquiry: ${inq.name}`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Detail inquiry">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ["Nama", inq.name],
            ["Email", inq.email],
            ["WhatsApp", inq.whatsapp],
            ["Jumlah", `${inq.quantity} pcs`],
            ["Produk", inq.product ? inq.product.name : "Pertanyaan umum"],
            ["Tanggal", new Date(inq.createdAt).toLocaleString("id-ID")],
            ["Ditangani", inq.handledBy?.name ?? "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[#64748B]">{k}</dt>
              <dd className="mt-0.5 font-medium text-[#0F172A]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 border-t border-[#E2E8F0] pt-4">
          <p className="text-sm text-[#64748B]">Pesan</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#0F172A]">{inq.message}</p>
        </div>
        <div className="mt-4 border-t border-[#E2E8F0] pt-4">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0A192F]"
          >
            Balas via WhatsApp
          </a>
        </div>
      </section>
      <section className="mt-4 rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Ubah status">
        <h2 className="font-medium text-[#0F172A]">Status: {STATUS_LABEL[inq.status]}</h2>
        <form action={processWorkerInquiry.bind(null, id)} className="mt-3 flex flex-wrap gap-2">
          <label htmlFor="w-inq-st" className="sr-only">Ubah status</label>
          <select id="w-inq-st" name="status" defaultValue={inq.status} className="rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-medium text-white hover:bg-[#13233F]">
            Simpan Status
          </button>
        </form>
        <Link href="/worker/inquiries" className="mt-4 inline-block text-sm text-[#64748B] hover:text-[#0F172A] hover:underline">
          ← Kembali ke daftar
        </Link>
      </section>
    </div>
  );
}
