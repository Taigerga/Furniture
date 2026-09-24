import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getWorkerDashboard } from "@/services/worker.service";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata: Metadata = { title: "Dashboard Pekerja" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu review",
  REJECTED: "Ditolak",
  APPROVED: "Disetujui",
  DRAFT: "Draf",
};

export default async function WorkerDashboardPage() {
  const session = await auth();
  const stats = await getWorkerDashboard(session!.user.id);

  const cards = [
    { label: "Menunggu Review", value: stats.pending, tone: "text-amber-700 bg-amber-50 border-amber-200" },
    { label: "Disetujui", value: stats.approved, tone: "text-[#0A192F] bg-[#DBEAFE] border-[#007BFF]/30" },
    { label: "Ditolak", value: stats.rejected, tone: "text-[#DC2626] bg-[#FEE2E2] border-[#FECACA]" },
    { label: "Inquiry Baru", value: stats.newInquiries, tone: "text-[#334155] bg-[#F4F5F7] border-[#E2E8F0]" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Halo, ${session!.user.name ?? "Pekerja"}`} />
      <p className="-mt-3 text-sm text-[#64748B]">
        Karya Anda terbit setelah disetujui admin. Karya saya: {stats.products} produk · {stats.articles} artikel · {stats.galleries} galeri.
      </p>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Status pengajuan saya">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-[3px] border p-4 ${c.tone}`}>
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="mt-1 text-sm">{c.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-4" aria-label="Perlu perhatian">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-[#0F172A]">Perlu Perhatian</h2>
          <Link href="/worker/submissions" className="text-sm font-medium text-[#0063CE] hover:underline">
            Semua pengajuan
          </Link>
        </div>
        {stats.attention.length === 0 ? (
          <p className="text-sm text-[#64748B]">Tidak ada pengajuan pending atau ditolak. Kerja bagus!</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {stats.attention.map((a) => (
              <li key={`${a.kind}-${a.id}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <div>
                  <p className="font-medium text-[#0F172A]">
                    <span className="mr-2 text-xs font-normal text-[#64748B]">{a.kind}</span>
                    {a.label}
                  </p>
                  {a.approvalStatus === "REJECTED" && a.rejectionReason ? (
                    <p className="mt-0.5 text-xs text-red-600">Alasan: {a.rejectionReason}</p>
                  ) : null}
                </div>
                <span className="rounded-[3px] bg-[#F4F5F7] px-2.5 py-1 text-xs font-medium text-[#334155]">
                  {STATUS_LABEL[a.approvalStatus] ?? a.approvalStatus}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
