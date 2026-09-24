"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

const inputCls =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/25";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[#0F172A]">
          Email
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-[#0F172A]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className={inputCls}
        />
      </div>
      {state?.error ? (
        <p role="alert" className="rounded-[3px] border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#7F1D1D]">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="min-h-[44px] w-full rounded-[3px] bg-[#0A192F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#13233F] active:translate-y-[1px] disabled:opacity-60"
      >
        {pending ? "Memeriksa..." : "Masuk Dashboard"}
      </button>
    </form>
  );
}
