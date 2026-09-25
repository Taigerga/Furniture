import type { Metadata } from "next";
import Link from "next/link";
import { adminListInquiries } from "@/services/admin.service";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { getCompanyProfile } from "@/services/public.service";
import { buildAdminReplyText, formatWaDisplay, waLink } from "@/lib/wa";

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-[#DBEAFE] text-[#0063CE] border-[#BFDBFE]",
  CONTACTED: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
  PROCESSING: "bg-[#DBEAFE] text-[#0063CE] border-[#BFDBFE]",
  COMPLETED: "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]",
  CANCELLED: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
};

export const metadata: Metadata = { title: "Kelola Inquiry" };

const STATUSES = ["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
const STATUS_LABEL: Record<string, string> = {
  NEW: "Baru",
  CONTACTED: "Dihubungi",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Batal",
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; msg?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items, totalPages } = await adminListInquiries({
    status: status || undefined,
    q: q || undefined,
    page,
  });

  let companyName = "Tim kami";
  let companyPhone: string | null = null;
  try {
    const company = await getCompanyProfile();
    if (company?.name) companyName = company.name;
    companyPhone = company?.phone ?? null;
  } catch {
    /* pakai nama cadangan */
  }

  const href = (n: number) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return `/admin/inquiries${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <PageHeader title="Inquiry Pelanggan" />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <form action="/admin/inquiries" method="get" className="mb-4 flex flex-wrap gap-2">
        <label htmlFor="iq" className="sr-only">Cari inquiry</label>
        <input
          id="iq"
          name="q"
          defaultValue={q}
          placeholder="Cari nama / email / WA..."
          className="w-full max-w-xs rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
        <label htmlFor="is" className="sr-only">Filter status</label>
        <select id="is" name="status" defaultValue={status} className="rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm">
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-medium text-white">Filter</button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]" role="status">
          Tidak ada inquiry yang cocok.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((inq) => {
            const quickWa = waLink(
              inq.whatsapp,
              buildAdminReplyText(
                {
                  name: inq.name,
                  email: inq.email,
                  whatsapp: inq.whatsapp,
                  quantity: inq.quantity,
                  message: inq.message,
                  productName: inq.product?.name ?? null,
                  createdAt: inq.createdAt,
                },
                { companyName, companyPhone },
              ),
            );
            return (
              <li
                key={inq.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[3px] border border-[#E2E8F0] bg-white p-3 transition hover:border-[#CBD5E1]"
              >
                <Link href={`/admin/inquiries/${inq.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0A192F] hover:underline">{inq.name}</p>
                  <p className="mt-0.5 truncate text-xs text-[#64748B]">
                    {inq.product?.name ?? "Pertanyaan umum"} · {inq.quantity} pcs ·{" "}
                    <span className="font-mono">{formatWaDisplay(inq.whatsapp)}</span> ·{" "}
                    {new Date(inq.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold ${
                      STATUS_TONE[inq.status] ?? "bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]"
                    }`}
                  >
                    {STATUS_LABEL[inq.status]}
                  </span>
                  {quickWa ? (
                    <a
                      href={quickWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Balas ${inq.name} via WhatsApp`}
                      className="rounded-[3px] bg-[#0A192F] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#13233F]"
                    >
                      Balas WA
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <AdminPagination page={page} totalPages={totalPages} href={href} />
    </div>
  );
}
