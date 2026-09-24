import { apiFetch, authedFetch, type Page } from "./client";

export type GalleryPayload = { title: string; category: string; url?: string };

export type GalleryItem = { id: string; title: string; url: string; category: string };

export type AdminGalleryItem = GalleryItem & {
  createdAt: string;
  approvalStatus: string;
  pendingTitle: string | null;
  createdById: string;
  createdBy: { name: string | null; email: string; isActive: boolean };
};

export type WorkerGalleryItem = GalleryItem & {
  createdAt: string;
  approvalStatus: string;
  rejectionReason: string | null;
  pendingTitle: string | null;
  pendingCategory: string | null;
};

export type GalleryDetail = GalleryItem & {
  approvalStatus: string;
  createdById: string;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  pendingTitle: string | null;
  pendingCategory: string | null;
  createdAt: string;
};

export function listGallery() {
  return apiFetch<GalleryItem[]>("/gallery", { next: { revalidate: 60 } });
}

export function adminListGallery(params: { category?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return authedFetch<Page<AdminGalleryItem>>(`/admin/gallery${qs ? `?${qs}` : ""}`, { cache: "no-store" });
}

export function adminCreateGallery(payload: GalleryPayload) {
  return authedFetch<GalleryItem>("/admin/gallery", { method: "POST", body: payload });
}

export function adminUpdateGallery(id: string, payload: GalleryPayload) {
  return authedFetch<GalleryItem>(`/admin/gallery/${id}`, { method: "PATCH", body: payload });
}

export function adminDeleteGallery(id: string) {
  return authedFetch<{ id: string }>(`/admin/gallery/${id}`, { method: "DELETE" });
}

export function workerListGallery(page = 1) {
  return authedFetch<Page<WorkerGalleryItem>>(`/worker/gallery?page=${page}`, { cache: "no-store" });
}

export function workerGetGallery(id: string) {
  return authedFetch<GalleryDetail>(`/worker/gallery/${id}`, { cache: "no-store" });
}

export function workerCreateGallery(payload: GalleryPayload) {
  return authedFetch<GalleryItem>("/worker/gallery", { method: "POST", body: payload });
}

export function workerUpdateGallery(id: string, payload: GalleryPayload) {
  return authedFetch<GalleryDetail>(`/worker/gallery/${id}`, { method: "PATCH", body: payload });
}

export function workerDeleteGallery(id: string) {
  return authedFetch<{ id: string }>(`/worker/gallery/${id}`, { method: "DELETE" });
}

export function workerSubmitGallery(id: string) {
  return authedFetch<GalleryDetail>(`/worker/gallery/${id}/submit`, { method: "POST" });
}
