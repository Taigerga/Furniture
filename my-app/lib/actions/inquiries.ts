"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminDeleteInquiry, adminUpdateInquiryStatus } from "@/lib/api/inquiries";

const StatusSchema = z.enum(["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"]);

export async function updateInquiryStatusAction(id: string, formData: FormData) {
  const parsed = StatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid.");
  try {
    await adminUpdateInquiryStatus(id, parsed.data);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Operasi gagal.");
  }
  revalidatePath("/admin");
  redirect(`/admin/inquiries/${id}?msg=Status inquiry diperbarui.`);
}

export async function deleteInquiryAction(id: string) {
  try {
    await adminDeleteInquiry(id);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Operasi gagal.");
  }
  revalidatePath("/admin");
  redirect("/admin/inquiries?msg=Inquiry berhasil dihapus.");
}
