"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminAddProductImages,
  adminCreateProduct,
  adminDeleteProduct,
  adminDeleteProductImage,
  adminUpdateProduct,
  setMainProductImage,
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

export async function createProductAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  const files = formFiles(formData, "images");
  if (files.length > 8) return { error: "Maksimal 8 gambar per produk.", values };
  try {
    const imageUrls = files.length > 0 ? await uploadFiles(files, `product-${parsed.data.slug}`) : [];
    await adminCreateProduct({ ...parsed.data, imageUrls });
  } catch (e) {
    return fail(e, values);
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?msg=Produk berhasil ditambahkan.");
}

export async function updateProductAction(
  id: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const raw = { ...formValues(formData, KEYS), featured: formData.get("featured") === "on" };
  const values = stringValues(formData, KEYS);
  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values };
  }
  try {
    await adminUpdateProduct(id, parsed.data);
  } catch (e) {
    return fail(e, values);
  }
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/");
  redirect("/admin/products?msg=Produk berhasil diperbarui.");
}

export async function deleteProductAction(id: string) {
  try {
    await adminDeleteProduct(id);
  } catch (e) {
    redirect(`/admin/products?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?msg=Produk berhasil dihapus.");
}

export async function addProductImagesAction(productId: string, formData: FormData): Promise<void> {
  const files = formFiles(formData, "images");
  if (files.length === 0) redirect(`/admin/products/${productId}?msg=${encodeURIComponent("Pilih minimal satu gambar.")}`);
  try {
    const urls = await uploadFiles(files, "product");
    await adminAddProductImages(productId, urls);
  } catch (e) {
    redirect(`/admin/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Upload gambar gagal.")}`);
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${productId}?msg=Gambar berhasil ditambahkan.`);
}

export async function setMainProductImageAction(productId: string, imageId: string) {
  try {
    await setMainProductImage(productId, imageId);
  } catch (e) {
    redirect(`/admin/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${productId}?msg=Gambar utama diperbarui.`);
}

export async function deleteProductImageAction(productId: string, imageId: string) {
  try {
    await adminDeleteProductImage(productId, imageId);
  } catch (e) {
    redirect(`/admin/products/${productId}?msg=${encodeURIComponent(e instanceof Error ? e.message : "Akses ditolak.")}`);
  }
  revalidatePath("/products");
  revalidatePath("/");
  redirect(`/admin/products/${productId}?msg=Gambar dihapus.`);
}
