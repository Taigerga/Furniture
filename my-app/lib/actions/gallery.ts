"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCreateGallery, adminDeleteGallery, adminUpdateGallery } from "@/lib/api/gallery";
import { uploadOne } from "@/lib/api/client";
import { GallerySchema } from "@/lib/validations";
import { formFiles, formValues, type ActionState } from "./helpers";

export async function createGalleryAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const files = formFiles(formData, "image");
  if (files.length === 0) return { error: "Pilih satu gambar." };
  try {
    const url = files[0] ? await uploadOne(files[0], "gallery") : undefined;
    if (!url) return { error: "Upload gambar gagal." };
    await adminCreateGallery({ ...parsed.data, url });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload gambar gagal." };
  }
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=Foto berhasil ditambahkan.");
}

export async function updateGalleryAction(id: string, formData: FormData): Promise<void> {
  const parsed = GallerySchema.safeParse(formValues(formData, ["title", "category"]));
  if (!parsed.success) {
    redirect(`/admin/gallery?msg=${encodeURIComponent("Judul/kategori galeri tidak valid.")}`);
  }
  try {
    await adminUpdateGallery(id, parsed.data);
  } catch (e) {
    redirect(`/admin/gallery?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=Galeri berhasil diperbarui.");
}

export async function deleteGalleryAction(id: string) {
  try {
    await adminDeleteGallery(id);
  } catch (e) {
    redirect(`/admin/gallery?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/gallery");
  redirect("/admin/gallery?msg=Foto berhasil dihapus.");
}
