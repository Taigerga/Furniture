export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const map = {
    info: "border-[#BFDBFE] bg-[#DBEAFE] text-[#0A192F]",
    success: "border-[#BBF7D0] bg-[#DCFCE7] text-[#0A192F]",
    warning: "border-[#FDE68A] bg-[#FEF3C7] text-[#0A192F]",
    error: "border-[#FECACA] bg-[#FEE2E2] text-[#7F1D1D]",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-[3px] border px-3 py-2 text-sm ${map[tone]}`}>
      {children}
    </p>
  );
}

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="rounded-[3px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center">
      <p className="tech-label text-[#00B4D8]">EMPTY / 00</p>
      <p className="mt-2 text-sm font-semibold text-[#0F172A]">{title}</p>
      {desc ? <p className="mt-1 text-sm text-[#64748B]">{desc}</p> : null}
    </div>
  );
}
