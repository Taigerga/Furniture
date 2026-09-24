"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminAddPortfolioImages,
  adminCreatePortfolio,
  adminDeletePortfolio,
  adminDeletePortfolioImage,
  adminUpdatePortfolio,
} from "@/lib/api/portfolios";
import { uploadFiles } from "@/lib/api/client";
import { PortfolioSchema } from "@/lib/validations";
import { formFiles, formValues, stringValues, type ActionState } from "./helpers";

const KEYS = ["title", "slug", "client", "location", "year", "description"];

export async function createPortfolioAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = PortfolioSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  const files = formFiles(formData, "images");
  if (files.length > 10) return { error: "Maksimal 10 gambar per proyek.", values };
  try {
    const imageUrls = files.length > 0 ? await uploadFiles(files, `portfolio-${parsed.data.slug}`) : [];
    await adminCreatePortfolio({ ...parsed.data, imageUrls });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values };
  }
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolios?msg=Portofolio berhasil ditambahkan.");
}

export async function updatePortfolioAction(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = PortfolioSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  try {
    await adminUpdatePortfolio(id, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values };
  }
  revalidatePath("/portfolio");
  revalidatePath(`/portfolio/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/portfolios?msg=Portofolio berhasil diperbarui.");
}

export async function deletePortfolioAction(id: string) {
  try {
    await adminDeletePortfolio(id);
  } catch (e) {
    redirect(`/admin/portfolios?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/portfolio");
  revalidatePath("/");
  redirect("/admin/portfolios?msg=Portofolio berhasil dihapus.");
}

export async function addPortfolioImagesAction(portfolioId: string, formData: FormData): Promise<void> {
  const files = formFiles(formData, "images");
  if (files.length === 0) redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent("Pilih minimal satu gambar.")}`);
  try {
    const urls = await uploadFiles(files, "portfolio");
    await adminAddPortfolioImages(portfolioId, urls);
  } catch (e) {
    redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Upload gambar gagal.")}`);
  }
  revalidatePath("/portfolio");
  redirect(`/admin/portfolios/${portfolioId}?msg=Gambar berhasil ditambahkan.`);
}

export async function deletePortfolioImageAction(portfolioId: string, imageId: string) {
  try {
    await adminDeletePortfolioImage(portfolioId, imageId);
  } catch (e) {
    redirect(`/admin/portfolios/${portfolioId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/portfolio");
  redirect(`/admin/portfolios/${portfolioId}?msg=Gambar dihapus.`);
}
