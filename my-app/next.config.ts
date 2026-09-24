import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      // File upload diserve backend NestJS (lihat lib/uploads.ts)
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000" },
    ],
    // Backend berjalan di localhost (IP privat). Di produksi dengan domain
    // publik, flag ini tidak diperlukan dan harus dihapus.
    dangerouslyAllowLocalIP: true,
  },
  experimental: {
    // Default Next 1MB; form upload mengizinkan s.d. 2MB/file (maks 8 file
    // di produk) + overhead multipart. Kontrol utama tetap validasi 2MB/file.
    serverActions: { bodySizeLimit: "20mb" },
  },
};

export default nextConfig;
