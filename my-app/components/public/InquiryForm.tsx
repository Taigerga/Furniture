"use client";

import { useActionState } from "react";
import { createInquiryAction } from "@/lib/actions/inquiry";
import { CopyButton } from "@/shared/ui/CopyButton";
import { formatWaDisplay, mailtoLink, telLink, waLink } from "@/lib/wa";

const inputCls =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/25";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-[#DC2626]">
      {messages[0]}
    </p>
  );
}

export function InquiryForm({
  products,
  defaultProductId,
  whatsapp,
  phone,
  email,
}: {
  products: { id: string; name: string }[];
  defaultProductId?: string;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  const [state, action, pending] = useActionState(createInquiryAction, undefined);

  if (state?.ok) {
    const waHref = waLink(whatsapp, state.waText);
    const telHref = telLink(phone);
    const mailHref = mailtoLink(email);
    return (
      <div className="rounded-[3px] border border-[#BFDBFE] bg-[#DBEAFE] p-6" role="status">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0063CE]">INQUIRY / TERKIRIM</p>
        <h3 className="mt-1 text-xl font-extrabold tracking-tight text-[#0A192F]">Inquiry terkirim</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#334155]">
          Terima kasih. Tim kami akan menghubungi Anda maksimal 1×24 jam pada jam operasional.
        </p>

        {/* Readback: pelanggan bisa memverifikasi sebelum melanjutkan. */}
        <dl className="mt-4 grid gap-x-4 gap-y-1.5 border-y border-[#BFDBFE] py-3 text-sm sm:grid-cols-2">
          {[
            ["Nama", state.summary.name],
            ["WhatsApp", formatWaDisplay(state.summary.whatsapp)],
            ["Email", state.summary.email],
            ["Produk", state.summary.product ?? "Pertanyaan umum"],
            ["Jumlah", `${state.summary.quantity} pcs`],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 sm:block">
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#0063CE] sm:mb-0.5">{k}</dt>
              <dd className="font-semibold text-[#0A192F]">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-sm font-semibold text-[#0A192F]">
          Lanjut chats langsung agar kami bisa mencapai Anda lebih cepat.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center justify-center rounded-[3px] bg-[#0A192F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#13233F] active:translate-y-[1px]"
            >
              Lanjut via WhatsApp
            </a>
          ) : null}
          {telHref ? (
            <a
              href={telHref}
              className="inline-flex min-h-[40px] items-center justify-center rounded-[3px] border border-[#0A192F] px-5 py-2.5 text-sm font-semibold text-[#0A192F] transition hover:bg-white/60"
            >
              Telepon {phone?.trim()}
            </a>
          ) : null}
          {mailHref ? (
            <a
              href={mailHref}
              className="inline-flex min-h-[40px] items-center justify-center rounded-[3px] border border-[#0A192F] px-5 py-2.5 text-sm font-semibold text-[#0A192F] transition hover:bg-white/60"
            >
              Email
            </a>
          ) : null}
          <CopyButton
            text={state.waText}
            label="Salin pesan"
            copiedLabel="Pesan tersalin"
            className="bg-white/60"
          />
        </div>

        {waHref ? null : (
          <p className="mt-3 text-xs text-[#334155]">
            Nomor WhatsApp perusahaan belum tersedia, jadi pesan di atas bisa Anda salin dan kirim sendiri lewat
            WhatsApp.
          </p>
        )}
      </div>
    );
  }

  const fe = !state || state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="space-y-4">
      {defaultProductId ? <input type="hidden" name="productId" value={defaultProductId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-name" className="mb-1 block text-sm font-semibold text-[#0F172A]">
            Nama
          </label>
          <input id="inq-name" name="name" required minLength={2} autoComplete="name" className={inputCls} />
          <FieldError messages={fe?.name} />
        </div>
        <div>
          <label htmlFor="inq-wa" className="mb-1 block text-sm font-medium text-[#334155]">
            Nomor WhatsApp
          </label>
          <input
            id="inq-wa"
            name="whatsapp"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="Contoh: 0812-3456-7890"
            className={inputCls}
          />
          <FieldError messages={fe?.whatsapp} />
        </div>
      </div>
      <div>
        <label htmlFor="inq-email" className="mb-1 block text-sm font-medium text-[#334155]">
          Email
        </label>
        <input id="inq-email" name="email" type="email" required autoComplete="email" className={inputCls} />
        <FieldError messages={fe?.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {!defaultProductId ? (
          <div>
            <label htmlFor="inq-product" className="mb-1 block text-sm font-medium text-[#334155]">
              Produk (opsional)
            </label>
            <select id="inq-product" name="productId" defaultValue="" className={inputCls}>
              <option value="">Pertanyaan umum</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="inq-qty" className="mb-1 block text-sm font-medium text-[#334155]">
            Jumlah
          </label>
          <input id="inq-qty" name="quantity" type="number" min={1} defaultValue={1} required className={inputCls} />
          <FieldError messages={fe?.quantity} />
        </div>
      </div>
      <div>
        <label htmlFor="inq-msg" className="mb-1 block text-sm font-medium text-[#334155]">
          Pesan
        </label>
        <textarea id="inq-msg" name="message" required minLength={5} rows={4} className={inputCls} />
        <FieldError messages={fe?.message} />
      </div>
      {state && !state.ok ? (
        <p role="alert" className="rounded-[3px] border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#7F1D1D]">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[3px] bg-[#0A192F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#13233F] active:translate-y-[1px] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {pending ? "Mengirim..." : "Kirim Inquiry"}
      </button>
    </form>
  );
}
