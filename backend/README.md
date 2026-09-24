# Furniture Backend — NestJS REST API

> Backend untuk aplikasi Furniture: API publik, dashboard admin, dashboard worker, autentikasi JWT, workflow approval, upload gambar, dan akses database MySQL melalui Prisma 7.

Folder `backend` berisi REST API yang digunakan oleh frontend Next.js di `../my-app`. Backend menjadi lapisan utama yang mengakses database dan menjalankan business logic aplikasi.

---

## Daftar Isi

- [Ringkasan](#ringkasan)
- [Arsitektur](#arsitektur)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Database dan Prisma](#database-dan-prisma)
- [Menjalankan Backend](#menjalankan-backend)
- [API Documentation](#api-documentation)
- [Domain Modules](#domain-modules)
- [Autentikasi dan Otorisasi](#autentikasi-dan-otorisasi)
- [Upload File](#upload-file)
- [Scripts](#scripts)
- [Testing](#testing)
- [Struktur Folder](#struktur-folder)
- [Troubleshooting](#troubleshooting)

---

## Ringkasan

Backend menyediakan API untuk:

- Menampilkan data company profile.
- Mengelola katalog produk dan kategori.
- Mengelola artikel dan galeri.
- Mengelola portofolio proyek.
- Menerima dan mengelola inquiry pelanggan.
- Mengautentikasi admin dan worker.
- Mengatur workflow approval konten worker.
- Mengunggah dan menyajikan file gambar.
- Mengirim notifikasi internal.
- Menyediakan statistik dashboard.

Frontend tidak melakukan query database secara langsung. Frontend melakukan request HTTP ke backend dan memperoleh response dalam format konsisten.

---

## Arsitektur

```text
HTTP Request
     │
     ▼
NestJS Middleware / Guards / Throttler
     │
     ▼
Controllers
     │
     ▼
Domain Services
     │
     ▼
Prisma Service + MariaDB Adapter
     │
     ▼
MySQL Database
```

### Layer aplikasi

- **Controller** mendefinisikan route HTTP dan menerima DTO.
- **Service** berisi business logic dan aturan domain.
- **Guard** melindungi endpoint dan memeriksa JWT/role.
- **Pipe** memvalidasi dan mengubah payload menjadi DTO.
- **Interceptor** membungkus response API.
- **Filter** mengubah error menjadi format response yang konsisten.
- **Prisma Service** menjadi gateway ke database.
- **Static serving** menyajikan file dari `uploads/`.

### Format response

Response sukses umumnya dibungkus dengan bentuk:

```json
{
  "success": true,
  "data": {}
}
```

Error handled secara terpusat oleh `HttpExceptionFilter` agar frontend dapat menerima pesan yang konsisten.

---

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Backend framework | NestJS 12 |
| Language | TypeScript |
| Module system | ES Modules |
| ORM | Prisma 7 |
| Database provider | MySQL |
| Runtime adapter | MariaDB driver adapter |
| Authentication | JWT + Passport |
| Password hashing | bcryptjs |
| API documentation | Swagger / OpenAPI |
| Validation | class-validator + class-transformer |
| Security/rate limit | Throttler |
| Testing | Vitest + Supertest |
| Lint | Oxlint |
| Format | Prettier |

---

## Prasyarat

- Node.js yang kompatibel dengan NestJS 12.
- npm.
- MySQL atau database yang kompatibel dengan MySQL.
- Database `furniture_db` dapat dibuat atau sudah tersedia.
- Port `4000` tersedia untuk backend.
- Frontend berjalan di port `3000` atau origin lain yang memang diizinkan oleh CORS.

Periksa versi Node:

```bash
node --version
npm --version
```

---

## Instalasi

```bash
cd backend
npm install
```

Buat file environment:

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

```bash
cp .env.example .env
```

Setelah itu, edit `backend/.env` dan sesuaikan konfigurasi database.

Generate Prisma Client:

```bash
npx prisma generate
```

---

## Environment Variables

Contoh konfigurasi development:

```env
DATABASE_URL="mysql://root:@localhost:3306/furniture_db"
JWT_SECRET="ganti-dengan-secret-minimal-32-karakter-backend"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
STORAGE_PROVIDER="local"
```

| Variable | Required | Keterangan |
|---|---:|---|
| `DATABASE_URL` | Ya | Connection string database MySQL |
| `JWT_SECRET` | Ya | Secret untuk menandatangani access token backend |
| `JWT_EXPIRES_IN` | Tidak | Masa berlaku JWT, default `8h` |
| `CORS_ORIGIN` | Tidak | Origin frontend yang diizinkan; dapat dipisahkan dengan koma |
| `PORT` | Tidak | Port backend, default `4000` |
| `STORAGE_PROVIDER` | Tidak | Provider storage; development menggunakan `local` |

### Security

- Jangan commit `.env`.
- Gunakan secret yang berbeda antara development dan production.
- Jangan memakai `JWT_SECRET` frontend di backend atau sebaliknya.
- Batasi `CORS_ORIGIN` hanya untuk origin yang diperlukan.
- Ganti seluruh kredensial demo sebelum deployment.

### CORS multi-origin

`CORS_ORIGIN` dapat menerima beberapa origin dengan koma:

```env
CORS_ORIGIN="http://localhost:3000,https://app.example.com"
```

---

## Database dan Prisma

Database dikelola dari folder backend. Schema berada di:

```text
prisma/schema.prisma
```

Prisma 7 menggunakan:

- `prisma.config.ts` untuk konfigurasi CLI dan URL database.
- `src/prisma/prisma.adapter.ts` untuk membuat adapter runtime.
- `src/prisma/prisma.service.ts` untuk injectable Prisma service.
- `src/generated/prisma` untuk generated Prisma Client.

Folder `src/generated/prisma` tidak di-commit karena dapat dibuat ulang dengan:

```bash
npx prisma generate
```

### Menjalankan migration production/umum

```bash
npx prisma migrate deploy
```

### Membuat migration baru ketika schema diubah

```bash
npx prisma migrate dev --name nama-perubahan
```

Gunakan `migrate dev` untuk development. Gunakan `migrate deploy` untuk menerapkan migration yang sudah tersedia di environment target.

### Melihat status migration

```bash
npx prisma migrate status
```

### Melihat database dengan Prisma Studio

```bash
npx prisma studio
```

### Seed data development

```bash
npm run db:seed
```

> Seed menghapus data dari tabel aplikasi dan mengisi ulang dengan data demo. Jangan jalankan pada database production atau database yang berisi data asli.

---

## Menjalankan Backend

Development dengan watch mode:

```bash
npm run start:dev
```

Backend tersedia di:

```text
http://localhost:4000
```

Production build:

```bash
npm run build
npm run start:prod
```

Debug mode:

```bash
npm run start:debug
```

Jangan menjalankan `npm run start:dev` dari root `Furniture`; jalankan dari folder `backend`.

---

## API Documentation

Swagger UI aktif pada:

```text
http://localhost:4000/api-docs
```

Swagger mendokumentasikan endpoint dan Bearer authentication. Untuk mencoba endpoint protected di Swagger:

1. Login melalui frontend atau endpoint `POST /auth/login`.
2. Salin `accessToken` dari response.
3. Klik **Authorize** pada Swagger.
4. Masukkan token dengan format `Bearer <accessToken>` atau token sesuai konfigurasi UI Swagger.
5. Jalankan endpoint yang membutuhkan autentikasi.

---

## Domain Modules

### Auth

Routes:

- `POST /auth/login`
- `GET /auth/me`

Login divalidasi dengan email dan password. Password dibandingkan menggunakan bcrypt. JWT kemudian digunakan untuk request protected.

### Users

Modul user digunakan untuk:

- Membuat worker.
- Mengaktifkan atau menonaktifkan worker.
- Reset password worker.
- Mengubah profil dan password akun sendiri.

### Products

Modul produk menangani:

- CRUD produk.
- Filter, search, kategori, dan pagination.
- Status produk.
- Produk unggulan.
- Metadata material, dimensi, warna, spesifikasi, dan gambar.
- Approval status untuk konten worker.

### Categories

Modul kategori menangani:

- CRUD kategori.
- Slug dan deskripsi kategori.
- Proteksi hapus kategori yang masih digunakan produk.
- Approval workflow untuk kategori dari worker.

### Articles

Modul artikel menangani:

- CRUD artikel.
- Editor HTML yang sudah disanitasi.
- Status `DRAFT` dan `PUBLISHED`.
- Tanggal publish.
- Thumbnail.
- Approval untuk artikel worker.

### Gallery

Modul galeri menangani:

- CRUD galeri.
- Metadata kategori galeri.
- Upload dan hapus gambar.
- Approval untuk entri galeri worker.

### Portfolios

Modul portofolio menangani:

- CRUD portofolio.
- Client, lokasi, tahun, deskripsi, dan status featured.
- Upload serta penghapusan gambar portofolio.

### Inquiries

Modul inquiry menangani:

- Pembuatan inquiry dari form publik.
- Data nama, email, WhatsApp, quantity, pesan, dan produk terkait.
- Status inquiry.
- Pencarian dan filter untuk admin.
- Changes status oleh admin atau worker.
- Pencatatan user yang menangani inquiry.

### Company Profile

Modul company profile menangani data singleton perusahaan:

- Nama, tagline, deskripsi, sejarah.
- Visi dan misi.
- Kontak dan WhatsApp.
- Alamat dan maps URL.
- Social media.
- Jam operasional.
- Logo dan hero image.

### Notifications

Modul notifikasi digunakan untuk menampilkan notifikasi approval dan aktivitas internal kepada admin/worker.

### Approvals

Modul approval digunakan untuk:

- Melihat queue pengajuan.
- Melihat jumlah pending submission.
- Approve pengajuan.
- Reject pengajuan dengan alasan.
- Mencatat aktivitas dan notifikasi.

### Upload

Modul upload menerima multipart file dari frontend, menyimpan file pada storage lokal development, dan mengembalikan URL yang dapat disimpan pada record produk, artikel, galeri, atau portofolio.

### Dashboard

Modul dashboard menyediakan statistik untuk admin dan ringkasan pekerjaan untuk worker.

---

## Autentikasi dan Otorisasi

### Role

Backend memakai dua role utama:

- `ADMIN` — managing seluruh data dan workflow.
- `WORKER` — mengelola data milik sendiri dan memproses inquiry sesuai permission.

### Header

Request protected harus menyertakan:

```http
Authorization: Bearer <backendAccessToken>
```

Frontend mengambil token dari session Auth.js melalui `lib/api/client.ts` dan mengirimkannya secara otomatis untuk request terautentikasi.

### Guards

- `JwtAuthGuard` memverifikasi token.
- `RolesGuard` memeriksa role endpoint.
- `@Roles('ADMIN')` membatasi endpoint untuk admin.
- `@Roles('ADMIN', 'WORKER')` mengizinkan admin dan worker.
- `ThrottlerGuard` membatasi frekuensi request, termasuk endpoint login dan inquiry.

### Ownership

Untuk data milik worker, service melakukan validasi ownership. Worker tidak boleh mengakses atau mengubah karya worker lain melalui ID yang hanya diketahui.

---

## Upload File

Development upload:

```text
backend/uploads/
```

Static files disajikan dari folder tersebut melalui:

```text
/uploads/*
```

Frontend mengirim multipart data ke endpoint upload, kemudian menggunakan URL yang dikembalikan backend.

### Batasan upload

- Tipe file harus divalidasi.
- Ukuran file dibatasi oleh konfigurasi backend dan Next.js.
- Jangan commit folder upload production.
- Untuk production, gunakan object storage eksternal seperti S3 atau R2.
- Pastikan URL storage dapat diakses oleh browser.

---

## Scripts

| Command | Fungsi |
|---|---|
| `npm run start` | Menjalankan backend |
| `npm run start:dev` | Development watch mode |
| `npm run start:debug` | Development dengan debugger |
| `npm run start:prod` | Menjalankan hasil build production |
| `npm run build` | Build backend |
| `npm run format` | Format kode dengan Prettier |
| `npm run lint` | Menjalankan Oxlint |
| `npm test` | Menjalankan test suite |
| `npm run test:watch` | Test watch mode |
| `npm run test:cov` | Test dengan coverage |
| `npm run test:debug` | Menjalankan test debug |
| `npm run test:e2e` | Menjalankan E2E test |
| `npm run db:seed` | Mengisi data demo |

---

## Testing

### Unit/integration test

```bash
npm test
```

### Coverage

```bash
npm run test:cov
```

### E2E test

```bash
npm run test:e2e
```

E2E test memerlukan konfigurasi database dan environment yang sesuai. Jangan menjalankan test yang mengubah database production.

### Quality check

```bash
npm run lint
npm run build
```

---

## Struktur Folder

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── util/
│   ├── config/
│   │   └── configuration.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── prisma.adapter.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── articles/
│   │   ├── gallery/
│   │   ├── portfolios/
│   │   ├── inquiries/
│   │   ├── company-profile/
│   │   ├── notifications/
│   │   ├── approvals/
│   │   ├── upload/
│   │   └── dashboard/
│   └── main.ts
├── test/
├── uploads/
├── prisma.config.ts
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── vitest.config.e2e.ts
├── .env.example
└── package.json
```

### `src/common/`

Berisi infrastructure yang dipakai lintas module:

- Guard dan decorator.
- Filter error.
- Interceptor response.
- Sanitization helper.
- Activity logging.

### `src/modules/`

Setiap module domain memiliki controller, service, module, dan DTO yang berkaitan. Business logic tidak perlu diekspos langsung ke frontend selain melalui endpoint yang sudah disusun pada controller.

### `src/main.ts`

Bootstrap aplikasi, konfigurasi CORS, pembuatan Swagger document, port listener, dan static serving.

---

## Troubleshooting

### Database connection failed

- Pastikan MySQL aktif.
- Periksa host, port, user, password, dan nama database.
- Pastikan firewall mengizinkan koneksi lokal.
- Jalankan `npx prisma migrate status` untuk memeriksa konfigurasi CLI.

### Prisma Client belum ter-generate

```bash
npx prisma generate
```

Pastikan command dijalankan dari folder `backend`.

### Port 4000 sudah digunakan

- Hentikan proses yang memakai port `4000`.
- Atau ubah `PORT` pada `.env`.
- Jika port diubah, sesuaikan `API_URL` dan `NEXT_PUBLIC_API_URL` di frontend.

### CORS error

- Pastikan frontend address sama dengan `CORS_ORIGIN`.
- Restart backend setelah mengubah `.env`.
- Untuk beberapa origin, pisahkan dengan koma.
- Jangan gunakan wildcard bersama credentials tanpa konfigurasi yang benar.

### Login selalu ditolak

- Pastikan `JWT_SECRET` tersedia.
- Pastikan database sudah di-seed.
- Pastikan password user benar.
- Pastikan `JWT_EXPIRES_IN` valid.
- Periksa log backend untuk error database atau validasi.

### Upload gagal

- Pastikan folder `uploads/` dapat ditulis.
- Pastikan folder upload tidak sedang dikunci oleh proses lain.
- Pastikan DTO/validasi file fulfilled.
- Pastikan static serving diarahkan ke folder `process.cwd()/uploads`.
- Pastikan backend dijalankan dari folder `backend`.

### Prisma migration gagal pada data lama

- Backup database sebelum mengubah migration.
- Periksa migration yang belum diterapkan.
- Jangan menghapus tabel secara manual tanpa backup.
- Untuk development, database kosong dan seed ulang dapat menjadi opsi, tetapi hanya jika data tidak diperlukan.

### Build gagal

```bash
npm run lint
npm run build
```

Periksa error TypeScript dan pastikan Prisma Client sudah di-generate.

---

## README Frontend

Dokumentasi lengkap frontend ada di:

```text
../my-app/README.md
```

Backend dan frontend harus memakai konfigurasi URL yang konsisten saat dijalankan bersamaan.
