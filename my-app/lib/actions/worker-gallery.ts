"use server";

import { redirect } from "next/navigation";
import {
  workerCreateGallery,
  workerDeleteGallery,
  workerGetGallery,
  workerSubmitGallery,
  workerUpdateGallery,
} from "@/lib/api/gallery";
import { uploadOne } from "@/lib/api/client";
import { GallerySchema } from "@/lib/validations";
import { formFiles, formValues, type ActionState } from "./helpers";

export async function createWorkerGallery(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const files = formFiles(formData, "image");
  if (files.length === 0) return { error: "Pilih satu gambar." };
  try {
    const url = files[0] ? await uploadOne(files[0], "gallery") : undefined;
    if (!url) return { error: "Upload gambar gagal." };
    await workerCreateGallery({ ...parsed.data, url });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
  }
  redirect("/worker/gallery?msg=Foto tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerGallery(id: string, formData: FormData): Promise<void> {
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    redirect(`/worker/gallery?msg=${encodeURIComponent("Judul/kategori galeri tidak valid.")}`);
  }
  let wasLive = false;
  try {
    const current = (await workerGetGallery(id)) as { approvalStatus: string };
    wasLive = current.approvalStatus === "APPROVED";
    await workerUpdateGallery(id, parsed.data);
  } catch (e) {
    redirect(`/worker/gallery?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect(`/worker/gallery?msg=${encodeURIComponent(wasLive ? "Revisi dikirim untuk review. Versi lama tetap tampil sampai disetujui." : "Galeri diperbarui.")}`);
}

export async function deleteWorkerGallery(id: string) {
  try {
    await workerDeleteGallery(id);
  } catch (e) {
    redirect(`/worker/gallery?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect("/worker/gallery?msg=Foto dihapus.");
}

export async function submitWorkerGallery(id: string) {
  try {
    await workerSubmitGallery(id);
  } catch (e) {
    redirect(`/worker/gallery?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect("/worker/gallery?msg=Pengajuan terkirim. Menunggu review admin.");
}
