# PROMPT: Migrasi Arsitektur Furniture Web App — Next.js Fullstack → Next.js (Frontend) + NestJS (Backend) via REST API

## KONTEKS PROJECT SAAT INI

Project ada di `Furniture/my-app/` dan saat ini **fullstack dalam satu folder Next.js**:

- Next.js 16 App Router (`app/` di root, bukan `src/app/`)
- Backend logic memakai **Server Actions** (`"use server"`) di `lib/actions/*.ts` (20 file)
- Read-only query layer di `services/*.ts` (8 file)
- Database: MySQL + Prisma v6 (`prisma/schema.prisma`)
- Auth: `next-auth` v5 (Auth.js) — JWT + Credentials provider + bcrypt
- Middleware: `proxy.ts` (Edge Runtime) — redirect role-based (`/admin` → ADMIN, `/worker` → WORKER/ADMIN)
- Ada folder skeleton `app/api/v1/` yang semua isinya kosong (belum ada `route.ts`)
- Fitur: approval workflow (DRAFT→PENDING→APPROVED/REJECTED dengan shadow columns), file upload custom, rate limiting in-memory, HTML sanitization, activity log, notifikasi (DB-backed, bukan realtime)
- Model Prisma: User, Category, Product, ProductImage, Portfolio, PortfolioImage, Article, Gallery, Inquiry, CompanyProfile, Notification, ActivityLog

## TUJUAN MIGRASI

Pisahkan project menjadi **dua repository/folder terpisah** dalam satu parent folder `Furniture/`:

```
Furniture/
├── my-app/     ← Next.js (FRONTEND SAJA — presentation layer, tidak ada akses Prisma/DB langsung)
└── backend/    ← NestJS (BACKEND SAJA — semua business logic, Prisma, REST API)
```

**PENTING — batasan lokasi folder (WAJIB DIPATUHI):**
- `backend/` **HARUS** dibuat **di luar** `my-app/`, sejajar sebagai sibling folder, **BUKAN** di dalam `my-app/backend` atau subfolder manapun di dalam `my-app/`.
- `my-app/` tetap nama folder frontend Next.js seperti sekarang, jangan diubah namanya atau dipindah.
- Struktur akhir yang benar: `Furniture/my-app/` (frontend) dan `Furniture/backend/` (backend), keduanya sejajar di bawah `Furniture/`.

Komunikasi antara keduanya memakai **REST API murni** (bukan Server Actions, bukan tRPC, bukan GraphQL).

---

## LANGKAH 1 — SETUP PROJECT NESTJS BARU

1. Buat project NestJS baru di `Furniture/backend/` menggunakan Nest CLI (`nest new backend` dijalankan dari dalam folder `Furniture/`, atau generate manual dengan struktur yang sama).
2. Install dependency yang dibutuhkan:
   - `@nestjs/config` — environment config
   - `@prisma/client` + `prisma` — ORM (schema akan dipindah dari `my-app/prisma`)
   - `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local` — autentikasi JWT
   - `bcrypt` — hashing password (pola yang sama seperti sekarang)
   - `class-validator`, `class-transformer` — validasi DTO (pengganti Zod di Server Actions)
   - `sanitize-html` — pindahkan logic dari `lib/sanitize.ts`
   - `@nestjs/throttler` — pengganti `lib/rate-limit.ts` (in-memory rate limit) dengan solusi resmi Nest
   - `multer` + `@nestjs/platform-express` (sudah bundled) — file upload, pengganti `lib/upload.ts`
   - `@nestjs/swagger` — dokumentasi API otomatis (sangat direkomendasikan supaya frontend tahu kontrak API)

## LANGKAH 2 — STRUKTUR FOLDER NESTJS YANG DIREKOMENDASIKAN

Gunakan pola **modular per-domain**, mengikuti konvensi resmi NestJS dan menyesuaikan dengan domain yang sudah ada di `lib/actions/` dan `services/`:

```
Furniture/backend/
├── src/
│   ├── main.ts                        # Bootstrap app, enable CORS, global pipes/filters
│   ├── app.module.ts                  # Root module, import semua feature module
│   │
│   ├── config/
│   │   ├── configuration.ts           # Load & validasi env vars (pakai @nestjs/config)
│   │   └── validation.schema.ts       # Joi/Zod schema untuk validasi env
│   │
│   ├── common/                        # Cross-cutting concerns
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts     # @Roles('ADMIN', 'WORKER')
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts         # Pengganti requireAdmin/requireWorker/requireOwnerOrAdmin
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts   # Standarisasi format response
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── utils/
│   │       ├── sanitize.util.ts       # Pindahan dari lib/sanitize.ts
│   │       └── activity-log.util.ts   # Pindahan dari lib/actions/workflow.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts           # Global module
│   │   └── prisma.service.ts          # Singleton PrismaClient (pengganti lib/db.ts)
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts     # POST /auth/login, /auth/logout, /auth/refresh
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/                     # User & worker account management (pengganti workers.ts, account.ts)
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │
│   │   ├── products/                  # Pengganti lib/actions/products.ts + worker-products.ts + services/products
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       └── update-product.dto.ts
│   │   │
│   │   ├── categories/                # Pengganti categories.ts + worker-categories.ts
│   │   ├── portfolios/                # Pengganti portfolios.ts
│   │   ├── articles/                  # Pengganti articles.ts + worker-articles.ts
│   │   ├── gallery/                   # Pengganti gallery.ts + worker-gallery.ts
│   │   ├── inquiries/                 # Pengganti inquiries.ts + inquiry.ts + worker-inquiries.ts
│   │   ├── company-profile/           # Pengganti company.ts
│   │   ├── notifications/             # Pengganti notifications.ts
│   │   ├── approvals/                 # Pengganti approvals.ts (approval workflow DRAFT/PENDING/APPROVED/REJECTED)
│   │   └── upload/                    # Pengganti lib/upload.ts + lib/storage.ts
│   │       ├── upload.module.ts
│   │       ├── upload.controller.ts
│   │       └── upload.service.ts
│   │
│   └── shared/
│       └── types/                     # Shared enums/interfaces yang dipakai lintas module
│
├── prisma/
│   ├── schema.prisma                  # PINDAHKAN dari my-app/prisma/schema.prisma, sesuaikan output path
│   ├── seed.ts                        # PINDAHKAN dari my-app/prisma/seed.ts
│   └── migrations/                    # PINDAHKAN seluruh history migrasi
│
├── uploads/                           # Local file storage (dev), sesuaikan dgn lib/storage.ts lama
├── test/                              # e2e tests NestJS
├── .env                               # DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN, dll
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

**Aturan penamaan & konvensi NestJS yang harus diikuti opencode:**
- Satu module = satu domain, masing-masing punya `*.module.ts`, `*.controller.ts`, `*.service.ts`, dan folder `dto/`.
- Validasi input pakai `class-validator` decorator di DTO (pengganti langsung Zod schema yang ada di tiap Server Action).
- Semua akses Prisma HARUS lewat `PrismaService` yang di-inject, jangan bikin instance baru di tiap service.
- Role-based guard (`RolesGuard` + `@Roles()` decorator) menggantikan `requireAdmin()`, `requireWorker()`, `requireOwnerOrAdmin()`, `assertAdminCanModify()` dari `lib/actions/helpers.ts` — logic-nya dipindah, bukan dihapus.
- Variasi endpoint admin vs worker untuk domain yang sama (misal products) direkomendasikan tetap dipisah lewat route prefix (`/admin/products` vs `/worker/products`) di controller yang sama atau controller terpisah dalam satu module, **jangan digabung logic-nya** karena ada perbedaan shadow/pending revision system.
- Pertahankan pola **shadow columns** (`pending*` fields) dan **approval workflow** (`approvalStatus`, `submittedAt`, `reviewedById`, `reviewedAt`, `rejectionReason`) persis seperti skema Prisma yang sudah ada — ini murni dipindah, bukan didesain ulang.
- Pertahankan pola **Activity Log** (`ActivityLog` model) dan **Notification** (`Notification` model, load saat navigasi, bukan realtime) sebagai service/util yang dipanggil dari service lain setelah mutation, sama seperti `workflow.ts` sekarang.

## LANGKAH 3 — DESAIN REST API (SWAGGER-READY)

Rancang endpoint REST konsisten, contoh pola:

| Method | Endpoint | Pengganti dari |
|--------|----------|-----------------|
| `POST` | `/auth/login` | `lib/actions/auth.ts` |
| `POST` | `/auth/logout` | `lib/actions/auth.ts` |
| `GET`  | `/products` | `services/products` (public, read) |
| `GET`  | `/products/:slug` | `services/products` |
| `POST` | `/admin/products` | `lib/actions/products.ts` |
| `PATCH`| `/admin/products/:id` | `lib/actions/products.ts` |
| `DELETE`| `/admin/products/:id` | `lib/actions/products.ts` |
| `POST` | `/worker/products` | `lib/actions/worker-products.ts` (submit pending revision) |
| `PATCH`| `/admin/approvals/:type/:id` | `lib/actions/approvals.ts` |
| `POST` | `/inquiries` | `lib/actions/inquiry.ts` (public, rate limited) |
| `GET`  | `/admin/inquiries` | `lib/actions/inquiries.ts` |
| `POST` | `/upload` | `lib/upload.ts` + `lib/storage.ts` |
| `GET`  | `/notifications` | `lib/actions/notifications.ts` |

Gunakan pola ini untuk seluruh domain lain (categories, portfolios, articles, gallery, company-profile, workers/users). Semua route admin/worker WAJIB dilindungi `JwtAuthGuard` + `RolesGuard`.

Aktifkan **CORS** di `main.ts` agar hanya origin frontend Next.js (`CORS_ORIGIN` dari `.env`) yang boleh akses.

## LANGKAH 4 — MIGRASI DATABASE LAYER

1. Copy `my-app/prisma/schema.prisma`, `my-app/prisma/seed.ts`, dan `my-app/prisma/migrations/` ke `backend/prisma/`.
2. Pastikan `DATABASE_URL` di `backend/.env` mengarah ke database MySQL yang sama (`furniture_db`).
3. Setelah backend jalan dan schema tervalidasi, **hapus** folder `prisma/` dari `my-app/` — frontend tidak boleh lagi punya akses Prisma langsung.
4. Hapus dependency `@prisma/client` dan `prisma` dari `my-app/package.json`.

## LANGKAH 5 — RESTRUKTUR FOLDER NEXT.JS (FRONTEND SAJA)

Struktur `my-app/` setelah migrasi:

```
Furniture/my-app/
├── app/                        # TETAP App Router, tapi HANYA presentation layer
│   ├── (public)/                # Halaman publik, fetch data lewat lib/api/*
│   ├── (auth)/login/
│   ├── admin/                   # UI dashboard admin, fetch lewat lib/api/*
│   ├── worker/                  # UI dashboard worker
│   └── layout.tsx
│
├── components/                 # TETAP seperti sekarang (admin/, auth/, notifications/, public/, worker/)
│
├── lib/
│   ├── api/                    # BARU — pengganti lib/actions/*, jadi API client layer
│   │   ├── client.ts           # fetch wrapper: base URL backend, attach Authorization header, error handling
│   │   ├── products.ts         # getProducts(), createProduct(), updateProduct(), dst — panggil REST API backend
│   │   ├── categories.ts
│   │   ├── articles.ts
│   │   ├── portfolios.ts
│   │   ├── gallery.ts
│   │   ├── inquiries.ts
│   │   ├── notifications.ts
│   │   ├── approvals.ts
│   │   ├── company.ts
│   │   └── workers.ts
│   │
│   └── auth.ts                 # next-auth v5 config — TETAP DIPAKAI, lihat Langkah 6
│
├── services/                   # DIHAPUS — fungsinya digantikan lib/api/* (fetch ke backend, bukan Prisma)
├── features/                   # TETAP (placeholder, belum diisi)
├── shared/, types/             # TETAP
├── public/
├── proxy.ts                    # TETAP — tetap berfungsi sebagai role-based route guard di Edge
├── next.config.ts
├── package.json                 # Hapus dependency: @prisma/client, prisma, bcrypt (pindah semua ke backend), sanitize-html (kalau tidak dipakai lagi di frontend)
└── .env                          # Sisakan: NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_API_URL (atau API_URL server-side)
```

**Aturan wajib untuk opencode saat migrasi frontend:**
- **Hapus total** folder `lib/actions/` (20 file Server Actions) setelah semua logic-nya dipastikan sudah dipindah 1:1 ke module NestJS terkait.
- **Hapus** folder `services/` di `my-app/`, ganti semua pemanggilan `services/*` di Server Component dengan pemanggilan fungsi dari `lib/api/*` (fetch ke backend, bisa tetap dipanggil langsung di Server Component karena Next.js App Router mendukung `fetch` di server-side).
- Form yang sebelumnya submit ke Server Action (`action={createProduct}`) diubah jadi **Client Component** dengan `onSubmit` handler yang memanggil fungsi dari `lib/api/*`, ATAU tetap pakai Server Action **tipis** yang isinya cuma memanggil REST API backend (bukan Prisma langsung) — pilih salah satu pola dan konsisten di seluruh project. **Rekomendasi**: pakai Server Action tipis sebagai proxy ke REST API, supaya UX form (progressive enhancement, `useFormState`, loading state) tetap sama seperti sekarang, tapi isi actionnya cuma `fetch()` ke backend, bukan Prisma.
- Folder skeleton `app/api/v1/` yang selama ini kosong **boleh dihapus** karena rest API sekarang sepenuhnya di NestJS, bukan di Next.js Route Handlers.

## LANGKAH 6 — STRATEGI AUTENTIKASI (PALING KRITIKAL, BACA BAIK-BAIK)

Karena auth sekarang harus lintas dua server terpisah, gunakan pola berikut:

1. **NestJS** jadi satu-satunya sumber kebenaran untuk autentikasi: endpoint `POST /auth/login` menerima email+password, verifikasi lewat `bcrypt.compare`, dan mengembalikan **JWT access token** (dan opsional refresh token).
2. **Next.js tetap pakai `next-auth` v5** untuk menjaga session di sisi frontend (supaya `proxy.ts`, `auth()` di layout, dan role-based redirect yang sudah ada TIDAK perlu ditulis ulang dari nol):
   - Ubah `authorize()` di Credentials provider: bukan lagi query Prisma langsung, tapi **panggil `POST /auth/login` ke backend NestJS**.
   - Simpan JWT access token dari response backend ke dalam **next-auth JWT callback** (`token.backendAccessToken = ...`), lalu expose ke `session` lewat `session` callback.
   - Di `lib/api/client.ts`, ambil `session.backendAccessToken` (lewat `auth()` di server-side) dan kirim sebagai header `Authorization: Bearer <token>` ke setiap request ke NestJS.
3. Dengan pola ini: `proxy.ts` (Edge middleware) dan guard di `layout.tsx` admin/worker **tidak perlu diubah** karena mereka baca session next-auth seperti biasa. NestJS tetap independen dan bisa dites/dipakai client lain (mobile app dsb) tanpa bergantung ke next-auth sama sekali.
4. `JwtStrategy` di NestJS verifikasi token dengan `JWT_SECRET` yang **HARUS SAMA** nilainya antara `backend/.env` dan dipakai saat sign token — pastikan tidak tertukar dengan `NEXTAUTH_SECRET` di `my-app/.env` (dua secret yang berbeda, jangan disamakan).

## LANGKAH 7 — FILE UPLOAD

- Pindahkan logic `lib/upload.ts` (validasi magic bytes) dan `lib/storage.ts` (penyimpanan lokal dev) ke `backend/src/modules/upload/`.
- Buat endpoint `POST /upload` di NestJS pakai `multer` (`FileInterceptor`), validasi tipe file & ukuran sama seperti sekarang.
- Frontend Next.js kirim file lewat `FormData` ke endpoint ini, bukan lagi upload langsung dari Server Action.
- File yang sudah ter-upload diakses lewat URL statis yang di-serve NestJS (`ServeStaticModule`) atau tetap arahkan ke rencana S3/R2 yang sudah ada placeholder-nya di `.env.example` lama.

## LANGKAH 8 — RATE LIMITING & SANITIZATION

- Ganti `lib/rate-limit.ts` (in-memory) dengan `@nestjs/throttler` di NestJS, terapkan di endpoint `POST /auth/login` dan `POST /inquiries` (menyamai proteksi yang sudah ada sekarang).
- Pindahkan `lib/sanitize.ts` (`sanitize-html`) jadi util di `backend/src/common/utils/sanitize.util.ts`, dipanggil di service Article/Category sebelum data disimpan ke DB — **jangan lagi sanitize di frontend**.

## LANGKAH 9 — ENVIRONMENT VARIABLES

**`backend/.env`:**
```
DATABASE_URL="mysql://root:@localhost:3306/furniture_db"
JWT_SECRET="<random-secret-baru>"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
```

**`my-app/.env`:**
```
NEXTAUTH_SECRET="<tetap-seperti-sekarang>"
NEXTAUTH_URL="http://localhost:3000"
API_URL="http://localhost:4000"   # dipakai server-side di lib/api/client.ts
```

## LANGKAH 10 — URUTAN EKSEKUSI YANG DIREKOMENDASIKAN UNTUK OPENCODE

1. Setup skeleton NestJS di `Furniture/backend/` + install semua dependency.
2. Pindahkan `prisma/schema.prisma`, migrations, dan seed ke backend, jalankan `prisma generate` di backend.
3. Bangun module `prisma` (PrismaService) dan module `auth` (JWT) lebih dulu — semua module lain bergantung ke ini.
4. Bangun module domain satu per satu sambil mem-porting logic dari `lib/actions/*.ts` dan `services/*.ts` yang berpasangan (contoh: `products.ts` + `worker-products.ts` + `services/products.ts` → `modules/products/`).
5. Setelah semua endpoint backend siap dan bisa dites lewat Swagger (`/api-docs`), baru mulai ubah frontend: buat `lib/api/*`, ubah `authorize()` next-auth, lalu satu per satu ganti pemanggilan Server Action/Service lama di tiap halaman dengan pemanggilan `lib/api/*`.
6. Hapus `lib/actions/`, `services/`, `prisma/` dari `my-app/` HANYA setelah semua halaman dikonfirmasi jalan lewat backend baru.
7. Update `README.md` di kedua folder menjelaskan cara menjalankan dua server terpisah (`npm run dev` di `my-app/` port 3000, `npm run start:dev` di `backend/` port 4000).

## CATATAN TAMBAHAN

- Jangan ubah nama folder `my-app`.
- Jangan buat `backend` di dalam `my-app`.
- Pertahankan seluruh nama model, enum, dan field Prisma persis sama (`Role`, `ApprovalStatus`, `ProductStatus`, `InquiryStatus`, `ArticleStatus`, dst) supaya tidak perlu migration data ulang.
- Fitur, tampilan, dan alur bisnis (approval workflow, shadow column revision, role admin/worker) TIDAK BOLEH berubah perilakunya — migrasi ini murni pemisahan arsitektur, bukan penulisan ulang fitur.