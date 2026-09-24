import type { Metadata } from "next";
import Link from "next/link";
import { adminListCategories } from "@/services/admin.service";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ApprovalBadge, draftLock, DraftLockNote } from "@/components/worker/WorkerBits";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Kelola Kategori" };

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const meId = session!.user.id;
  const items = await adminListCategories();

  return (
    <div>
      <PageHeader title="Kategori" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section aria-label="Tambah kategori">
          <h2 className="mb-3 text-sm font-medium text-[#334155]">Tambah Kategori</h2>
          <CategoryForm action={createCategoryAction} submitLabel="Simpan Kategori" />
        </section>
        <section aria-label="Daftar kategori">
          <h2 className="mb-3 text-sm font-medium text-[#334155]">Daftar ({items.length})</h2>
          {items.length === 0 ? (
            <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
              Belum ada kategori.
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((c) => {
                const lock = draftLock(c, meId);
                return (
                <li key={c.id} className="rounded-[3px] border border-[#E2E8F0] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#0F172A]">
                        {c.name}
                        <span className="ml-2"><ApprovalBadge status={c.approvalStatus} /></span>
                      </p>
                      <p className="text-xs text-[#64748B]">/{c.slug} · {c._count.products} produk · oleh {c.createdBy.name ?? c.createdBy.email}</p>
                      {c.approvalStatus === "PENDING" && c.pendingName && c.pendingName !== c.name ? (
                        <p className="mt-0.5 text-xs text-amber-700">Revisi menunggu: {c.pendingName}</p>
                      ) : null}
                      {lock.locked ? <div className="mt-1"><DraftLockNote ownerName={lock.ownerName} orphan={lock.orphan} /></div> : null}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {c.approvalStatus === "PENDING" ? (
                        <Link href="/admin/approvals?tab=categories" className="rounded-[3px] bg-[#0A192F] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#0A192F]">
                          Review
                        </Link>
                      ) : null}
                      {!lock.locked || lock.orphan ? (
                      <form action={deleteCategoryAction.bind(null, c.id)}>
                        <DeleteButton confirmText="Hapus kategori ini?" />
                      </form>
                      ) : null}
                    </div>
                  </div>
                  {!lock.locked ? (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-[#64748B] hover:text-[#0F172A]">Edit</summary>
                    <div className="mt-2">
                      <CategoryForm
                        action={updateCategoryAction.bind(null, c.id)}
                        defaults={{ name: c.name, slug: c.slug, description: c.description ?? "" }}
                        submitLabel="Simpan Perubahan"
                      />
                    </div>
                  </details>
                  ) : null}
                </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
