import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-[3px] px-4 py-2 text-sm font-semibold transition active:translate-y-[1px] disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007BFF] min-h-[40px]";

const variants: Record<Variant, string> = {
  primary: "bg-[#0A192F] text-white hover:bg-[#13233F]",
  secondary: "border border-[#CBD5E1] bg-white text-[#0A192F] hover:border-[#0A192F]",
  danger: "border border-[#FECACA] bg-white text-[#DC2626] hover:bg-[#FEE2E2]",
  ghost: "text-[#0A192F] hover:bg-[#E2E8F0]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
