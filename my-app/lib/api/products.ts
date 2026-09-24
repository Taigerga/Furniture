import { apiFetch, authedFetch, type Page } from "./client";

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  material: string | null;
  category: { name: string; slug: string };
  images: { url: string; alt: string | null }[];
};

export type ProductDetail = ProductListItem & {
  description: string | null;
  dimensions: string | null;
  color: string | null;
  specifications: string | null;
};

export type ProductActive = { id: string; name: string; slug: string };

export type AdminProductItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  featured: boolean;
  updatedAt: string;
  approvalStatus: string;
  createdById: string;
  category: { name: string };
  createdBy: { name: string | null; email: string; isActive: boolean };
  _count: { images: number; inquiries: number };
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isMain: boolean;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  material: string | null;
  dimensions: string | null;
  color: string | null;
  specifications: string | null;
  status: string;
  featured: boolean;
  approvalStatus: string;
  createdById: string;
  categoryId: string;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  images: ProductImage[];
  category: { id: string; name: string; slug: string };
  createdBy: { name: string | null; email: string; isActive: boolean };
};

export type WorkerProductItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  approvalStatus: string;
  rejectionReason: string | null;
  updatedAt: string;
  category: { name: string };
  _count: { images: number };
};

/* PUBLIC */
export function listProducts(params: { q?: string; category?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return apiFetch<Page<ProductListItem>>(`/products${qs ? `?${qs}` : ""}`, { next: { revalidate: 30 } });
}

export function getProductBySlug(slug: string) {
  return apiFetch<ProductDetail>(`/products/${slug}`, { next: { revalidate: 30 } });
}

export function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4) {
  return apiFetch<ProductListItem[]>(`/products/${categorySlug}/related/${excludeId}?limit=${limit}`, {
    next: { revalidate: 60 },
  });
}

export function getFeaturedProducts(limit = 6) {
  return apiFetch<ProductListItem[]>(`/products/featured?limit=${limit}`, { next: { revalidate: 60 } });
}

export function getAllActiveProducts() {
  return apiFetch<ProductActive[]>("/products/all", { next: { revalidate: 60 } });
}

/* ADMIN */
export function adminListProducts(params: { q?: string; status?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return authedFetch<Page<AdminProductItem>>(`/admin/products${qs ? `?${qs}` : ""}`, { cache: "no-store" });
}

export function adminGetProduct(id: string) {
  return authedFetch<AdminProductDetail>(`/admin/products/${id}`, { cache: "no-store" });
}

export type ProductPayload = Record<string, unknown>;

export function adminCreateProduct(payload: ProductPayload) {
  return authedFetch<AdminProductDetail>("/admin/products", { method: "POST", body: payload });
}

export function adminUpdateProduct(id: string, payload: ProductPayload) {
  return authedFetch<AdminProductDetail>(`/admin/products/${id}`, { method: "PATCH", body: payload });
}

export function adminDeleteProduct(id: string) {
  return authedFetch<{ id: string }>(`/admin/products/${id}`, { method: "DELETE" });
}

export function adminAddProductImages(id: string, urls: string[]) {
  return authedFetch<AdminProductDetail>(`/admin/products/${id}/images`, { method: "POST", body: { urls } });
}

export function setMainProductImage(productId: string, imageId: string) {
  return authedFetch<{ productId: string; imageId: string }>(`/products/${productId}/images/${imageId}/main`, {
    method: "PATCH",
  });
}

export function adminDeleteProductImage(productId: string, imageId: string) {
  return authedFetch<{ productId: string; imageId: string }>(`/admin/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  });
}

/* WORKER */
export function workerListProducts(page = 1) {
  return authedFetch<Page<WorkerProductItem>>(`/worker/products?page=${page}`, { cache: "no-store" });
}

export function workerGetProduct(id: string) {
  return authedFetch<AdminProductDetail>(`/worker/products/${id}`, { cache: "no-store" });
}

export function workerCreateProduct(payload: ProductPayload) {
  return authedFetch<AdminProductDetail>("/worker/products", { method: "POST", body: payload });
}

export function workerUpdateProduct(id: string, payload: ProductPayload) {
  return authedFetch<AdminProductDetail>(`/worker/products/${id}`, { method: "PATCH", body: payload });
}

export function workerDeleteProduct(id: string) {
  return authedFetch<{ id: string }>(`/worker/products/${id}`, { method: "DELETE" });
}

export function workerSubmitProduct(id: string) {
  return authedFetch<AdminProductDetail>(`/worker/products/${id}/submit`, { method: "POST" });
}

export function workerAddProductImages(id: string, urls: string[]) {
  return authedFetch<AdminProductDetail>(`/worker/products/${id}/images`, { method: "POST", body: { urls } });
}

export function workerDeleteProductImage(productId: string, imageId: string) {
  return authedFetch<{ productId: string; imageId: string }>(`/worker/products/${productId}/images/${imageId}`, {
    method: "DELETE",
  });
}
