import {
  getArticleBySlug as apiArticleBySlug,
  listPublishedArticles as apiPublished,
  type ArticleDetail,
  type PublishedArticle,
} from "@/lib/api/articles";
import { listGallery as apiGallery, type GalleryItem } from "@/lib/api/gallery";
import {
  getPortfolioBySlug as apiPortfolioBySlug,
  listPortfolios as apiPortfolios,
  type PortfolioDetail,
  type PortfolioListItem,
} from "@/lib/api/portfolios";

export function listPortfolios(): Promise<PortfolioListItem[]> {
  return apiPortfolios();
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioDetail | null> {
  try {
    return await apiPortfolioBySlug(slug);
  } catch {
    return null;
  }
}

export function listPublishedArticles(): Promise<PublishedArticle[]> {
  return apiPublished();
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  try {
    return await apiArticleBySlug(slug);
  } catch {
    return null;
  }
}

export function listGallery(): Promise<GalleryItem[]> {
  return apiGallery();
}
