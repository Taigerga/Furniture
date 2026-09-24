import { apiFetch, authedFetch, type Page } from "./client";

export type PortfolioPayload = Record<string, unknown>;

export type PortfolioImage = { url: string; alt: string | null };

export type PortfolioListItem = {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  location: string | null;
  year: number | null;
  images: PortfolioImage[];
};

export type PortfolioDetail = PortfolioListItem & { description: string | null };

export type AdminPortfolioItem = {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  year: number | null;
  featured: boolean;
  updatedAt: string;
  _count: { images: number };
};

export type AdminPortfolioDetail = {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  location: string | null;
  year: number | null;
  description: string | null;
  featured: boolean;
  images: { id: string; url: string; alt: string | null; sortOrder: number }[];
};

export function listPortfolios() {
  return apiFetch<PortfolioListItem[]>("/portfolios", { next: { revalidate: 60 } });
}

export function getPortfolioBySlug(slug: string) {
  return apiFetch<PortfolioDetail>(`/portfolios/${slug}`, { next: { revalidate: 60 } });
}

export function adminListPortfolios(page = 1) {
  return authedFetch<Page<AdminPortfolioItem>>(`/admin/portfolios?page=${page}`, { cache: "no-store" });
}

export function adminGetPortfolio(id: string) {
  return authedFetch<AdminPortfolioDetail>(`/admin/portfolios/${id}`, { cache: "no-store" });
}

export function adminCreatePortfolio(payload: PortfolioPayload) {
  return authedFetch<AdminPortfolioDetail>("/admin/portfolios", { method: "POST", body: payload });
}

export function adminUpdatePortfolio(id: string, payload: PortfolioPayload) {
  return authedFetch<AdminPortfolioDetail>(`/admin/portfolios/${id}`, { method: "PATCH", body: payload });
}

export function adminDeletePortfolio(id: string) {
  return authedFetch<{ id: string }>(`/admin/portfolios/${id}`, { method: "DELETE" });
}

export function adminAddPortfolioImages(id: string, urls: string[]) {
  return authedFetch<AdminPortfolioDetail>(`/admin/portfolios/${id}/images`, { method: "POST", body: { urls } });
}

export function adminDeletePortfolioImage(portfolioId: string, imageId: string) {
  return authedFetch<{ portfolioId: string; imageId: string }>(
    `/admin/portfolios/${portfolioId}/images/${imageId}`,
    { method: "DELETE" },
  );
}
