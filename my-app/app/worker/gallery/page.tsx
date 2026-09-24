import type { Metadata } from "next";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { workerListGallery } from "@/services/worker.service";
import { createWorkerGallery, updateWorkerGallery, deleteWorkerGallery, submitWorkerGallery } from "@/lib/actions/worker-gallery";
import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ApprovalBadge } from "@/components/worker/WorkerBits";
import { uploadUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Galeri Saya" };

export default async function WorkerGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await workerListGallery(session!.user.id, page);

  return (
    <div>
      <PageHeader title="Galeri Saya" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section aria-label="Upload foto">
          <h2 className="mb-3 text-sm font-medium text-[#334155]">Upload Foto (jadi draf)</h2>
          <GalleryUploadForm action={createWorkerGallery} />
        </section>
        <section aria-label="Daftar foto">
          <h2 className="mb-3 text-sm font-medium text-[#334155]">Foto saya</h2>
          {items.length === 0 ? (
            <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
              Belum ada foto.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {items.map((g) => (
                <li key={g.id} className="overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-white">
                  <span className="relative block aspect-[4/3] bg-[#F4F5F7]">
                    <Image src={uploadUrl(g.url)} alt={g.title} fill loading="lazy" sizes="25vw" className="object-cover" />
                  </span>
                  <div className="space-y-1.5 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{g.title}</p>
                      <ApprovalBadge status={g.approvalStatus} />
                    </div>
                    {g.approvalStatus === "PENDING" && g.pendingTitle && g.pendingTitle !== g.title ? (
                      <p className="truncate text-xs text-amber-700">Revisi menunggu: {g.pendingTitle}</p>
                    ) : null}
                    {g.approvalStatus === "REJECTED" && g.rejectionReason ? (
                      <p className="text-xs text-red-600">Alasan: {g.rejectionReason}</p>
                    ) : null}
                    {g.approvalStatus !== "PENDING" ? (
                      <form action={updateWorkerGallery.bind(null, g.id)} className="flex gap-1.5">
                        <label className="sr-only" htmlFor={`wt-${g.id}`}>Judul</label>
                        <input id={`wt-${g.id}`} name="title" defaultValue={g.title} className="w-full rounded-[3px] border border-[#E2E8F0] px-2 py-1 text-sm" />
                        <input type="hidden" name="category" value={g.category} />
                        <button type="submit" className="shrink-0 rounded-[3px] border border-[#CBD5E1] px-2.5 py-1 text-xs hover:border-[#0A192F]">
                          Simpan
                        </button>
                      </form>
                    ) : null}
                    <div className="flex gap-1.5">
                      {(g.approvalStatus === "DRAFT" || g.approvalStatus === "REJECTED") && (
                        <form action={submitWorkerGallery.bind(null, g.id)} className="flex-1">
                          <button type="submit" className="w-full rounded-[3px] bg-[#0A192F] px-2 py-1 text-xs font-medium text-white hover:bg-[#0A192F]">
                            Ajukan
                          </button>
                        </form>
                      )}
                      {(g.approvalStatus === "DRAFT" || g.approvalStatus === "REJECTED") && (
                        <form action={deleteWorkerGallery.bind(null, g.id)} className="flex-1">
                          <DeleteButton label="Hapus" confirmText="Hapus?" />
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <AdminPagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `/worker/gallery?page=${n}` : "/worker/gallery")} />
        </section>
      </div>
    </div>
  );
}
