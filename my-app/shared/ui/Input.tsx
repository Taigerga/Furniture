import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const inputBase =
  "w-full rounded-[3px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/25 disabled:bg-[#F4F5F7] disabled:text-[#64748B]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} min-h-[96px] ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-semibold text-[#0F172A]">
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-sm text-[#DC2626]">
      {message}
    </p>
  );
}
