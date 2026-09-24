# Furniture Frontend — Next.js

> Frontend website company profile furniture dengan website publik, dashboard admin, dashboard worker, dan integrasi REST API ke backend NestJS.

Folder `my-app` berisi frontend aplikasi Furniture. Frontend menangani tampilan, navigasi, form, session authentication, dan komunikasi dengan backend. Frontend **tidak menjadi lapisan utama yang mengakses database**; seluruh akses database dilakukan oleh backend.

---

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur Integrasi](#arsitektur-integrasi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Route Utama](#route-utama)
- [Autentikasi dan Role](#autentikasi-dan-role)
- [Upload Gambar](#upload-gambar)
- [Struktur Folder](#struktur-folder)
- [Scripts](#scripts)
- [Praktik Pengembangan](#praktik-pengembangan)
- [Troubleshooting](#troubleshooting)

---

## Ringkasan

Frontend ini menyediakan dua pengalaman dalam satu aplikasi:

1. **Website publik** untuk pengunjung yang ingin mengenal perusahaan, melihat katalog, melihat portofolio, membaca artikel, dan mengirim inquiry.
2. **Dashboard internal** untuk admin dan worker yang mengelola konten, memproses inquiry, serta menjalankan workflow approval.

Frontend berjalan di port default `3000` dan berkomunikasi dengan backend di port `4000`.

---

## Fitur

### Website Publik

- Company profile dan informasi perusahaan.
- Katalog produk dengan kategori dan detail produk.
- Portofolio proyek.
- Artikel dan berita.
- Galeri foto.
- Form inquiry publik.
- Tombol konsultasi produk melalui WhatsApp.
- Sitemap dan robots untuk kebutuhan SEO.

### Admin Dashboard

Route `/admin` hanya dapat diakses oleh role `ADMIN`.

- Dashboard dan statistik.
- CRUD produk, kategori, artikel, galeri, dan portofolio.
- Approval pengajuan worker.
- Approve/reject disertai alasan penolakan.
- Upload dan pengelolaan gambar produk.
- Editor artikel Tiptap.
- Pengaturan company profile.
- Manajemen inquiry.
- Manajemen worker.
- Notifikasi.

### Worker Dashboard

Route `/worker` dapat diakses oleh role `ADMIN` atau `WORKER`.

- Dashboard status pekerjaan.
- CRUD karya milik sendiri: produk, artikel, dan galeri.
- Pengajuan konten untuk approval admin.
- Riwayat pengajuan dan alasan penolakan.
- Pengelolaan inquiry.
- Notifikasi.
- Pengaturan akun dan password.

### Content Approval

```text
DRAFT → PENDING → APPROVED / REJECTED
```

Konten yang telah dipublikasikan dan kemudian diubah dapat perlu direview ulang sebelum tampil kembali.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 16.3 App Router |
| Runtime UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Motion |
| Icons | Lucide React |
| Rich text | Tiptap |
| Validation | Zod |
| Session auth | Auth.js / NextAuth |
| HTTP client | Fetch + `lib/api/client.ts` |
| Backend target | NestJS REST API di `../backend` |
| Package manager | npm |

Frontend menggunakan Server Components sebagai default. Client Components digunakan untuk fitur yang membutuhkan interaksi di browser, seperti form, dropdown, modal, editor, upload, dan navigasi dinamis.

---

## Arsitektur Integrasi

```text
Browser
  │
  ▼
Next.js App Router
  │
  ├── Public pages / Server Components
  ├── Auth.js session
  ├── Server Actions
  └── lib/api/* REST client
            │
            │ Authorization: Bearer <backendAccessToken>
            ▼
      NestJS Backend :4000
            │
            ▼
      MySQL + Prisma
```

### Lapisan frontend

- `app/` — route dan page layout Next.js.
- `components/` — komponen UI berdasarkan domain.
- `features/` — feature module yang dapat dipakai ulang.
- `lib/api/` — fungsi komunikasi dengan backend.
- `lib/actions/` — server actions yang bridging UI ke API.
- `lib/auth.ts` — konfigurasi Auth.js Credentials.
- `lib/validations.ts` — schema validasi Zod.
- `shared/ui/` — primitive UI bersama.
- `services/` — service/helper yang tersisa dari implementasi awal.
- `public/` — asset frontend dan upload development.

`lib/api/client.ts` menjadi pusat fetch ke backend. Fungsi `authedFetch` mengambil token backend dari session dan otomatis menambahkan header `Authorization`.

---

## Prasyarat

- Node.js kompatibel dengan Next.js 16.
- npm.
- Backend NestJS sudah berjalan.
- Database sudah dikonfigurasi di backend jika ingin memakai data dinamis.
- `AUTH_SECRET` frontend sudah dibuat.

Frontend dapat terbuka tanpa backend, tetapi fitur yang membutuhkan data, login, dashboard, dan upload membutuhkan backend aktif.

---

## Instalasi

Masuk ke folder frontend:

```bash
cd my-app
npm install
```

Salin file environment:

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Buat `AUTH_SECRET` random:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Salin hasilnya ke `AUTH_SECRET` di `.env`.

---

## Environment Variables

Contoh konfigurasi development:

```env
# Backend NestJS — digunakan server-side
API_URL="http://localhost:4000"

# Origin backend untuk URL file upload
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Auth.js
AUTH_SECRET="isi-dengan-secret-random-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

| Variable | Required | Keterangan |
|---|---:|---|
| `API_URL` | Ya | Base URL REST API backend untuk server-side fetch |
| `NEXT_PUBLIC_API_URL` | Ya | URL backend yang boleh digunakan browser dan Client Component |
| `AUTH_SECRET` | Ya | Secret enkripsi/penandatanganan session Auth.js |
| `NEXTAUTH_URL` | Ya | URL aplikasi frontend |
| `NEXT_PUBLIC_APP_URL` | Ya | URL publik aplikasi, digunakan untuk metadata/URL |

> Jangan commit `.env`. Gunakan `.env.example` sebagai template yang aman untuk repository.

### Verifikasi konfigurasi

Pastikan:

- Backend dapat diakses di `API_URL`.
- `CORS_ORIGIN` backend mengizinkan `http://localhost:3000`.
- `NEXT_PUBLIC_API_URL` sesuai dengan `API_URL` pada development.
- Secret tidak menggunakan nilai contoh di production.

---

## Menjalankan Aplikasi

Pastikan backend berjalan terlebih dahulu di terminal terpisah:

```bash
cd ../backend
npm run start:dev
```

Kemudian jalankan frontend:

```bash
cd ../my-app
npm run dev
```

Buka:

```text
http://localhost:3000
```

Swagger backend dapat dibuka di:

```text
http://localhost:4000/api-docs
```

Untuk menjalankan production frontend:

```bash
npm run build
npm start
```

---

## Route Utama

### Publik

| Route | Keterangan |
|---|---|
| `/` | Beranda company profile |
| `/about` | Profil, sejarah, visi, dan misi perusahaan |
| `/products` | Katalog produk dengan filter kategori |
| `/products/[slug]` | Detail produk |
| `/portfolio` | Portofolio proyek |
| `/articles` | Daftar artikel |
| `/articles/[slug]` | Detail artikel |
| `/gallery` | Galeri foto |
| `/contact` | Kontak dan form inquiry |
| `/login` | Login admin dan worker |

### Admin

Route `/admin/*` hanya untuk role `ADMIN`, antara lain:

- `/admin` — dashboard.
- `/admin/products` — CRUD produk.
- `/admin/categories` — CRUD kategori.
- `/admin/articles` — CRUD artikel.
- `/admin/gallery` — CRUD galeri.
- `/admin/portfolio` — CRUD portofolio.
- `/admin/inquiries` — manajemen inquiry.
- `/admin/approvals` — approval pengajuan worker.
- `/admin/company-profile` — company profile.
- `/admin/users` — manajemen worker.
- `/admin/notifications` — notifikasi.

### Worker

Route `/worker/*` dapat diakses oleh role `ADMIN` dan `WORKER`, antara lain:

- `/worker` — dashboard worker.
- `/worker/products` — produk milik worker.
- `/worker/articles` — artikel milik worker.
- `/worker/gallery` — galeri milik worker.
- `/worker/inquiries` — inquiry yang ditangani worker.
- `/worker/submissions` — riwayat pengajuan.
- `/worker/notifications` — notifikasi.
- `/worker/profile` — profil akun.

---

## Autentikasi dan Role

Login dilakukan melalui satu route:

```text
/login
```

### Alur login

1. User memasukkan email dan password.
2. Auth.js melakukan request ke backend `POST /auth/login`.
3. Backend memvalidasi kredensial dan mengembalikan JWT.
4. `backendAccessToken` disimpan di session JWT frontend.
5. Request API berikutnya menggunakan Bearer token.

### Role

| Role | Akses |
|---|---|
| `ADMIN` | Seluruh dashboard admin dan worker |
| `WORKER` | Dashboard worker dan konten milik sendiri |

Proteksi route dilakukan berlapis:

1. `proxy.ts` melakukan redirect awal berdasarkan role.
2. Layout dan server action memeriksa session serta role.
3. Backend memeriksa JWT dan role menggunakan guard.

> Redirect di proxy bukan satu-satunya pertahanan. Backend tetap menjadi otorisasi utama.

---

## Upload Gambar

Frontend tidak menyimpan gambar langsung ke server Next.js. File dikirim ke backend melalui:

```text
POST /upload/many?prefix=<prefix>
```

Upload menggunakan `FormData` dan header Bearer token. Setelah upload berhasil, backend mengembalikan array URL yang kemudian disimpan pada record terkait.

Pada development, file berada di:

```text
../backend/uploads/
```

Frontend perlu `NEXT_PUBLIC_API_URL` agar browser dapat meng akses URL file backend. Untuk production, gunakan object storage eksternal dan sesuaikan `remotePatterns` pada `next.config.ts`.

Constraint penting:

- Jangan commit file upload user.
- Jangan mengekspos credential storage.
- Validasi ukuran dan tipe file tetap dilakukan di backend.

---

## Struktur Folder

```text
my-app/
├── app/
│   ├── (public)/             # Public pages
│   ├── (auth)/login/         # Login page
│   ├── admin/                # Admin dashboard
│   ├── worker/               # Worker dashboard
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── public/               # Header, footer, cards, gallery, inquiry form
│   ├── admin/                # CRUD forms dan admin components
│   ├── worker/               # Worker UI components
│   └── notifications/        # Notification components
├── features/                 # Feature modules
├── lib/
│   ├── api/                  # REST API client per domain
│   ├── actions/              # Server actions
│   ├── auth.ts               # Auth.js configuration
│   ├── uploads.ts            # Upload helpers
│   └── validations.ts        # Zod schemas
├── services/                 # Service helpers
├── shared/
│   └── ui/                   # Shared UI primitives
├── types/                    # TypeScript types
├── public/                   # Static assets
├── proxy.ts                  # Route protection
├── next.config.ts            # Next.js configuration
└── package.json
```

### Struktur app route

- `app/(public)/` — halaman yang tidak membutuhkan login.
- `app/(auth)/login/` — halaman login.
- `app/admin/` — route admin.
- `app/worker/` — route worker.

---

## Scripts

| Command | Fungsi |
|---|---|
| `npm run dev` | Development server Next.js |
| `npm run build` | Build production |
| `npm start` | Menjalankan hasil production build |
| `npm run lint` | Menjalankan ESLint |
| `npx tsc --noEmit` | Check TypeScript tanpa membuat output |
| `npx next typegen` | Regenerasi type route Next.js bila diperlukan |

---

## Praktik Pengembangan

- Jangan menyimpan data rahasia di component atau source code.
- Jangan menambahkan `DATABASE_URL` ke frontend; koneksi database milik backend.
- Gunakan `lib/api/*` untuk request yang membutuhkan backend.
- Gunakan Zod untuk validasi input yang masuk dari user.
- Tambahkan loading, error, dan empty state untuk data yang berasal dari API.
- Jangan menghapus `.next` saat development server sedang berjalan kecuali memang diperlukan.
- Setelah mengubah route, jalankan `npx next typegen` bila type route terasa basi.
- Jalankan lint dan build sebelum push.

---

## Troubleshooting

### `fetch failed` saat membuka halaman

- Backend belum berjalan.
- `API_URL` salah atau backend berada di port lain.
- Backend crash karena database belum siap.
- Firewall atau network environment memblokir localhost.

### Login gagal

- `AUTH_SECRET` frontend kosong.
- `JWT_SECRET` backend kosong.
- Database belum di-seed.
- Email/password tidak sesuai.
- `CORS_ORIGIN` tidak mengizinkan frontend.

### Route admin/worker mengarahkan ke login

- Session JWT belum dibuat.
- Role user tidak sesuai.
- `proxy.ts` tidak mencocokkan role.
- `AUTH_SECRET` berubah sehingga session lama tidak valid.

### Gambar upload tidak tampil

- `NEXT_PUBLIC_API_URL` salah.
- Backend tidak dapat membaca atau menulis folder `uploads`.
- URL yang disimpan pada database tidak dapat diakses.
- `next.config.ts` belum mengizinkan origin gambar.

### TypeScript error pada `.next/types`

```bash
npx next typegen
```

Jika masih terjadi, hentikan dev server, hapus `.next`, jalankan ulang development server, lalu build ulang.

### Error upload Server Action

- Periksa `experimental.serverActions.bodySizeLimit` pada `next.config.ts`.
- Pastikan endpoint upload backend aktif.
- Pastikan file tidak melebihi batas ukuran.
- Restart Next.js setelah mengubah `next.config.ts`.

### Build gagal

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Perbaiki error berdasarkan urutan di atas agar masalah paling dasar ditemukan terlebih dahulu.

---

## README Backend

Dokumentasi lengkap backend ada di:

```text
../backend/README.md
```

Pastikan backend dan database sudah siap sebelum menjalankan fitur frontend yang membutuhkan data dinamis.
