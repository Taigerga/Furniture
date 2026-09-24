import { getPendingApprovalCount as apiCount } from "@/lib/api/approvals";
import { getRecentSubmissions as apiRecent, type RecentSubmission } from "@/lib/api/dashboard";

export async function getPendingApprovalCount(): Promise<number> {
  const r = await apiCount();
  return r.total;
}

export function getRecentSubmissions(limit = 6): Promise<RecentSubmission[]> {
  return apiRecent(limit);
}
