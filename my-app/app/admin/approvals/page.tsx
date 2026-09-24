import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getApprovalQueue, approveSubmission, rejectSubmission } from "@/lib/actions/approvals";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { uploadUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Approval Pengajuan" };

const TABS = [
  { key: "products", label: "Produk" },
  { key: "articles", label: "Artikel" },
  { key: "gallery", label: "Galeri" },
  { key: "categories", label: "Kategori" },
] as const;

function dateFmt(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Tampilkan perubahan revisi sebagai "lama → baru"; baris tak berubah disembunyikan. */
function RevisionDiff({ pairs }: { pairs: { label: string; from?: string | null; to?: string | null }[] }) {
  const changed = pairs.filter((p) => (p.to ?? null) !== (p.from ?? null) && p.to != null);
  if (changed.length === 0) {
    return <p className="mt-2 text-xs text-[#64748B]">Pengajuan baru (belum ada versi tayang yang diubah).</p>;
  }
  return (
    <dl className="mt-2 space-y-1 rounded-[3px] bg-[#F4F5F7] px-3 py-2 text-xs">
      {changed.map((p) => (
        <div key={p.label} className="flex flex-wrap gap-x-2">
          <dt className="text-[#64748B]">{p.label}:</dt>
          <dd className="text-[#64748B] line-through">{p.from ?? "—"}</dd>
          <dd aria-hidden>→</dd>
          <dd className="font-medium text-[#0A192F]">{p.to}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "articles" || sp.tab === "gallery" || sp.tab === "categories" ? sp.tab : "products";
  const queue = await getApprovalQueue();

  return (
    <div>
      <PageHeader title={`Approval Pengajuan (${queue.total} menunggu)`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <div className="mb-4 flex gap-2" role="tablist" aria-label="Jenis pengajuan">
        {TABS.map((t) => {
          const count =
            t.key === "products" ? queue.products.length
            : t.key === "articles" ? queue.articles.length
            : t.key === "gallery" ? queue.galleries.length
            : queue.categories.length;
          return (
            <Link
              key={t.key}
              href={`/admin/approvals?tab=${t.key}`}
              role="tab"
              aria-selected={tab === t.key}
              className={`rounded-[3px] px-4 py-1.5 text-sm transition ${tab === t.key ? "bg-[#0A192F] font-medium text-white" : "border border-[#CBD5E1] text-[#334155] hover:border-[#0A192F]"}`}
            >
              {t.label} ({count})
            </Link>
          );
        })}
      </div>

      {queue.total === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
          Antrean kosong. Semua pengajuan sudah direview.
        </p>
      ) : null}

      {tab === "products" && (
        <ul className="space-y-2">
          {queue.products.map((p) => (
            <li key={p.id} className="rounded-[3px] border border-[#E2E8F0] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F172A]">{p.name}</p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {p.category.name} · {p._count.images} foto · oleh {p.createdBy.name ?? p.createdBy.email} · diajukan {dateFmt(p.submittedAt)}
                  </p>
                </div>
                <Link href={`/admin/products/${p.id}`} className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm hover:border-[#0A192F]">
                  Periksa Detail
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3">
                <form action={approveSubmission.bind(null, "product", p.id)}>
                  <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#0A192F]">
                    Setujui & Tayangkan
                  </button>
                </form>
                <form action={rejectSubmission.bind(null, "product", p.id)} className="flex flex-1 flex-wrap items-center gap-2">
                  <label htmlFor={`rej-p-${p.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-p-${p.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan penolakan (wajib)..."
                    className="min-w-52 flex-1 rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
                  />
                  <button type="submit" className="rounded-[3px] border border-[#FECACA] px-4 py-1.5 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "articles" && (
        <ul className="space-y-2">
          {queue.articles.map((a) => (
            <li key={a.id} className="rounded-[3px] border border-[#E2E8F0] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F172A]">{a.title}</p>
                  <p className="mt-0.5 truncate text-xs text-[#64748B]">
                    oleh {a.createdBy.name ?? a.createdBy.email} · diajukan {dateFmt(a.submittedAt)}
                  </p>
                  {a.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-[#334155]">{a.excerpt}</p> : null}
                  <RevisionDiff
                    pairs={[
                      { label: "Judul", from: a.title, to: a.pendingTitle },
                      { label: "Slug", from: a.slug, to: a.pendingSlug },
                      { label: "Ringkasan", from: a.excerpt, to: a.pendingExcerpt },
                      { label: "Konten", from: "versi tayang", to: a.pendingContent ? "versi revisi" : null },
                      { label: "Thumbnail", from: a.thumbnail ? "ada" : "tidak ada", to: a.pendingThumbnail ? "diganti" : null },
                    ]}
                  />
                </div>
                <Link href={`/admin/articles/${a.id}`} className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm hover:border-[#0A192F]">
                  Periksa Detail
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3">
                <form action={approveSubmission.bind(null, "article", a.id)}>
                  <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#0A192F]">
                    Setujui & Tayangkan
                  </button>
                </form>
                <form action={rejectSubmission.bind(null, "article", a.id)} className="flex flex-1 flex-wrap items-center gap-2">
                  <label htmlFor={`rej-a-${a.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-a-${a.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan penolakan (wajib)..."
                    className="min-w-52 flex-1 rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
                  />
                  <button type="submit" className="rounded-[3px] border border-[#FECACA] px-4 py-1.5 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "gallery" && (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {queue.galleries.map((g) => (
            <li key={g.id} className="overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-white">
              <span className="relative block aspect-[4/3] bg-[#F4F5F7]">
                <Image src={uploadUrl(g.url)} alt={g.title} fill loading="lazy" sizes="30vw" className="object-cover" />
              </span>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-[#0F172A]">{g.title}</p>
                <p className="mt-0.5 text-xs text-[#64748B]">
                  {g.category} · oleh {g.createdBy.name ?? g.createdBy.email} · {dateFmt(g.submittedAt)}
                </p>
                <RevisionDiff
                  pairs={[
                    { label: "Judul", from: g.title, to: g.pendingTitle },
                    { label: "Kategori", from: g.category, to: g.pendingCategory },
                  ]}
                />
                <div className="mt-2 flex gap-1.5">
                  <form action={approveSubmission.bind(null, "gallery", g.id)} className="flex-1">
                    <button type="submit" className="w-full rounded-[3px] bg-[#0A192F] px-2 py-1.5 text-xs font-medium text-white hover:bg-[#0A192F]">
                      Setujui
                    </button>
                  </form>
                </div>
                <form action={rejectSubmission.bind(null, "gallery", g.id)} className="mt-1.5 flex gap-1.5">
                  <label htmlFor={`rej-g-${g.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-g-${g.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan tolak..."
                    className="min-w-0 flex-1 rounded-[3px] border border-[#CBD5E1] px-2 py-1.5 text-xs outline-none focus:border-red-400"
                  />
                  <button type="submit" className="shrink-0 rounded-[3px] border border-[#FECACA] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-[#FEE2E2]">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "categories" && (
        <ul className="space-y-2">
          {queue.categories.map((c) => (
            <li key={c.id} className="rounded-[3px] border border-[#E2E8F0] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[#0F172A]">{c.name}</p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    /{c.slug} · {c._count.products} produk · oleh {c.createdBy.name ?? c.createdBy.email} · diajukan {dateFmt(c.submittedAt)}
                  </p>
                  {c.description ? <p className="mt-1 line-clamp-2 text-sm text-[#334155]">{c.description}</p> : null}
                  <RevisionDiff
                    pairs={[
                      { label: "Nama", from: c.name, to: c.pendingName },
                      { label: "Slug", from: c.slug, to: c.pendingSlug },
                      { label: "Deskripsi", from: c.description, to: c.pendingDescription },
                    ]}
                  />
                </div>
                <Link href="/admin/categories" className="rounded-[3px] border border-[#CBD5E1] px-3 py-1.5 text-sm hover:border-[#0A192F]">
                  Lihat Kategori
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-3">
                <form action={approveSubmission.bind(null, "category", c.id)}>
                  <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#0A192F]">
                    Setujui & Tayangkan
                  </button>
                </form>
                <form action={rejectSubmission.bind(null, "category", c.id)} className="flex flex-1 flex-wrap items-center gap-2">
                  <label htmlFor={`rej-c-${c.id}`} className="sr-only">Alasan penolakan</label>
                  <input
                    id={`rej-c-${c.id}`}
                    name="reason"
                    required
                    minLength={5}
                    placeholder="Alasan penolakan (wajib)..."
                    className="min-w-52 flex-1 rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-1.5 text-sm outline-none focus:border-red-400"
                  />
                  <button type="submit" className="rounded-[3px] border border-[#FECACA] px-4 py-1.5 text-sm font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]">
                    Tolak
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
