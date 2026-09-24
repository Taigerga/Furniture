import type { Metadata } from "next";
import Link from "next/link";
import { adminListPortfolios } from "@/services/admin.service";
import { deletePortfolioAction } from "@/lib/actions/portfolios";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

export const metadata: Metadata = { title: "Kelola Portofolio" };

export default async function AdminPortfoliosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await adminListPortfolios({ page });

  return (
    <div>
      <PageHeader title="Portofolio" actionHref="/admin/portfolios/new" actionLabel="Tambah Proyek" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      {items.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
          Belum ada portofolio.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[3px] border border-[#E2E8F0] bg-white p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[#0F172A]">
                  {p.title}
                  {p.featured ? <span className="ml-2 rounded-[3px] bg-[#DBEAFE] px-2 py-0.5 text-xs text-[#0A192F]">Unggulan</span> : null}
                </p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {[p.client, p.year ? String(p.year) : null].filter(Boolean).join(" · ") || "—"} · {p._count.images} foto
                </p>
              </div>
              <Link href={`/admin/portfolios/${p.id}`} className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm hover:border-[#0A192F]">
                Edit
              </Link>
              <form action={deletePortfolioAction.bind(null, p.id)}>
                <DeleteButton confirmText="Hapus proyek ini beserta fotonya?" />
              </form>
            </li>
          ))}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={(n) => (n > 1 ? `/admin/portfolios?page=${n}` : "/admin/portfolios")} />
    </div>
  );
}
