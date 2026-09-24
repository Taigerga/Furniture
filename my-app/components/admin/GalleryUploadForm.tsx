"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { DropzoneInput } from "./DropzoneInput";

const inputCls =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-stone-500";

const CATEGORIES = ["produk", "workshop", "kantor", "proyek", "kegiatan"];

export function GalleryUploadForm({
  action,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3 rounded-[3px] border border-[#E2E8F0] bg-white p-5">
      <div>
        <label htmlFor="g-t" className="mb-1 block text-sm font-medium text-[#334155]">Judul foto</label>
        <input id="g-t" name="title" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="g-c" className="mb-1 block text-sm font-medium text-[#334155]">Kategori</label>
        <select id="g-c" name="category" className={inputCls}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <DropzoneInput id="g-i" name="image" label="Gambar (maks 2MB)" required maxFiles={1} />
      {state?.error ? (
        <p role="alert" className="rounded-[3px] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-[3px] bg-[#0A192F] px-5 py-2 text-sm font-medium text-white hover:bg-[#13233F] disabled:opacity-60">
        {pending ? "Mengunggah..." : "Upload Foto"}
      </button>
    </form>
  );
}

