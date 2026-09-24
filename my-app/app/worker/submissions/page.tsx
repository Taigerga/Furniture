import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { workerSubmissions } from "@/services/worker.service";
import { PageHeader } from "@/components/admin/PageHeader";
import { ApprovalBadge } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Pengajuan Saya" };

export default async function WorkerSubmissionsPage() {
  const session = await auth();
  const items = await workerSubmissions(session!.user.id);

  return (
    <div>
      <PageHeader title="Pengajuan Saya" />
      <p className="mb-4 text-sm text-[#64748B]">
        Riwayat pengajuan yang menunggu review atau ditolak admin, semua karya Anda.
      </p>
      {items.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
          Tidak ada pengajuan pending atau ditolak.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={`${s.kind}-${s.id}`} className="flex flex-wrap items-center gap-3 rounded-[3px] border border-[#E2E8F0] bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[#0F172A]">
                  <span className="mr-2 text-xs font-normal text-[#64748B]">{s.kind}</span>
                  {s.label}
                </p>
                {s.approvalStatus === "REJECTED" && s.rejectionReason ? (
                  <p className="mt-0.5 text-xs text-red-600">Alasan: {s.rejectionReason}</p>
                ) : null}
                {s.submittedAt ? (
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    Diajukan {new Date(s.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                ) : null}
              </div>
              <ApprovalBadge status={s.approvalStatus} />
              <Link href={s.href} className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm hover:border-[#0A192F]">
                Buka
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
