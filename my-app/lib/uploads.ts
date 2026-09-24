/**
 * Resolve URL file upload ke origin backend NestJS.
 *
 * DB menyimpan path relatif (`/uploads/...`) agar portable. File fisiknya
 * diserve backend (`ServeStaticModule` di `/uploads`), BUKAN oleh Next.js,
 * sehingga `next/image` harus diberi URL absolut ke backend.
 * URL non-upload (picsum, http eksternal) dibiarkan apa adanya.
 */
const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:4000";

export function uploadUrl(url: string): string;
export function uploadUrl(url: null | undefined): null | undefined;
export function uploadUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  if (url.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${url}`;
  return url;
}
