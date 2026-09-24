import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api/client";

type SitemapRow = { slug: string; updatedAt: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let products: SitemapRow[] = [];
  let portfolios: SitemapRow[] = [];
  let articles: SitemapRow[] = [];
  try {
    const data = await apiFetch<{ products: SitemapRow[]; portfolios: SitemapRow[]; articles: SitemapRow[] }>(
      "/sitemap",
      { next: { revalidate: 3600 } },
    );
    products = data.products;
    portfolios = data.portfolios;
    articles = data.articles;
  } catch {
    // Backend mati saat build: kembalikan halaman statis saja.
  }

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/portfolio`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/articles`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/gallery`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...portfolios.map((p) => ({
      url: `${base}/portfolio/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...articles.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
