import {
  getDashboardStats as apiStats,
  getRecentInquiries as apiRecent,
  type DashboardStats,
  type RecentInquiry,
} from "@/lib/api/dashboard";

export function getDashboardStats(): Promise<DashboardStats> {
  return apiStats();
}

export function getRecentInquiries(limit = 8): Promise<RecentInquiry[]> {
  return apiRecent(limit);
}
