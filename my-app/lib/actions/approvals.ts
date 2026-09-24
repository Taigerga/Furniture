"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { approveSubmission as apiApprove, getApprovalQueue as apiQueue, rejectSubmission as apiReject, type ApprovalQueue } from "@/lib/api/approvals";

const RejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan minimal 5 karakter.").max(2000),
});

export type ApprovalEntity = "product" | "article" | "gallery" | "category";

export async function approveSubmission(entity: ApprovalEntity, id: string) {
  try {
    const r = await apiApprove(entity, id);
    const note = r?.note ? ` ${r.note}` : "";
    revalidatePath("/admin");
    revalidatePath("/worker");
    redirect(`/admin/approvals?msg=${encodeURIComponent("Pengajuan disetujui dan sudah tayang." + note)}`);
  } catch (e) {
    redirect(`/admin/approvals?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
}

export async function rejectSubmission(entity: ApprovalEntity, id: string, formData: FormData) {
  const parsed = RejectSchema.safeParse({ reason: formData.get("reason") });
  if (!parsed.success) {
    redirect(`/admin/approvals?msg=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Alasan tidak valid.")}`);
  }
  try {
    await apiReject(entity, id, parsed.data.reason);
  } catch (e) {
    redirect(`/admin/approvals?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/admin");
  revalidatePath("/worker");
  redirect("/admin/approvals?msg=Pengajuan ditolak dan worker telah diberi tahu.");
}

export async function getApprovalQueue(): Promise<ApprovalQueue> {
  return apiQueue();
}
