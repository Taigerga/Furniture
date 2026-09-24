import {
  getWorkerDashboard as apiDash,
  workerSubmissions as apiSubs,
  type WorkerDashboard,
  type WorkerSubmission,
} from "@/lib/api/dashboard";
import { getUnreadCount as apiUnread } from "@/lib/api/notifications";
import { workerGetProduct as apiGetProduct, workerListProducts as apiListProducts } from "@/lib/api/products";
import type { AdminProductDetail } from "@/lib/api/products";
import {
  workerGetArticle as apiGetArticle,
  workerListArticles as apiListArticles,
  type AdminArticleDetail,
  type WorkerArticleItem,
} from "@/lib/api/articles";
import type { WorkerProductItem } from "@/lib/api/products";
import { workerListCategories as apiListCategories, type CategoryWorker } from "@/lib/api/categories";
import {
  workerGetInquiry as apiGetInquiry,
  workerListInquiries as apiListInquiries,
  type InquiryDetail,
  type InquiryListItem,
} from "@/lib/api/inquiries";
import { workerListGallery as apiListGallery, type WorkerGalleryItem } from "@/lib/api/gallery";
import type { Page } from "@/lib/api/client";

// userId/isAdmin dipertahankan di signature agar halaman tak berubah;
// otorisasi kini via JWT backend, bukan filter manual.
export function getWorkerDashboard(_userId: string): Promise<WorkerDashboard> {
  void _userId;
  return apiDash();
}

export async function getUnreadCount(_userId: string): Promise<number> {
  void _userId;
  const r = await apiUnread();
  return r.unread;
}

export const WORKER_PAGE_SIZE = 10;

export function workerListProducts(_userId: string, page: number): Promise<Page<WorkerProductItem>> {
  void _userId;
  return apiListProducts(page);
}

export async function workerGetProduct(
  _userId: string,
  id: string,
  _isAdmin: boolean,
): Promise<AdminProductDetail | null> {
  void _userId;
  void _isAdmin;
  try {
    return await apiGetProduct(id);
  } catch {
    return null;
  }
}

export function workerListArticles(_userId: string, page: number): Promise<Page<WorkerArticleItem>> {
  void _userId;
  return apiListArticles(page);
}

export async function workerGetArticle(
  _userId: string,
  id: string,
  _isAdmin: boolean,
): Promise<AdminArticleDetail | null> {
  void _userId;
  void _isAdmin;
  try {
    return await apiGetArticle(id);
  } catch {
    return null;
  }
}

export function workerListGallery(_userId: string, page: number): Promise<Page<WorkerGalleryItem>> {
  void _userId;
  return apiListGallery(page);
}

export function workerListCategories(): Promise<CategoryWorker[]> {
  return apiListCategories();
}

export function workerListInquiries(params: {
  status?: string;
  q?: string;
  page: number;
}): Promise<Page<InquiryListItem & { handledBy?: { name: string | null } | null }>> {
  return apiListInquiries(params);
}

export async function workerGetInquiry(id: string): Promise<InquiryDetail | null> {
  try {
    return await apiGetInquiry(id);
  } catch {
    return null;
  }
}

export function workerSubmissions(_userId: string): Promise<WorkerSubmission[]> {
  void _userId;
  return apiSubs();
}
