const TONE: Record<string, string> = {
  ACTIVE: "bg-[#DBEAFE] text-[#0063CE] border-[#BFDBFE]",
  SUCCESS: "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]",
  PENDING: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
  WARNING: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
  INACTIVE: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
  ERROR: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  INFO: "bg-[#DBEAFE] text-[#0063CE] border-[#BFDBFE]",
  DRAFT: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
  APPROVED: "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]",
  REJECTED: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

export function Badge({ status, children }: { status: string; children?: React.ReactNode }) {
  const key = status.toUpperCase();
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${TONE[key] ?? "bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]"}`}
    >
      {children ?? status}
    </span>
  );
}
