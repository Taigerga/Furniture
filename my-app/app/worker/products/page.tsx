import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { workerListProducts } from "@/services/worker.service";
import { deleteWorkerProduct, submitWorkerProduct } from "@/lib/actions/worker-products";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ApprovalBadge } from "@/components/worker/WorkerBits";

export const metadata: Metadata = { title: "Produk Saya" };

export default async function WorkerProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await workerListProducts(session!.user.id, page);

  return (
    <div>
      <PageHeader title="Produk Saya" actionHref="/worker/products/new" actionLabel="Tambah Produk" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <p className="mb-4 text-sm text-[#64748B]">
        Produk terbit di publik setelah disetujui admin. Mengubah produk tayang akan menurunkannya sementara.
      </p>
      {items.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
          Belum ada produk. Klik Tambah Produk untuk membuat yang pertama.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[3px] border border-[#E2E8F0] bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[#0F172A]">{p.name}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {p.category.name} · {p._count.images} foto
                </p>
                {p.approvalStatus === "REJECTED" && p.rejectionReason ? (
                  <p className="mt-1 text-xs text-red-600">Alasan ditolak: {p.rejectionReason}</p>
                ) : null}
              </div>
              <ApprovalBadge status={p.approvalStatus} />
              {(p.approvalStatus === "DRAFT" || p.approvalStatus === "REJECTED") && (
                <form action={submitWorkerProduct.bind(null, p.id)}>
                  <button type="submit" className="rounded-[3px] bg-[#0A192F] px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-[#0A192F]">
                    Ajukan Review
                  </button>
                </form>
              )}
              <Link href={`/worker/products/${p.id}`} className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm hover:border-[#0A192F]">
                {p.approvalStatus === "PENDING" ? "Lihat" : "Edit"}
              </Link>
              {(p.approvalStatus === "DRAFT" || p.approvalStatus === "REJECTED") && (
                <form action={deleteWorkerProduct.bind(null, p.id)}>
                  <DeleteButton confirmText="Hapus produk ini?" />
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `/worker/products?page=${n}` : "/worker/products")} />
    </div>
  );
}
