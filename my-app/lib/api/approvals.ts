import { authedFetch } from "./client";

export type ApprovalEntity = "product" | "article" | "gallery" | "category";

export type ApprovalUser = { name: string | null; email: string };

export type ApprovalProduct = {
  id: string;
  name: string;
  slug: string;
  submittedAt: string | null;
  category: { name: string };
  createdBy: ApprovalUser;
  _count: { images: number };
};

export type ApprovalArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  submittedAt: string | null;
  pendingTitle: string | null;
  pendingSlug: string | null;
  pendingExcerpt: string | null;
  pendingContent: string | null;
  pendingThumbnail: string | null;
  createdBy: ApprovalUser;
};

export type ApprovalGallery = {
  id: string;
  title: string;
  url: string;
  category: string;
  submittedAt: string | null;
  pendingTitle: string | null;
  pendingCategory: string | null;
  createdBy: ApprovalUser;
};

export type ApprovalCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  submittedAt: string | null;
  pendingName: string | null;
  pendingSlug: string | null;
  pendingDescription: string | null;
  createdBy: ApprovalUser;
  _count: { products: number };
};

export type ApprovalQueue = {
  products: ApprovalProduct[];
  articles: ApprovalArticle[];
  galleries: ApprovalGallery[];
  categories: ApprovalCategory[];
  total: number;
};

export type PendingCount = { total: number; products: number; articles: number; galleries: number; categories: number };

export type ReviewResult = { entity: string; id: string; note?: string };

export function getApprovalQueue() {
  return authedFetch<ApprovalQueue>("/admin/approvals", { cache: "no-store" });
}

export function getPendingApprovalCount() {
  return authedFetch<PendingCount>("/admin/approvals/pending-count", { cache: "no-store" });
}

export function approveSubmission(entity: ApprovalEntity, id: string) {
  return authedFetch<ReviewResult>(`/admin/approvals/${entity}/${id}/approve`, { method: "PATCH" });
}

export function rejectSubmission(entity: ApprovalEntity, id: string, reason: string) {
  return authedFetch<ReviewResult>(`/admin/approvals/${entity}/${id}/reject`, {
    method: "PATCH",
    body: { reason },
  });
}
