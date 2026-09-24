import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  accent = false,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[3px] border border-[#E2E8F0] bg-white ${accent ? "border-t-2 border-t-[#007BFF]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
