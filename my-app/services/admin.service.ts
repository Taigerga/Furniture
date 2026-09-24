import {
  adminGetProduct as apiGetProduct,
  adminListProducts as apiListProducts,
  type AdminProductDetail,
} from "@/lib/api/products";
import type { Page } from "@/lib/api/client";
import { adminListCategories as apiListCategories, type CategoryAdmin } from "@/lib/api/categories";
import {
  adminGetPortfolio as apiGetPortfolio,
  adminListPortfolios as apiListPortfolios,
  type AdminPortfolioDetail,
  type AdminPortfolioItem,
} from "@/lib/api/portfolios";
import {
  adminGetArticle as apiGetArticle,
  adminListArticles as apiListArticles,
  type AdminArticleDetail,
  type AdminArticleItem,
} from "@/lib/api/articles";
import { adminListGallery as apiListGallery, type AdminGalleryItem } from "@/lib/api/gallery";
import {
  adminGetInquiry as apiGetInquiry,
  adminListInquiries as apiListInquiries,
  type InquiryDetail,
  type InquiryListItem,
} from "@/lib/api/inquiries";
import { adminGetCompany as apiGetCompany, type CompanyProfile } from "@/lib/api/company";
import { adminGetCurrentUser as apiGetCurrentUser } from "@/lib/api/dashboard";

export const ADMIN_PAGE_SIZE = 10;

export function adminListProducts(params: { q?: string; status?: string; page: number }) {
  return apiListProducts(params);
}

export async function adminGetProduct(id: string): Promise<AdminProductDetail | null> {
  try {
    return await apiGetProduct(id);
  } catch {
    return null;
  }
}

export function adminListCategories(): Promise<CategoryAdmin[]> {
  return apiListCategories();
}

export function adminListPortfolios(params: { page: number }): Promise<Page<AdminPortfolioItem>> {
  return apiListPortfolios(params.page);
}

export async function adminGetPortfolio(id: string): Promise<AdminPortfolioDetail | null> {
  try {
    return await apiGetPortfolio(id);
  } catch {
    return null;
  }
}

export function adminListArticles(params: { status?: string; page: number }): Promise<Page<AdminArticleItem>> {
  return apiListArticles(params);
}

export async function adminGetArticle(id: string): Promise<AdminArticleDetail | null> {
  try {
    return await apiGetArticle(id);
  } catch {
    return null;
  }
}

export function adminListGallery(params: { category?: string; page: number }): Promise<Page<AdminGalleryItem>> {
  return apiListGallery(params);
}

export function adminListInquiries(params: { status?: string; q?: string; page: number }): Promise<Page<InquiryListItem>> {
  return apiListInquiries(params);
}

export async function adminGetInquiry(id: string): Promise<InquiryDetail | null> {
  try {
    return await apiGetInquiry(id);
  } catch {
    return null;
  }
}

export function adminGetCompany(): Promise<CompanyProfile | null> {
  return apiGetCompany();
}

export function adminGetCurrentUser(_id: string) {
  void _id;
  return apiGetCurrentUser();
}
