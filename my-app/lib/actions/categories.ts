"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminUpdateCategory,
} from "@/lib/api/categories";
import { CategorySchema } from "@/lib/validations";
import { formValues, type ActionState } from "./helpers";

const KEYS = ["name", "slug", "description"];

export async function createCategoryAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    await adminCreateCategory(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: raw };
  }
  revalidatePath("/products");
  redirect("/admin/categories?msg=Kategori berhasil ditambahkan.");
}

export async function updateCategoryAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = CategorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    await adminUpdateCategory(id, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Akses ditolak." };
  }
  revalidatePath("/products");
  redirect("/admin/categories?msg=Kategori berhasil diperbarui.");
}

export async function deleteCategoryAction(id: string) {
  try {
    await adminDeleteCategory(id);
  } catch (e) {
    redirect(`/admin/categories?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/products");
  redirect("/admin/categories?msg=Kategori berhasil dihapus.");
}
