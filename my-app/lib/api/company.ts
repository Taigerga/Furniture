import { apiFetch, authedFetch } from "./client";

export type CompanyProfile = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  history: string | null;
  vision: string | null;
  mission: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  mapsUrl: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  hours: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string;
};

export function getCompanyProfile() {
  return apiFetch<CompanyProfile | null>("/company-profile", { next: { revalidate: 60 } });
}

export function adminGetCompany() {
  return authedFetch<CompanyProfile | null>("/admin/company-profile", { cache: "no-store" });
}

export function adminUpdateCompany(payload: Record<string, unknown>) {
  return authedFetch<CompanyProfile>("/admin/company-profile", { method: "PATCH", body: payload });
}

export function getPublicCounts() {
  return apiFetch<{ products: number; portfolios: number; articles: number }>("/public/counts", {
    next: { revalidate: 60 },
  });
}
