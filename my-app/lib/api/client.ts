import { auth } from "@/lib/auth";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export function apiBaseUrl() {
  return API_URL;
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string;
  /** teruskan ke Next fetch cache, mis. { next: { revalidate: 60 } } */
  next?: RequestInit["next"];
  cache?: RequestInit["cache"];
};

async function parseBody(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Fetch ke backend NestJS. Melempar Error(message) bila response tidak ok. */
export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    ...(opts.next !== undefined ? { next: opts.next } : {}),
    ...(opts.cache !== undefined ? { cache: opts.cache } : {}),
  });
  const data = await parseBody(res);
  if (!res.ok) {
    const message =
      (data as { message?: string | string[] })?.message ?? `Backend error (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  // Backend membungkus sukses: { success: true, data }
  if (data && typeof data === "object" && "success" in (data as Record<string, unknown>)) {
    return (data as { data: T }).data;
  }
  return data as T;
}

/** Ambil backendAccessToken dari session next-auth (server-side). */
export async function backendToken(): Promise<string> {
  const session = await auth();
  const token = (session as unknown as { backendAccessToken?: string } | null)?.backendAccessToken;
  if (!token) throw new Error("Sesi kedaluwarsa, silakan login kembali.");
  return token;
}

/** Shortcut: fetch dengan token otomatis dari session. */
export async function authedFetch<T>(path: string, opts: Omit<ApiOptions, "token"> = {}): Promise<T> {
  const token = await backendToken();
  return apiFetch<T>(path, { ...opts, token });
}

export type Page<T> = { items: T[]; total: number; totalPages: number };

/** Upload file ke backend dulu (POST /upload/many), kembalikan array URL. */
export async function uploadFiles(files: File[], prefix: string): Promise<string[]> {
  const token = await backendToken();
  const form = new FormData();
  for (const f of files) form.append("files", f);
  const res = await fetch(`${API_URL}/upload/many?prefix=${encodeURIComponent(prefix)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await parseBody(res);
  if (!res.ok) {
    const message = (data as { message?: string | string[] })?.message ?? "Upload gambar gagal.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return (data as { data: { urls: string[] } }).data.urls;
}

/** Upload satu file, kembalikan URL. */
export async function uploadOne(file: File, prefix: string): Promise<string> {
  const urls = await uploadFiles([file], prefix);
  const url = urls[0];
  if (!url) throw new Error("Upload gambar gagal.");
  return url;
}
