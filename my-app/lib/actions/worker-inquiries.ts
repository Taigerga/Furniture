"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { workerProcessInquiry } from "@/lib/api/inquiries";

const StatusSchema = z.enum(["NEW", "CONTACTED", "PROCESSING", "COMPLETED", "CANCELLED"]);

/** Worker memproses inquiry bebas tanpa approval; dicatat siapa yang menangani. */
export async function processWorkerInquiry(id: string, formData: FormData) {
  const parsed = StatusSchema.safeParse(formData.get("status"));
  if (!parsed.success) throw new Error("Status tidak valid.");
  try {
    await workerProcessInquiry(id, parsed.data);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Operasi gagal.");
  }
  revalidatePath("/admin");
  revalidatePath("/worker");
  redirect(`/worker/inquiries/${id}?msg=Status inquiry diperbarui.`);
}

/** Satu klik setelah pekerja menekan "Buka WhatsApp". */
export async function markWorkerInquiryContactedAction(id: string) {
  try {
    await workerProcessInquiry(id, "CONTACTED");
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Operasi gagal.");
  }
  revalidatePath("/admin");
  revalidatePath("/worker");
  redirect(`/worker/inquiries/${id}?msg=Inquiry ditandai sudah dihubungi.`);
}
