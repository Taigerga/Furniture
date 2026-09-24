const TONE: Record<string, string> = {
  DRAFT: "bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]",
  PENDING: "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]",
  APPROVED: "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]",
  REJECTED: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

const LABEL: Record<string, string> = {
  DRAFT: "Draf",
  PENDING: "Pending",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

/** Badge status approval. Render hanya bila status bukan APPROVED (kondisi normal tanpa label). */
export function ApprovalBadge({ status }: { status: string }) {
  if (status === "APPROVED") return null;
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${TONE[status] ?? "bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]"}`}
    >
      {LABEL[status] ?? status}
    </span>
  );
}

export type LockInfo = { locked: boolean; orphan: boolean; ownerName: string };

/** DRAF milik orang lain terkunci dari admin. Draf yatim (pembuat nonaktif) boleh dihapus. */
export function draftLock(
  row: { createdById: string; approvalStatus: string; createdBy: { name: string | null; email: string; isActive: boolean } },
  meId: string,
): LockInfo {
  const locked = row.createdById !== meId && row.approvalStatus === "DRAFT";
  return {
    locked,
    orphan: locked && !row.createdBy.isActive,
    ownerName: row.createdBy.name ?? row.createdBy.email,
  };
}

export function DraftLockNote({ ownerName, orphan }: { ownerName: string; orphan: boolean }) {
  return (
    <p className="font-mono text-[11px] text-[#64748B]">
      Draf milik {ownerName}{orphan ? " (akun nonaktif — boleh dihapus)" : " — hanya pemilik yang boleh mengubah"}.
    </p>
  );
}
