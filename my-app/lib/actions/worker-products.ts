"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  workerAddProductImages,
  workerCreateProduct,
  workerDeleteProduct,
  workerDeleteProductImage,
  workerGetProduct,
  workerSubmitProduct,
  workerUpdateProduct,
} from "@/lib/api/products";
import { uploadFiles } from "@/lib/api/client";
import { ProductSchema } from "@/lib/validations";
import { formFiles, formValues, stringValues, type ActionState } from "./helpers";

const KEYS = [
  "name", "slug", "categoryId", "shortDesc", "description",
  "material", "dimensions", "color", "specifications", "status",
];

function fail(e: unknown, values?: Record<string, string>): ActionState {
  return { error: e instanceof Error ? e.message : "Operasi gagal.", ...(values ? { values } : {}) };
}

export async function createWorkerProduct(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = { ...formValues(formData, KEYS), featured: false };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  const files = formFiles(formData, "images");
  if (files.length > 8) return { error: "Maksimal 8 gambar per produk.", values };
  try {
    const imageUrls = files.length > 0 ? await uploadFiles(files, `product-${parsed.data.slug}`) : [];
    await workerCreateProduct({ ...parsed.data, imageUrls });
  } catch (e) {
    return fail(e, values);
  }
  redirect("/worker/products?msg=Produk tersimpan sebagai draf. Ajukan review bila sudah siap.");
}

export async function updateWorkerProduct(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = { ...formValues(formData, KEYS), featured: false };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  let wasLive = false;
  try {
    const current = (await workerGetProduct(id)) as { approvalStatus: string };
    wasLive = current.approvalStatus === "APPROVED";
    await workerUpdateProduct(id, parsed.data);
  } catch (e) {
    redirect(`/worker/products/${id}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  if (wasLive) {
    revalidatePath("/products");
    revalidatePath(`/products/${parsed.data.slug}`);
    revalidatePath("/");
    redirect(`/worker/products/${id}?msg=${encodeURIComponent("Perubahan dikirim untuk review ulang. Produk sementara tidak tampil publik.")}`);
  }
  redirect(`/worker/products/${id}?msg=Perubahan disimpan sebagai draf.`);
}

export async function deleteWorkerProduct(id: string) {
  try {
    await workerDeleteProduct(id);
  } catch (e) {
    redirect(`/worker/products?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect("/worker/products?msg=Produk dihapus.");
}

/** Ajukan draf/rejected ke antrean review admin. */
export async function submitWorkerProduct(id: string) {
  try {
    await workerSubmitProduct(id);
  } catch (e) {
    redirect(`/worker/products?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/worker/products?msg=Pengajuan terkirim. Menunggu review admin.");
}

export async function addWorkerProductImages(productId: string, formData: FormData): Promise<void> {
  const files = formFiles(formData, "images");
  if (files.length === 0) redirect(`/worker/products/${productId}?msg=${encodeURIComponent("Pilih minimal satu gambar.")}`);
  try {
    const urls = await uploadFiles(files, "product");
    await workerAddProductImages(productId, urls);
  } catch (e) {
    redirect(`/worker/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Upload gagal.")}`);
  }
  redirect(`/worker/products/${productId}?msg=Gambar ditambahkan.`);
}

export async function deleteWorkerProductImage(productId: string, imageId: string) {
  try {
    await workerDeleteProductImage(productId, imageId);
  } catch (e) {
    redirect(`/worker/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Operasi gagal.")}`);
  }
  redirect(`/worker/products/${productId}?msg=Gambar dihapus.`);
}
