import { authedFetch } from "./client";

export type DashboardStats = {
  products: number;
  portfolios: number;
  articles: number;
  inquiries: number;
  newInquiries: number;
  byStatus: { NEW: number; CONTACTED: number; PROCESSING: number; COMPLETED: number; CANCELLED: number };
};

export type RecentInquiry = {
  id: string;
  name: string;
  whatsapp: string;
  quantity: number;
  status: string;
  createdAt: string;
  product: { name: string } | null;
};

export type RecentSubmission = {
  kind: string;
  label: string;
  id: string;
  approvalStatus: string;
  updatedAt?: string;
  createdBy: { name: string | null; email: string };
};

export type WorkerAttention = {
  kind: string;
  label: string;
  id: string;
  approvalStatus: string;
  rejectionReason?: string | null;
  updatedAt?: string;
};

export type WorkerDashboard = {
  products: number;
  articles: number;
  galleries: number;
  pending: number;
  approved: number;
  rejected: number;
  newInquiries: number;
  attention: WorkerAttention[];
};

export type WorkerSubmission = {
  kind: string;
  href: string;
  label: string;
  id: string;
  approvalStatus: string;
  rejectionReason: string | null;
  submittedAt: string | null;
  updatedAt?: string;
};

export function getDashboardStats() {
  return authedFetch<DashboardStats>("/admin/dashboard/stats", { cache: "no-store" });
}

export function getRecentInquiries(limit = 8) {
  return authedFetch<RecentInquiry[]>(`/admin/dashboard/recent-inquiries?limit=${limit}`, { cache: "no-store" });
}

export function getRecentSubmissions(limit = 6) {
  return authedFetch<RecentSubmission[]>(`/admin/dashboard/recent-submissions?limit=${limit}`, { cache: "no-store" });
}

export function getWorkerDashboard() {
  return authedFetch<WorkerDashboard>("/worker/dashboard", { cache: "no-store" });
}

export function workerSubmissions() {
  return authedFetch<WorkerSubmission[]>("/worker/submissions", { cache: "no-store" });
}

export function adminGetCurrentUser() {
  return authedFetch<{ id: string; name: string | null; email: string }>("/auth/me", { cache: "no-store" });
}
