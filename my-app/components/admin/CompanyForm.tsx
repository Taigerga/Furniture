"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";
import { formatWaDisplay, telLink, waLinkPlain } from "@/lib/wa";

const inputCls =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/25";
const labelCls = "mb-1 block text-sm font-semibold text-[#0F172A]";
const hintCls = "mt-1 text-xs leading-relaxed text-[#64748B]";

type Field = { key: string; label: string; type?: "text" | "textarea"; hint?: string; inputMode?: "decimal" | "tel" };

const SECTIONS: { title: string; code: string; fields: Field[] }[] = [
  {
    title: "Identitas",
    code: "PROFILE / 01",
    fields: [
      { key: "name", label: "Nama perusahaan" },
      { key: "tagline", label: "Tagline" },
      { key: "description", label: "Deskripsi", type: "textarea" },
      { key: "history", label: "Sejarah", type: "textarea" },
      { key: "vision", label: "Visi", type: "textarea" },
      { key: "mission", label: "Misi", type: "textarea" },
    ],
  },
  {
    title: "Kontak",
    code: "CONTACT / 02",
    fields: [
      {
        key: "whatsapp",
        label: "WhatsApp",
        inputMode: "tel",
        hint: "Isi nomor saja format internasional, TANPA '+' dan TANPA nol di depan. Contoh: 628121730722. Sistem menormalkan otomatis jika Anda mengetik 0821… atau +62821…",
      },
      {
        key: "phone",
        label: "Telepon / HP",
        inputMode: "tel",
        hint: "Bebas format tampilan, mis. 0821 2173 0722 atau 021-21730722. Dipakai untuk tautan telepon.",
      },
      { key: "email", label: "Email" },
      { key: "hours", label: "Jam operasional" },
    ],
  },
  {
    title: "Lokasi",
    code: "LOCATION / 03",
    fields: [
      { key: "address", label: "Alamat", type: "textarea" },
      { key: "latitude", label: "Latitude (cth: -6.5886)", inputMode: "decimal", hint: "Klik kanan titik di Google Maps → salin angka pertama. Kosongkan untuk menyembunyikan peta." },
      { key: "longitude", label: "Longitude (cth: 110.6698)", inputMode: "decimal" },
      { key: "mapsUrl", label: "URL Google Maps" },
    ],
  },
  {
    title: "Media Sosial",
    code: "SOCIAL / 04",
    fields: [
      { key: "instagram", label: "Instagram" },
      { key: "facebook", label: "Facebook" },
      { key: "linkedin", label: "LinkedIn" },
    ],
  },
];

/** Pratinjau tautan yang akan dipakai seluruh website. */
function LinkPreview({ wa, phone }: { wa: string; phone: string }) {
  const link = waLinkPlain(wa);
  const tel = telLink(phone);

  if (!wa.trim() && !phone.trim()) {
    return (
      <p className="rounded-[3px] border border-dashed border-[#CBD5E1] bg-[#F4F5F7] px-3 py-2 text-xs text-[#64748B]">
        Isi nomor WhatsApp atau telepon untuk melihat pratinjau tautannya.
      </p>
    );
  }

  return (
    <div className="space-y-1.5 rounded-[3px] border border-[#E2E8F0] bg-[#F4F5F7] p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Pratinjau tautan</p>
      {wa.trim() ? (
        link ? (
          <p className="text-xs text-[#334155]">
            WhatsApp tampil:{" "}
            <span className="font-semibold text-[#0F172A]">{formatWaDisplay(wa)}</span>
            <br />
            <span className="font-mono text-[11px] text-[#64748B]">{link}</span>
          </p>
        ) : (
          <p className="text-xs text-[#DC2626]">
            Nomor WhatsApp tidak valid — tautan WhatsApp akan dimatikan di website sampai diperbaiki.
          </p>
        )
      ) : null}
      {phone.trim() ? (
        tel ? (
          <p className="text-xs text-[#334155]">
            Telepon:{" "}
            <span className="font-semibold text-[#0F172A]">{phone.trim()}</span>
            <br />
            <span className="font-mono text-[11px] text-[#64748B]">{tel}</span>
          </p>
        ) : (
          <p className="text-xs text-[#DC2626]">Nomor telepon tidak valid.</p>
        )
      ) : null}
    </div>
  );
}

export function CompanyForm({
  action,
  defaults,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  defaults: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = (k: string) => state?.values?.[k] ?? defaults[k] ?? "";
  // Hanya dua field kontak yang butuh pratinjau langsung; sisanya tetap uncontrolled.
  const [wa, setWa] = useState(v("whatsapp"));
  const [phone, setPhone] = useState(v("phone"));

  return (
    <form action={formAction} className="space-y-6 rounded-[3px] border border-[#E2E8F0] bg-white p-6">
      <div>
        <h2 className="font-extrabold tracking-tight text-[#0F172A]">Profil Perusahaan</h2>
        <p className="mt-0.5 text-xs text-[#64748B]">Informasi yang tampil di website publik.</p>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.code} className="border-t border-[#E2E8F0] pt-5" aria-label={section.title}>
          <div className="mb-3 border-b-2 border-[#0A192F] pb-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0063CE]">{section.code}</p>
            <h3 className="text-sm font-bold text-[#0F172A]">{section.title}</h3>
          </div>
          <div className="space-y-4">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label htmlFor={`cp-${f.key}`} className={labelCls}>{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea id={`cp-${f.key}`} name={f.key} rows={3} defaultValue={v(f.key)} className={inputCls} />
                ) : f.key === "whatsapp" ? (
                  <input
                    id="cp-whatsapp"
                    name="whatsapp"
                    defaultValue={v("whatsapp")}
                    inputMode="tel"
                    onChange={(e) => setWa(e.target.value)}
                    className={inputCls}
                  />
                ) : f.key === "phone" ? (
                  <input
                    id="cp-phone"
                    name="phone"
                    defaultValue={v("phone")}
                    inputMode="tel"
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                  />
                ) : (
                  <input id={`cp-${f.key}`} name={f.key} defaultValue={v(f.key)} inputMode={f.inputMode} className={inputCls} />
                )}
                {f.hint ? <p className={hintCls}>{f.hint}</p> : null}
                {state?.fieldErrors?.[f.key] ? (
                  <p role="alert" className="mt-1 text-sm text-[#DC2626]">{state.fieldErrors[f.key][0]}</p>
                ) : null}
              </div>
            ))}
            {section.code === "CONTACT / 02" ? (
              <LinkPreview wa={wa} phone={phone} />
            ) : null}
          </div>
        </section>
      ))}

      <section className="border-t border-[#E2E8F0] pt-5" aria-label="Aset">
        <div className="mb-3 border-b-2 border-[#0A192F] pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0063CE]">ASSET / 05</p>
          <h3 className="text-sm font-bold text-[#0F172A]">Aset Visual</h3>
        </div>
        <div className="space-y-4">
          <DropzoneInput
            id="cp-logo"
            name="logo"
            label="Logo (opsional, maks 2MB)"
            maxFiles={1}
          />
          <div>
            <DropzoneInput
              id="cp-hero"
              name="hero"
              label="Foto Hero Beranda (opsional, maks 2MB)"
              maxFiles={1}
              hint="Foto workshop/showroom perusahaan. Kosongkan untuk memakai foto produk unggulan."
            />
            {defaults.heroImageUrl === "1" ? (
              <span className="mt-2 flex items-center gap-2 text-sm text-[#334155]">
                <input id="cp-remove-hero" name="removeHero" type="checkbox" className="h-4 w-4" />
                <label htmlFor="cp-remove-hero">Hapus foto hero saat ini (kembali ke foto produk)</label>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {state?.error ? (
        <p role="alert" className="rounded-[3px] border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#7F1D1D]">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-[3px] bg-[#0A192F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#13233F] disabled:opacity-60">
        {pending ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </form>
  );
}
