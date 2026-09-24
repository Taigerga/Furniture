# Furniture — Company Profile & Content Management System

> Website company profile untuk perusahaan furniture, dilengkapi katalog produk, portofolio, artikel, galeri, inquiry pelanggan, serta dashboard untuk admin dan worker.

Furniture adalah aplikasi full-stack yang dirancang untuk membantu perusahaan furniture mengelola konten dan relasi pelanggan dari satu tempat. Pengunjung dapat menjelajahi profil perusahaan dan katalog tanpa login, sedangkan admin dan worker menggunakan dashboard terproteksi untuk mengelola konten dan memproses inquiry.

---

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Fitur Utama](#fitur-utama)
- [Arsitektur](#arsitektur)
- [Struktur Repository](#struktur-repository)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Quick Start](#quick-start)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Database](#database)
- [Akun Demo](#akun-demo)
- [Development](#development)
- [Endpoint Penting](#endpoint-penting)
- [Upload File](#upload-file)
- [Testing dan Build](#testing-dan-build)
- [Troubleshooting](#troubleshooting)
- [Catatan Repository](#catatan-repository)

---

## Tentang Project

Aplikasi ini terdiri dari dua bagian yang berjalan sebagai service terpisah:

- **`my-app/`** — frontend Next.js untuk website publik dan dashboard internal.
- **`backend/`** — REST API NestJS yang menjadi lapisan akses database dan business logic.

Data penting tidak disimpan secara hard-coded di frontend. Frontend mengambil data dari backend melalui REST API, sedangkan backend mengakses MySQL menggunakan Prisma.

```text
Pengunjung / Admin / Worker
            │
            ▼
     Next.js Frontend
       my-app :3000
            │
            │  REST API + Bearer Token
            ▼
      NestJS Backend
     backend :4000
            │
            ▼
      MySQL Database
       Prisma ORM
```

---

## Fitur Utama

### Website Publik

- Beranda company profile yang menampilkan identitas dan informasi perusahaan.
- Halaman profil/about dengan sejarah, visi, misi, kontak, dan tautan sosial.
- Katalog produk dengan pencarian, filter kategori, pagination, dan halaman detail produk.
- Kategori furniture seperti kursi, meja, lemari, sofa, bedroom, dan office furniture.
- Galeri foto produk, workshop, kantor, dan kegiatan.
- Portofolio proyek dengan informasi klien, lokasi, tahun, dan dokumentasi.
- Artikel/berita furniture, termasuk artikel draft dan artikel published.
- Form inquiry publik tanpa login.
- Konsultasi produk melalui WhatsApp tanpa fitur harga langsung.

### Dashboard Admin

Dashboard admin tersedia pada route `/admin` dan hanya dapat diakses oleh user dengan role `ADMIN`.

- Statistik dashboard.
- CRUD produk dan kategori.
- CRUD portofolio dan galeri.
- CRUD artikel dengan editor Tiptap.
- Draft dan publish artikel.
- Upload gambar dengan validasi dan preview.
- Approval pengajuan worker.
- Approve/reject dengan alasan penolakan.
- Gestion inquiry: cari, filter status, dan ubah status.
- Balas inquiry melalui WhatsApp.
- Kelola user worker.
- Aktifkan/nonaktifkan worker.
- Reset password worker.
- Notifikasi internal.
- Pengaturan profil perusahaan.

### Dashboard Worker

Dashboard worker tersedia pada route `/worker` dan dapat diakses oleh role `ADMIN` atau `WORKER`.

- Dashboard status pengajuan.
- Mengelola produk milik sendiri.
- Mengelola artikel milik sendiri.
- Mengelola galeri milik sendiri.
- Mengelola kategori dengan permission berbeda dari admin.
- Memproses inquiry.
- Melihat riwayat pengajuan.
- Melihat alasan penolakan dari admin.
- Mengubah pengajuan dan mengirim ulang untuk direview.
- Melihat notifikasi.
- Mengatur profil dan password akun.

### Alur Approval Konten

```text
DRAFT
  │
  └── Submit
        ↓
     PENDING
       │
       ├── Admin approve ──► APPROVED / Tayang
       │
       └── Admin reject ──► REJECTED / Perbaiki lalu submit ulang
```

Perubahan terhadap karya yang sudah tayang dapat mengembalikan karya ke proses review sebelum tampil kembali.

---

## Arsitektur

### Frontend

Frontend menggunakan Next.js App Router dengan Server Components sebagai default. Client Components digunakan untuk interaksi seperti:

- Form login dan inquiry.
- Editor artikel.
- Upload dan dropzone.
- Filter serta pagination interaktif.
- Notifikasi dan navigasi dashboard.

### Backend

Backend menggunakan NestJS dengan module terpisah untuk setiap domain:

- Auth dan users.
- Products dan categories.
- Articles dan gallery.
- Portfolios.
- Inquiries.
- Company profile.
- Notifications.
- Approvals.
- Uploads.
- Dashboard.

### Autentikasi

1. Pengguna membuka `/login` pada frontend.
2. Frontend mengirim email dan password ke `POST /auth/login` backend.
3. Backend memvalidasi password menggunakan bcrypt.
4. Backend mengembalikan access token JWT dan data user.
5. Frontend menyimpan token tersebut di session Auth.js.
6. Request terautentikasi dikirim kembali ke backend menggunakan:

```http
Authorization: Bearer <backendAccessToken>
```

Session frontend memiliki masa berlaku sekitar 8 jam. Perubahan role atau status aktif user dapat membutuhkan login ulang.

---

## Struktur Repository

```text
Furniture/
├── README.md
├── .gitignore
│
├── my-app/                         # Frontend Next.js
│   ├── app/                         # Public, admin, worker, dan auth routes
│   ├── components/                  # Komponen UI per domain
│   ├── features/                    # Feature modules frontend
│   ├── lib/
│   │   ├── api/                     # REST client ke backend NestJS
│   │   ├── actions/                 # Server actions yang memanggil API
│   │   ├── auth.ts                  # Auth.js credentials provider
│   │   └── validations.ts           # Zod validation
│   ├── shared/                      # Komponen UI bersama
│   ├── services/                    # Service layer/legacy helpers
│   ├── public/                      # Asset frontend
│   ├── proxy.ts                     # Optimistic route protection
│   ├── .env.example
│   └── package.json
│
└── backend/                         # Backend NestJS
    ├── prisma/
    │   ├── schema.prisma            # Database schema
    │   ├── migrations/              # Database migrations
    │   └── seed.ts                  # Data demo development
    ├── src/
    │   ├── common/                  # Guard, filter, interceptor, decorator
    │   ├── config/                  # Environment configuration
    │   ├── prisma/                  # Prisma service dan adapter
    │   ├── modules/                 # Domain modules NestJS
    │   ├── generated/               # Prisma generated client, di-ignore
    │   └── main.ts                  # Bootstrap NestJS
    ├── test/                        # E2E test
    ├── uploads/                     # Local upload storage
    ├── .env.example
    └── package.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16.3 App Router |
| UI runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animation | Motion |
| Frontend icons | Lucide React |
| Rich text editor | Tiptap |
| Validation | Zod |
| Authentication | Auth.js + JWT |
| Backend framework | NestJS 12 |
| Backend testing | Vitest + Supertest |
| API documentation | Swagger/OpenAPI |
| ORM | Prisma 7 |
| Database | MySQL-compatible database |
| Package manager | npm |

---

## Prasyarat

Pastikan alat berikut sudah tersedia:

- Node.js yang kompatibel dengan Next.js dan NestJS.
- npm.
- MySQL atau database yang kompatibel dengan MySQL.
- Git, jika repository akan dikelola dengan version control.

Periksa versi Node dan npm:

```bash
node --version
npm --version
```

---

## Quick Start

### 1. Clone atau buka project

```bash
cd Furniture
```

### 2. Install dependency backend

```bash
cd backend
npm install
```

### 3. Siapkan environment backend

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Lalu edit `backend/.env` dan sesuaikan nilai database serta secret.

### 4. Siapkan database dan Prisma Client

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

> `npm run db:seed` menghapus dan mengisi ulang tabel untuk kebutuhan development. Jangan menjalankan seed pada database yang berisi data asli.

### 5. Jalankan backend

```bash
cd backend
npm run start:dev
```

Backend tersedia di:

- API: `http://localhost:4000`
- Swagger: `http://localhost:4000/api-docs`
- Health check: gunakan endpoint yang tersedia dari modul aplikasi

### 6. Install dependency frontend

Buka terminal baru:

```bash
cd my-app
npm install
```

### 7. Siapkan environment frontend

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Isi `AUTH_SECRET` dengan secret random. Contoh membuat secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 8. Jalankan frontend

```bash
cd my-app
npm run dev
```

Buka:

```text
http://localhost:3000
```

---

## Konfigurasi Environment

### Backend — `backend/.env`

```env
DATABASE_URL="mysql://root:@localhost:3306/furniture_db"
JWT_SECRET="ganti-dengan-secret-minimal-32-karakter"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
STORAGE_PROVIDER="local"
```

### Frontend — `my-app/.env`

```env
API_URL="http://localhost:4000"
NEXT_PUBLIC_API_URL="http://localhost:4000"
AUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Catatan keamanan

- Jangan commit file `.env`.
- `.env.example` boleh di-commit karena hanya berisi template.
- Jangan memakai password atau secret development di production.
- `JWT_SECRET` backend harus berbeda dari `AUTH_SECRET` frontend.
- Batasi `CORS_ORIGIN` hanya pada origin frontend yang memang digunakan.
- Ganti seluruh akun demo sebelum deployment production.

---

## Database

Database dikelola sepenuhnya dari folder `backend`.

### Menjalankan migration

```bash
cd backend
npx prisma migrate deploy
```

### Membuat migration baru saat/schema berubah

```bash
cd backend
npx prisma migrate dev --name nama-perubahan
```

### Generate Prisma Client

```bash
cd backend
npx prisma generate
```

Prisma 7 menggunakan konfigurasi database pada `backend/prisma.config.ts`. Client runtime dan database adapter berada di `backend/src/prisma`, sedangkan generated client berada di `backend/src/generated/prisma` dan tidak di-commit.

### Entity utama

Schema saat ini mencakup:

- User
- Product dan ProductImage
- Category
- Portfolio dan PortfolioImage
- Article
- Gallery
- Inquiry
- CompanyProfile
- Notification
- ActivityLog
- ApprovalStatus dan ProductStatus

---

## Akun Demo

Akun berikut dibuat oleh `backend/prisma/seed.ts` dan hanya untuk development:

| Role | Email | Password |
|---|---|---|
| `ADMIN` | `admin@furniture.local` | `Admin123!` |
| `WORKER` | `worker@furniture.local` | `Worker123!` |

Ganti atau hapus akun tersebut sebelum aplikasi dipakai di production.

---

## Development

Jalankan dua terminal secara bersamaan.

### Terminal 1 — backend

```bash
cd backend
npm run start:dev
```

### Terminal 2 — frontend

```bash
cd my-app
npm run dev
```

Command yang sering digunakan:

| Lokasi | Command | Fungsi |
|---|---|---|
| `backend` | `npm run start:dev` | Menjalankan NestJS dengan watch mode |
| `backend` | `npm run build` | Build backend TypeScript |
| `backend` | `npm run lint` | Menjalankan Oxlint |
| `backend` | `npm run format` | Format kode dengan Prettier |
| `backend` | `npm test` | Menjalankan unit/integration test |
| `backend` | `npm run test:e2e` | Menjalankan E2E test |
| `my-app` | `npm run dev` | Menjalankan Next.js development server |
| `my-app` | `npm run lint` | Menjalankan ESLint |
| `my-app` | `npm run build` | Build production frontend |
| `my-app` | `npm start` | Menjalankan hasil build Next.js |

---

## Endpoint Penting

### Publik

- `GET /products`
- `GET /products/:slug`
- `GET /categories`
- `GET /articles`
- `GET /articles/:slug`
- `GET /gallery`
- `GET /portfolios`
- `GET /portfolios/:slug`
- `GET /company-profile`
- `GET /public/counts`
- `POST /inquiries`

### Authenticated

- `POST /auth/login`
- `GET /auth/me`
- Endpoint `/admin/...` untuk role `ADMIN`.
- Endpoint `/worker/...` untuk role `ADMIN` dan `WORKER`.

Dokumentasi interaktif API tersedia melalui Swagger di `http://localhost:4000/api-docs` saat backend berjalan.

---

## Upload File

Upload development disimpan oleh backend di:

```text
backend/uploads/
```

Frontend mengirim file ke endpoint upload backend menggunakan multipart form data. Pada development, file dilayani pada URL dengan prefix:

```text
/uploads/
```

Untuk production, gunakan object storage eksternal seperti S3 atau R2 dan sesuaikan konfigurasi storage backend serta `remotePatterns` pada `my-app/next.config.ts`.

Jangan commit file upload milik user.

---

## Testing dan Build

### Backend

```bash
cd backend
npm run build
npm test
npm run test:e2e
npm run lint
```

### Frontend

```bash
cd my-app
npm run lint
npx tsc --noEmit
npm run build
```

Untuk production, jalankan hasil build frontend menggunakan `npm start` setelah server build sudah tersedia.

---

## Troubleshooting

### Frontend menampilkan `fetch failed` atau tidak bisa memuat data

- Pastikan backend berjalan di port `4000`.
- Pastikan `API_URL` pada `my-app/.env` mengarah ke backend.
- Pastikan tidak ada proses lain yang memakai port `3000` atau `4000`.
- Restart Next.js setelah mengubah environment variable.

### Login selalu gagal

- Pastikan `JWT_SECRET` backend tersedia.
- Pastikan database sudah dimigrasi dan di-seed.
- Pastikan kredensial yang digunakan sesuai dengan data seed.
- Pastikan `AUTH_SECRET` frontend sudah diisi.
- Pastikan `CORS_ORIGIN` mengizinkan origin frontend.

### Prisma Client belum tersedia

```bash
cd backend
npx prisma generate
```

### Koneksi database gagal

- Pastikan database berjalan.
- Periksa host, port, username, password, dan nama database pada `DATABASE_URL`.
- Jalankan `npx prisma migrate deploy` dari folder `backend`.

### Error pada migration

- Pastikan command dijalankan dari folder `backend`.
- Pastikan `prisma.config.ts` dapat membaca `DATABASE_URL`.
- Periksa status migration dengan `npx prisma migrate status`.

### Gambar upload tidak tampil

- Pastikan folder `backend/uploads/` dapat ditulis oleh backend.
- Pastikan URL upload dikembalikan oleh backend.
- Untuk localhost, pastikan `NEXT_PUBLIC_API_URL` dan `API_URL` menunjuk ke backend yang sama.
- Restart backend jika konfigurasi static serving berubah.

### Port sudah digunakan

Ganti `PORT` pada `backend/.env` atau hentikan proses yang memakai port tersebut. Jika port backend diganti, sesuaikan juga `API_URL` dan `NEXT_PUBLIC_API_URL` pada frontend.

---

## Catatan Repository

- Root `.gitignore` dibuat untuk mengabaikan dependency, env, build output, generated Prisma client, upload user, log, dan file sementara.
- `package-lock.json` sebaiknya ikut di-commit agar instalasi konsisten.
- Folder `node_modules`, `.next`, `dist`, `src/generated`, `uploads`, dan `.env` tidak perlu di-commit.
- Jika `my-app/.git` dan `backend/.git` akan digabungkan menjadi satu repository utama di folder `Furniture`, lakukan backing up terlebih dahulu sebelum menghapus metadata Git salah satu atau kedua folder.
- Dokumentasi detail frontend tersedia di [`my-app/README.md`](./my-app/README.md).
- Dokumentasi detail backend tersedia di [`backend/README.md`](./backend/README.md).

---

## License

Project ini bersifat private dan belum memiliki license open-source yang ditentukan. Jangan menggunakan data demo atau kredensial development di production.
