"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/helpers";
import { updateAccountAction, changePasswordAction } from "@/lib/actions/account";

const inputCls =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-stone-500";
const labelCls = "mb-1 block text-sm font-medium text-[#334155]";

function FormError({ state }: { state: ActionState | undefined }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-[3px] bg-[#FEE2E2] px-3 py-2 text-sm text-[#DC2626]">
      {state.error}
    </p>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-[#DC2626]">
      {messages[0]}
    </p>
  );
}

function ProfileForm({ user, redirectTo }: { user: { name: string | null; email: string }; redirectTo: string }) {
  const [state, action, pending] = useActionState(updateAccountAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div>
        <label htmlFor="ac-name" className={labelCls}>Nama admin</label>
        <input id="ac-name" name="name" required defaultValue={state?.values?.name ?? user.name ?? ""} className={inputCls} />
        <FieldError messages={state?.fieldErrors?.name} />
      </div>
      <div>
        <label htmlFor="ac-email" className={labelCls}>Email login</label>
        <input id="ac-email" name="email" type="email" required defaultValue={state?.values?.email ?? user.email} className={inputCls} />
        <FieldError messages={state?.fieldErrors?.email} />
        <p className="mt-1 text-xs text-[#64748B]">Mengganti email akan mengeluarkan Anda dan meminta login ulang.</p>
      </div>
      <FormError state={state} />
      <button type="submit" disabled={pending} className="rounded-[3px] bg-[#0A192F] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#13233F] disabled:opacity-60">
        {pending ? "Menyimpan..." : "Simpan Akun"}
      </button>
    </form>
  );
}

function PasswordForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);
  return (
    <form action={action} className="space-y-3 border-t border-[#E2E8F0] pt-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <h3 className="text-sm font-medium text-[#0F172A]">Ganti Password</h3>
      <div>
        <label htmlFor="pw-cur" className={labelCls}>Password saat ini</label>
        <input id="pw-cur" name="currentPassword" type="password" required autoComplete="current-password" className={inputCls} />
      </div>
      <div>
        <label htmlFor="pw-new" className={labelCls}>Password baru (min 8 karakter)</label>
        <input id="pw-new" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={inputCls} />
        <FieldError messages={state?.fieldErrors?.newPassword} />
      </div>
      <div>
        <label htmlFor="pw-conf" className={labelCls}>Konfirmasi password baru</label>
        <input id="pw-conf" name="confirmPassword" type="password" required autoComplete="new-password" className={inputCls} />
        <FieldError messages={state?.fieldErrors?.confirmPassword} />
      </div>
      <FormError state={state} />
      <button type="submit" disabled={pending} className="rounded-[3px] bg-[#0A192F] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#13233F] disabled:opacity-60">
        {pending ? "Menyimpan..." : "Ganti Password"}
      </button>
    </form>
  );
}

export function AccountForm({ user, redirectTo = "/admin/company-profile" }: { user: { name: string | null; email: string }; redirectTo?: string }) {
  return (
    <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-5" aria-label="Profil akun">
      <h2 className="font-medium text-[#0F172A]">Profil Akun</h2>
      <p className="mb-4 mt-0.5 text-xs text-[#64748B]">Kredensial login dashboard.</p>
      <ProfileForm user={user} redirectTo={redirectTo} />
      <div className="mt-2">
        <PasswordForm redirectTo={redirectTo} />
      </div>
    </section>
  );
}
