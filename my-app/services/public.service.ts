import { getCompanyProfile as apiCompany, getPublicCounts as apiCounts, type CompanyProfile } from "@/lib/api/company";
import { getFeaturedProducts as apiFeatured, type ProductListItem } from "@/lib/api/products";

export function getCompanyProfile(): Promise<CompanyProfile | null> {
  return apiCompany();
}

export function getFeaturedProducts(limit = 6): Promise<ProductListItem[]> {
  return apiFeatured(limit);
}

export function getPublicCounts(): Promise<{ products: number; portfolios: number; articles: number }> {
  return apiCounts();
}
