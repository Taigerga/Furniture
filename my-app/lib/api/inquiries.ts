import { apiFetch, authedFetch, type Page } from "./client";

export type InquiryPayload = {
  name: string;
  email: string;
  whatsapp: string;
  quantity: number;
  message: string;
  productId?: string;
};

export type InquiryListItem = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  quantity: number;
  message: string;
  status: string;
  createdAt: string;
  product: { name: string } | null;
};

export type InquiryDetail = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  quantity: number;
  message: string;
  status: string;
  productId: string | null;
  handledById: string | null;
  createdAt: string;
  updatedAt: string;
  product: { name: string; slug: string } | null;
  handledBy?: { name: string | null } | null;
};

/** Public, tanpa login. Rate limit 5x/10 mnt diterapkan backend. */
export function createInquiry(payload: InquiryPayload) {
  return apiFetch<{ id: string; productName: string | null }>("/inquiries", { method: "POST", body: payload });
}

export function adminListInquiries(params: { status?: string; q?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return authedFetch<Page<InquiryListItem>>(`/admin/inquiries${qs ? `?${qs}` : ""}`, { cache: "no-store" });
}

export function adminGetInquiry(id: string) {
  return authedFetch<InquiryDetail>(`/admin/inquiries/${id}`, { cache: "no-store" });
}

export function adminUpdateInquiryStatus(id: string, status: string) {
  return authedFetch<InquiryDetail>(`/admin/inquiries/${id}`, { method: "PATCH", body: { status } });
}

export function adminDeleteInquiry(id: string) {
  return authedFetch<{ id: string }>(`/admin/inquiries/${id}`, { method: "DELETE" });
}

export function workerListInquiries(params: { status?: string; q?: string; page?: number } = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return authedFetch<Page<InquiryListItem & { handledBy?: { name: string | null } | null }>>(
    `/worker/inquiries${qs ? `?${qs}` : ""}`,
    { cache: "no-store" },
  );
}

export function workerGetInquiry(id: string) {
  return authedFetch<InquiryDetail>(`/worker/inquiries/${id}`, { cache: "no-store" });
}

export function workerProcessInquiry(id: string, status: string) {
  return authedFetch<InquiryDetail>(`/worker/inquiries/${id}`, { method: "PATCH", body: { status } });
}
