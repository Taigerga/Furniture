import {
  getAllActiveProducts as apiAll,
  getProductBySlug as apiBySlug,
  getRelatedProducts as apiRelated,
  listProducts as apiList,
  type ProductActive,
  type ProductDetail,
  type ProductListItem,
} from "@/lib/api/products";
import {
  getCategoriesForAdmin as apiCatsAdmin,
  listCategories as apiCats,
  type CategoryAdmin,
  type CategoryPublic,
} from "@/lib/api/categories";
import type { Page } from "@/lib/api/client";

export const PRODUCT_PAGE_SIZE = 12;

export function getCategories(): Promise<CategoryPublic[]> {
  return apiCats();
}

export function getCategoriesForAdmin(): Promise<CategoryAdmin[]> {
  return apiCatsAdmin();
}

export function listProducts(params: {
  query?: string;
  categorySlug?: string;
  page: number;
}): Promise<Page<ProductListItem>> {
  return apiList({ q: params.query, category: params.categorySlug, page: params.page });
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiBySlug(slug);
  } catch {
    return null;
  }
}

export function getRelatedProducts(categorySlug: string, excludeId: string, limit = 4): Promise<ProductListItem[]> {
  return apiRelated(categorySlug, excludeId, limit);
}

export function getAllActiveProducts(): Promise<ProductActive[]> {
  return apiAll();
}
