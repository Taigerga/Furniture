"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";

const inputCls =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-stone-500";

export function CategoryForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  defaults?: Record<string, string>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const v = (k: string) => state?.values?.[k] ?? defaults?.[k] ?? "";

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-[3px] border border-[#E2E8F0] bg-white p-6">
      <div>
        <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-[#334155]">Nama kategori</label>
        <input id="cf-name" name="name" required defaultValue={v("name")} className={inputCls} />
        {state?.fieldErrors?.name ? <p role="alert" className="mt-1 text-sm text-[#DC2626]">{state.fieldErrors.name[0]}</p> : null}
      </div>
      <div>
        <label htmlFor="cf-slug" className="mb-1 block text-sm font-medium text-[#334155]">Slug</label>
        <input id="cf-slug" name="slug" required defaultValue={v("slug")} placeholder="kursi" className={inputCls} />
        {state?.fieldErrors?.slug ? <p role="alert" className="mt-1 text-sm text-[#DC2626]">{state.fieldErrors.slug[0]}</p> : null}
      </div>
      <div>
        <label htmlFor="cf-desc" className="mb-1 block text-sm font-medium text-[#334155]">Deskripsi</label>
        <textarea id="cf-desc" name="description" rows={3} defaultValue={v("description")} className={inputCls} />
      </div>
      {state?.error ? (
        <p role="alert" className="rounded-[3px] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="rounded-[3px] bg-[#0A192F] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#13233F] disabled:opacity-60">
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
