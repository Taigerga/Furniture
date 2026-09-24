"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  workerCreateCategory,
  workerDeleteCategory,
  workerListCategories,
  workerSubmitCategory,
  workerUpdateCategory,
} from "@/lib/api/categories";
import { CategorySchema } from "@/lib/validations";
import { formValues, type ActionState } from "./helpers";

const KEYS = ["name", "slug", "description"];

export async function createWorkerCategory(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    await workerCreateCategory(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: raw };
  }
  revalidatePath("/products");
  redirect("/worker/categories?msg=Kategori tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerCategory(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  let wasLive = false;
  try {
    const items = (await workerListCategories()) as { id: string; approvalStatus: string }[];
    wasLive = items.find((c) => c.id === id)?.approvalStatus === "APPROVED";
    await workerUpdateCategory(id, parsed.data);
  } catch (e) {
    redirect(`/worker/categories?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/products");
  if (wasLive) {
    redirect(`/worker/categories?msg=${encodeURIComponent("Revisi dikirim untuk review. Versi lama tetap tampil sampai disetujui.")}`);
  }
  redirect("/worker/categories?msg=Kategori berhasil diperbarui.");
}

export async function deleteWorkerCategory(id: string) {
  try {
    await workerDeleteCategory(id);
  } catch (e) {
    redirect(`/worker/categories?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/products");
  redirect("/worker/categories?msg=Kategori dihapus.");
}

export async function submitWorkerCategory(id: string) {
  try {
    await workerSubmitCategory(id);
  } catch (e) {
    redirect(`/worker/categories?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect("/worker/categories?msg=Pengajuan terkirim. Menunggu review admin.");
}
