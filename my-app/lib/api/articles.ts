import { apiFetch, authedFetch, type Page } from "./client";

export type ArticlePayload = Record<string, unknown>;

export type PublishedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  author: { name: string | null } | null;
};

export type ArticleDetail = PublishedArticle & { content: string };

export type AdminArticleItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  updatedAt: string;
  approvalStatus: string;
  pendingTitle: string | null;
  createdById: string;
  author: { name: string | null } | null;
  createdBy: { name: string | null; email: string; isActive: boolean };
};

export type AdminArticleDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  status: string;
  publishedAt: string | null;
  approvalStatus: string;
  createdById: string;
  pendingTitle: string | null;
  pendingSlug: string | null;
  pendingExcerpt: string | null;
  pendingContent: string | null;
  pendingThumbnail: string | null;
  rejectionReason: string | null;
  createdBy: { name: string | null; email: string; isActive: boolean };
};

export type WorkerArticleItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  approvalStatus: string;
  rejectionReason: string | null;
  updatedAt: string;
  pendingTitle: string | null;
  pendingSlug: string | null;
};

export function listPublishedArticles() {
  return apiFetch<PublishedArticle[]>("/articles", { next: { revalidate: 60 } });
}

export function getArticleBySlug(slug: string) {
  return apiFetch<ArticleDetail>(`/articles/${slug}`, { next: { revalidate: 60 } });
}

export function adminListArticles(params: { status?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return authedFetch<Page<AdminArticleItem>>(`/admin/articles${qs ? `?${qs}` : ""}`, { cache: "no-store" });
}

export function adminGetArticle(id: string) {
  return authedFetch<AdminArticleDetail>(`/admin/articles/${id}`, { cache: "no-store" });
}

export function adminCreateArticle(payload: ArticlePayload) {
  return authedFetch<AdminArticleDetail>("/admin/articles", { method: "POST", body: payload });
}

export function adminUpdateArticle(id: string, payload: ArticlePayload) {
  return authedFetch<AdminArticleDetail>(`/admin/articles/${id}`, { method: "PATCH", body: payload });
}

export function adminDeleteArticle(id: string) {
  return authedFetch<{ id: string }>(`/admin/articles/${id}`, { method: "DELETE" });
}

export function workerListArticles(page = 1) {
  return authedFetch<Page<WorkerArticleItem>>(`/worker/articles?page=${page}`, { cache: "no-store" });
}

export function workerGetArticle(id: string) {
  return authedFetch<AdminArticleDetail>(`/worker/articles/${id}`, { cache: "no-store" });
}

export function workerCreateArticle(payload: ArticlePayload) {
  return authedFetch<AdminArticleDetail>("/worker/articles", { method: "POST", body: payload });
}

export function workerUpdateArticle(id: string, payload: ArticlePayload) {
  return authedFetch<AdminArticleDetail>(`/worker/articles/${id}`, { method: "PATCH", body: payload });
}

export function workerDeleteArticle(id: string) {
  return authedFetch<{ id: string }>(`/worker/articles/${id}`, { method: "DELETE" });
}

export function workerSubmitArticle(id: string) {
  return authedFetch<AdminArticleDetail>(`/worker/articles/${id}/submit`, { method: "POST" });
}
