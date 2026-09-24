"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  workerCreateArticle,
  workerDeleteArticle,
  workerGetArticle,
  workerSubmitArticle,
  workerUpdateArticle,
} from "@/lib/api/articles";
import { uploadOne } from "@/lib/api/client";
import { ArticleSchema } from "@/lib/validations";
import { formFiles, formValues, type ActionState } from "./helpers";

const KEYS = ["title", "slug", "excerpt", "content", "status"];

export async function createWorkerArticle(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    const files = formFiles(formData, "thumbnail");
    const thumbnail = files.length > 0 && files[0] ? await uploadOne(files[0], `article-${parsed.data.slug}`) : undefined;
    await workerCreateArticle({ ...parsed.data, ...(thumbnail ? { thumbnail } : {}) });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: raw };
  }
  redirect("/worker/articles?msg=Artikel tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerArticle(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  let wasLive = false;
  try {
    const current = (await workerGetArticle(id)) as { approvalStatus: string };
    wasLive = current.approvalStatus === "APPROVED";
    const files = formFiles(formData, "thumbnail");
    const thumbnail = files.length > 0 && files[0] ? await uploadOne(files[0], `article-${parsed.data.slug}`) : undefined;
    await workerUpdateArticle(id, { ...parsed.data, ...(thumbnail ? { thumbnail } : {}) });
  } catch (e) {
    redirect(`/worker/articles/${id}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  if (wasLive) {
    revalidatePath("/worker");
    redirect(`/worker/articles/${id}?msg=${encodeURIComponent("Revisi dikirim untuk review. Versi lama tetap tampil sampai disetujui.")}`);
  }
  redirect(`/worker/articles/${id}?msg=Perubahan disimpan sebagai draf.`);
}

export async function deleteWorkerArticle(id: string) {
  try {
    await workerDeleteArticle(id);
  } catch (e) {
    redirect(`/worker/articles?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect("/worker/articles?msg=Artikel dihapus.");
}

export async function submitWorkerArticle(id: string) {
  try {
    await workerSubmitArticle(id);
  } catch (e) {
    redirect(`/worker/articles?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/articles");
  redirect("/worker/articles?msg=Pengajuan terkirim. Menunggu review admin.");
}
