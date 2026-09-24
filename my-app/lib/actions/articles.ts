"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminCreateArticle, adminDeleteArticle, adminUpdateArticle } from "@/lib/api/articles";
import { uploadOne } from "@/lib/api/client";
import { ArticleSchema } from "@/lib/validations";
import { formFiles, formValues, type ActionState } from "./helpers";

const KEYS = ["title", "slug", "excerpt", "content", "status"];

export async function createArticleAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    const files = formFiles(formData, "thumbnail");
    const thumbnail = files.length > 0 && files[0] ? await uploadOne(files[0], `article-${parsed.data.slug}`) : undefined;
    await adminCreateArticle({ ...parsed.data, ...(thumbnail ? { thumbnail } : {}) });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: raw };
  }
  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles?msg=Artikel berhasil ditambahkan.");
}

export async function updateArticleAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    const files = formFiles(formData, "thumbnail");
    const thumbnail = files.length > 0 && files[0] ? await uploadOne(files[0], `article-${parsed.data.slug}`) : undefined;
    await adminUpdateArticle(id, { ...parsed.data, ...(thumbnail ? { thumbnail } : {}) });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Akses ditolak.", values: raw };
  }
  revalidatePath("/articles");
  revalidatePath(`/articles/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/articles?msg=Artikel berhasil diperbarui.");
}

export async function deleteArticleAction(id: string) {
  try {
    await adminDeleteArticle(id);
  } catch (e) {
    redirect(`/admin/articles?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/articles");
  revalidatePath("/");
  redirect("/admin/articles?msg=Artikel berhasil dihapus.");
}
