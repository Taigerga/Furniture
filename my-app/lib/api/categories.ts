import { apiFetch, authedFetch, type Page } from "./client";

export type CategoryPayload = { name: string; slug: string; description?: string };

export type CategoryPublic = { id: string; name: string; slug: string; _count: { products: number } };

export type CategoryAdmin = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  approvalStatus: string;
  pendingName: string | null;
  createdById: string;
  createdBy: { name: string | null; email: string; isActive: boolean };
  _count: { products: number };
};

export type CategoryWorker = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdById: string;
  approvalStatus: string;
  rejectionReason: string | null;
  pendingName: string | null;
  pendingSlug: string | null;
  _count: { products: number };
};

export function listCategories() {
  return apiFetch<CategoryPublic[]>("/categories", { next: { revalidate: 60 } });
}

export function getCategoriesForAdmin() {
  return authedFetch<CategoryAdmin[]>("/admin/categories", { cache: "no-store" });
}

export function adminListCategories() {
  return authedFetch<CategoryAdmin[]>("/admin/categories", { cache: "no-store" });
}

export function adminCreateCategory(payload: CategoryPayload) {
  return authedFetch<CategoryAdmin>("/admin/categories", { method: "POST", body: payload });
}

export function adminUpdateCategory(id: string, payload: CategoryPayload) {
  return authedFetch<CategoryAdmin>(`/admin/categories/${id}`, { method: "PATCH", body: payload });
}

export function adminDeleteCategory(id: string) {
  return authedFetch<{ id: string }>(`/admin/categories/${id}`, { method: "DELETE" });
}

export function workerListCategories() {
  return authedFetch<CategoryWorker[]>("/worker/categories", { cache: "no-store" });
}

export function workerCreateCategory(payload: CategoryPayload) {
  return authedFetch<CategoryWorker>("/worker/categories", { method: "POST", body: payload });
}

export function workerUpdateCategory(id: string, payload: CategoryPayload) {
  return authedFetch<CategoryWorker>(`/worker/categories/${id}`, { method: "PATCH", body: payload });
}

export function workerDeleteCategory(id: string) {
  return authedFetch<{ id: string }>(`/worker/categories/${id}`, { method: "DELETE" });
}

export function workerSubmitCategory(id: string) {
  return authedFetch<CategoryWorker>(`/worker/categories/${id}/submit`, { method: "POST" });
}

export type { Page };
