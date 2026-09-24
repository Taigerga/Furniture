# Analisis Backend Saat Ini

## Konsep Utama: Server Actions (Bukan REST API)

Backend Anda **tidak pakai REST API** (`route.ts`), **tidak pakai Express/Fastify**, dan **tidak pakai NestJS**. Backend Anda menggunakan pola **Next.js Server Actions**.

---

## Arsitektur Aliran Data

```
UI (Server Component) → Server Action ("use server") → Service Layer → Prisma → MySQL
UI (Server Component) → Service (read-only)             → Prisma → MySQL
```

---

## Breakdown Lapisan Backend

| Lapisan | Lokasi | Fungsi |
|---------|--------|--------|
| **UI/Pages** | `app/**/page.tsx` | Server Components, memanggil Server Action & Service |
| **Server Actions** | `lib/actions/*.ts` (20 file) | Form handlers, validasi Zod, auth check, DB mutation, upload |
| **Services** | `services/*.ts` (8 file) | Read-only data access (query-only) |
| **Database** | `prisma/schema.prisma` + `lib/db.ts` | Prisma ORM → MySQL |
| **Utilities** | `lib/*.ts` | Auth, storage, upload, sanitization, rate limiting |

---

## Contoh Server Action

```ts
"use server"

export async function createProduct(formData: FormData) {
  // 1. Validasi dengan Zod
  // 2. Auth check (requireAdmin)
  // 3. File upload
  // 4. Prisma db.product.create()
  // 5. Activity log + notification
}
```

---

## API Skeleton (Masih Kosong)

Ada struktur folder `app/api/v1/` yang **semuanya kosong** — belum ada `route.ts` di manapun:

```
app/api/v1/
├── admin/
│   ├── articles/        ← kosong
│   ├── products/        ← kosong
│   ├── inquiries/       ← kosong
│   └── ... (semua kosong)
├── worker/
│   └── ... (semua kosong)
└── ...
```

Ini terlihat seperti **rencana masa depan** untuk memisahkan API endpoint (mungkin untuk mobile app atau integrasi eksternal).

---

## Auth & Middleware

### Authentication
- `next-auth` v5 (Auth.js) — JWT + Credentials provider + bcrypt

### Middleware
- `proxy.ts` — Edge Runtime, redirect role-based:
  - `/admin` → hanya ADMIN
  - `/worker` → hanya WORKER atau ADMIN

### In-App Guards (di setiap Server Action)
- `requireAdmin()`
- `requireWorker()`
- `requireOwnerOrAdmin()`
- `assertAdminCanModify()`

### Roles
| Role | Akses |
|------|-------|
| **ADMIN** | Full access (admin dashboard + worker dashboard) |
| **WORKER** | Worker dashboard only |

---

## Fitur Backend Lainnya

| Fitur | Implementasi |
|-------|-------------|
| **Approval Workflow** | DRAFT → PENDING → APPROVED/REJECTED (shadow columns untuk revisi) |
| **File Upload** | Custom (`lib/storage.ts` + `lib/upload.ts`) |
| **Rate Limiting** | In-memory (`lib/rate-limit.ts`) — untuk login & inquiry |
| **Content Sanitization** | `sanitize-html` |
| **Activity Logging** | `ActivityLog` model di Prisma |
| **Notifications** | DB-backed `Notification` model, load saat navigasi (bukan realtime) |
| **Real-time/WebSocket** | ❌ Tidak ada |
| **tRPC** | ❌ Tidak ada |
| **GraphQL** | ❌ Tidak ada |
| **Express/Fastify/NestJS** | ❌ Tidak ada (transitive deps only) |

---

## Data Models (Prisma Schema)

| Model | Key Fields | Catatan |
|-------|-----------|---------|
| **User** | id, email (unique), passwordHash, name, role, isActive | Role: ADMIN/WORKER |
| **Category** | id, name, slug (unique), description, approvalStatus | Shadow columns untuk revisi |
| **Product** | id, name, slug (unique), status, approvalStatus, categoryId | Status: ACTIVE/DRAFT/ARCHIVED |
| **ProductImage** | id, productId, url, alt, sortOrder, isMain | Cascade delete |
| **Portfolio** | id, title, slug (unique), client, location, year, description, featured | |
| **PortfolioImage** | id, portfolioId, url, alt, sortOrder | |
| **Article** | id, title, slug (unique), content (LongText), status, approvalStatus | Shadow columns untuk revisi |
| **Gallery** | id, title, url, category, approvalStatus | |
| **Inquiry** | id, name, email, whatsapp, quantity, message, status, productId | Status: NEW→CANCELLED |
| **CompanyProfile** | id, name, tagline, description, ... | Singleton |
| **Notification** | id, userId, type, title, message, link, isRead | Cascade delete |
| **ActivityLog** | id, actorId, action, entityType, entityId, fromStatus, toStatus, note | Audit trail |

### Enums

```prisma
enum Role { ADMIN, WORKER }
enum ApprovalStatus { DRAFT, PENDING, APPROVED, REJECTED }
enum ProductStatus { ACTIVE, DRAFT, ARCHIVED }
enum InquiryStatus { NEW, CONTACTED, PROCESSING, COMPLETED, CANCELLED }
enum ArticleStatus { DRAFT, PUBLISHED }
```

---

## Database

| Item | Detail |
|------|--------|
| **Provider** | MySQL |
| **ORM** | Prisma v6 |
| **Connection** | `lib/db.ts` (singleton pattern dengan globalThis) |
| **URL** | `DATABASE_URL="mysql://root:@localhost:3306/furniture_db"` |

---

## Seed Data

File: `prisma/seed.ts`

- 1 Admin user (`admin@furniture.local` / `Admin123!`)
- 1 Worker user (`worker@furniture.local` / `Worker123!`)
- 6 categories, 12 products, 3 portfolios, 3 articles
- 1 pending product + 1 pending article dari worker
- 6 gallery items, 5 inquiries, 1 company profile

---

---

## Struktur Folder & Pattern

### Tree Lengkap

```
E:\KerjaPraktek\Furniture\my-app\
│
├── app/                              # ← Next.js App Router (root-level, BUKAN src/app)
│   │
│   ├── (public)/                     # ← Route Group: halaman publik
│   │   ├── page.tsx                  #   Halaman utama (/)
│   │   ├── about/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── portfolio/[slug]/page.tsx
│   │   ├── articles/page.tsx
│   │   ├── articles/[slug]/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── layout.tsx                #   Layout bersama halaman publik
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── (auth)/                       # ← Route Group: halaman autentikasi
│   │   └── login/page.tsx
│   │
│   ├── admin/                        # ← Route Group: dashboard admin (role-protected)
│   │   ├── page.tsx                  #   Dashboard admin
│   │   ├── layout.tsx                #   Layout admin (redirect non-ADMIN)
│   │   ├── approvals/page.tsx
│   │   ├── articles/page.tsx
│   │   ├── articles/[id]/page.tsx
│   │   ├── articles/new/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── company-profile/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── inquiries/page.tsx
│   │   ├── inquiries/[id]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── portfolios/page.tsx
│   │   ├── portfolios/[id]/page.tsx
│   │   ├── portfolios/new/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── workers/page.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   │
│   ├── worker/                       # ← Route Group: dashboard worker (role-protected)
│   │   ├── page.tsx                  #   Dashboard worker
│   │   ├── layout.tsx                #   Layout worker (redirect non-WORKER/ADMIN)
│   │   ├── articles/page.tsx
│   │   ├── articles/[id]/page.tsx
│   │   ├── articles/new/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── inquiries/page.tsx
│   │   ├── inquiries/[id]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── submissions/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   │
│   ├── api/v1/                       # ← Skeleton API routes (KOSONG, belum diimplementasi)
│   │   ├── admin/
│   │   │   ├── approvals/            ← kosong
│   │   │   ├── articles/             ← kosong
│   │   │   ├── categories/           ← kosong
│   │   │   ├── company/              ← kosong
│   │   │   ├── dashboard/            ← kosong
│   │   │   ├── gallery/              ← kosong
│   │   │   ├── inquiries/            ← kosong
│   │   │   ├── portfolios/           ← kosong
│   │   │   ├── products/[id]/        ← kosong
│   │   │   └── workers/              ← kosong
│   │   ├── articles/[slug]/          ← kosong
│   │   ├── portfolios/[slug]/        ← kosong
│   │   ├── products/[slug]/          ← kosong
│   │   └── worker/
│   │       ├── articles/             ← kosong
│   │       ├── gallery/              ← kosong
│   │       ├── inquiries/            ← kosong
│   │       ├── products/             ← kosong
│   │       └── submissions/          ← kosong
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── icon.svg
│   ├── robots.ts
│   ├── sitemap.ts
│   └── layout.tsx                    # Root layout
│
├── components/                       # ← Shared UI components
│   ├── admin/
│   ├── auth/
│   ├── notifications/
│   ├── public/
│   └── worker/
│
├── features/                         # ← Placeholder directories (belum diisi)
│   ├── articles/
│   ├── categories/
│   ├── dashboard/
│   ├── gallery/
│   ├── inquiries/
│   ├── portfolios/
│   ├── products/
│   └── workers/
│
├── lib/                              # ← Core libraries, utilities, Server Actions
│   │
│   ├── actions/                      # ← Server Actions (use server") — 20 file
│   │   ├── account.ts                #   Worker account update, password change
│   │   ├── approvals.ts              #   Admin approve/reject workflow
│   │   ├── articles.ts               #   Admin CRUD articles
│   │   ├── auth.ts                   #   Login/logout actions
│   │   ├── categories.ts             #   Admin CRUD categories
│   │   ├── company.ts                #   Company profile update
│   │   ├── gallery.ts                #   Admin CRUD gallery
│   │   ├── helpers.ts                #   Auth guards (requireAdmin, requireWorker, etc.)
│   │   ├── inquiries.ts              #   Admin inquiry status management
│   │   ├── inquiry.ts                #   Public inquiry submission (rate limited)
│   │   ├── notifications.ts          #   Mark notification read
│   │   ├── portfolios.ts             #   Admin CRUD portfolios
│   │   ├── products.ts               #   Admin CRUD products (multi-upload)
│   │   ├── worker-articles.ts        #   Worker CRUD articles (shadow/pending revision)
│   │   ├── worker-categories.ts      #   Worker CRUD categories
│   │   ├── worker-gallery.ts         #   Worker CRUD gallery
│   │   ├── worker-inquiries.ts       #   Worker process inquiries
│   │   ├── worker-products.ts        #   Worker CRUD products (shadow/pending revision)
│   │   ├── workers.ts                #   Admin manage worker accounts
│   │   └── workflow.ts               #   Activity logging, notification dispatch
│   │
│   ├── db.ts                         #   Prisma client singleton (globalThis pattern)
│   ├── auth.ts                       #   Auth.js configuration & session handling
│   ├── sanitize.ts                   #   HTML sanitization (sanitize-html)
│   ├── storage.ts                    #   File storage logic (local dev)
│   ├── upload.ts                     #   Image upload validation (magic bytes)
│   └── rate-limit.ts                 #   In-memory rate limiting
│
├── services/                         # ← Business logic layer (read-only Prisma queries)
│   └── (8 files — one per domain)
│
├── shared/                           # ← Shared UI primitives
│   └── ui/                           #   (kosong)
│
├── types/                            #   (kosong)
│
├── prisma/                           # ← Database layer
│   ├── schema.prisma                 #   Schema + models + enums
│   ├── seed.ts                       #   Seed data
│   └── migrations/                   #   Migration history
│
├── scripts/                          #   (kosong)
│
├── public/                           # ← Static assets (images, fonts, etc.)
│
├── .agents/                          # ← Agent skill configurations
│   └── skills/
│       ├── design-taste-frontend/
│       ├── next-dev-loop/
│       ├── next-cache-components-adoption/
│       └── next-partial-prefetching-adoption/
│
├── .git/
├── .env                              # Environment (MySQL local)
├── .env.example                      # Template with R2/S3 placeholders
├── next.config.ts
├── package.json
├── package-lock.json
├── proxy.ts                          # ← Edge middleware (auth redirects)
├── tsconfig.json
└── README.md
```

---

### Penjelasan Pattern & Konvensi

#### 1. **App Router di Root (`app/`)**
- Project menggunakan **Next.js 16 App Router** dengan folder `app/` langsung di root (bukan `src/app/`).
- Setiap halaman didefinisikan sebagai **Server Component** (`page.tsx`) secara default.
- Client Components hanya digunakan untuk interaktivitas spesifik (form, galeri, editor Tiptap, upload dropzone).

#### 2. **Route Groups (`(public)`, `(auth)`, `admin`, `worker`)**
- Tanda kurung `()` pada nama folder membuat **Route Group** — mengelompokkan rute tanpa mempengaruhi URL.
- Contoh: `app/(public)/about/page.tsx` → URL: `/about`
- **Layout per group**: Setiap group punya `layout.tsx` sendiri untuk layout yang berbeda (misal layout admin punya sidebar & redirect auth).
- **Guard di layout**: `app/admin/layout.tsx` dan `app/worker/layout.tsx` memeriksa role via `auth()` dan `redirect()` jika user tidak berwenang.

#### 3. **Server Actions (`lib/actions/`)**
- Semua operasi CRUD dan form handling dilakukan sebagai **Server Actions** (`"use server"`).
- **Naming convention**: Dinamis berdasari domain, misal `products.ts`, `articles.ts`, `inquiries.ts`.
- **Variasi per role**: Ada versi terpisah untuk admin dan worker (misal `worker-products.ts` vs `products.ts`) karena logikanya berbeda (worker punya shadow/pending revision system).
- **`helpers.ts`**: Berisi guard functions (`requireAdmin`, `requireWorker`, dll.) yang dipanggil di setiap Server Action untuk validasi otorisasi.
- **`workflow.ts`**: Utility untuk activity logging dan notification dispatch (cross-cutting concern).

#### 4. **Services (`services/`)**
- Lapisan **read-only** — hanya berisi query/data fetching menggunakan Prisma.
- **Tidak ada mutation** — semua mutation ada di Server Actions.
- Pemisahan ini membuat halaman bisa langsung memanggil Service untuk membaca data tanpa melalui Server Action.

#### 5. **API Skeleton (`app/api/v1/`)**
- Struktur folder sudah dibuat sesuai domain (admin, worker, public) tetapi **semua kosong**.
- Kemungkinan besar direncanakan untuk:
  - API endpoint eksternal (mobile app, pihak ketiga)
  - Webhook handlers
  - Atau pemisahan antara halaman web dan API
- **Bukan REST API saat ini** — tidak ada `route.ts` yang mengimplementasikan GET/POST/PUT/PATCH/DELETE.

#### 6. **Features (`features/`) — Placeholder**
- 8 folder kosong: `articles`, `categories`, `dashboard`, `gallery`, `inquiries`, `portfolios`, `products`, `workers`.
- Ini adalah **markir perencanaan** — belum diisi kode. Mungkin nanti akan diisi dengan feature-based organization jika project berkembang.

#### 7. **Shared Components (`components/`)**
- Dikelompokkan berdasarkan context: `admin/`, `auth/`, `notifications/`, `public/`, `worker/`.
- Pattern: komponen UI yang digunakan lintas halaman diletakkan di sini, bukan di halaman spesifik.

#### 8. **Utilities (`lib/`)**
- **`lib/db.ts`**: Singleton Prisma Client menggunakan `globalThis` pattern (mencegah multiple instance di dev mode Next.js).
- **`lib/auth.ts`**: Konfigurasi Auth.js v5 + handler session/callback.
- **`lib/sanitize.ts`**: Sanitasi HTML konten artikel menggunakan `sanitize-html`.
- **`lib/storage.ts`** & **`lib/upload.ts`**: Penanganan file upload (storage lokal dev + validasi image).
- **`lib/rate-limit.ts`**: Rate limiting in-memory untuk endpoint sensitif (login, inquiry).

#### 9. **Middleware (`proxy.ts`)**
- Next.js 16 menggunakan `proxy.ts` (bukan `middleware.ts`) sebagai Edge Middleware.
- Bertugas sebagai **guard**: redirect user ke `/login` jika tidak punya role yang sesuai.
- **Matcher**: Hanya mempengaruhi `/admin/*` dan `/worker/*` (bukan halaman publik).

#### 10. **Prisma Layer (`prisma/`)**
- **Schema-first approach**: Semua model didefinisikan di `schema.prisma`.
- **Shadow Columns Pattern**: Entity seperti Article, Category, Gallery punya kolom `pending*` (misal `pendingTitle`, `pendingContent`) untuk menyimpan draft revisi yang belum di-approve.
- **Approval Workflow Pattern**: `approvalStatus` (DRAFT/PENDING/APPROVED/REJECTED) + `submittedAt`, `reviewedById`, `reviewedAt`, `rejectionReason`.
- **Ownership Pattern**: `createdById` pada kebanyakan entity untuk ownership-based authorization.
- **Activity Log Pattern**: `ActivityLog` mencatat semua aksi actor untuk audit trail.

#### 11. **Prisma Naming Conventions**

| Prefix | Makna |
|--------|-------|
| `createdById` | User yang membuat data awal |
| `reviewedById` | User yang meninjau/menyetujui |
| `handledById` | User yang menangani (untuk Inquiry) |
| `pending*` | Draft revisi (belum di-approve) |
| `submittedAt` | Waktu pengiriman untuk approval |
| `reviewedAt` | Waktu persetujuan/penolakan |

---

## Ringkasan

> **Backend = Next.js 16 App Router + Server Actions + Prisma + MySQL + Auth.js**
>
> Bukan REST API, bukan NestJS, bukan Express. Semua CRUD dilakukan via `"use server"` functions yang dipanggil langsung dari Server Components.
>
> **Pattern utama**: UI → Server Action → Service → Prisma → MySQL, dengan role-based auth, approval workflow, dan shadow column revision system.

---

## ⚠️ Catatan Terkait MCP-Nest

Karena backend Anda **bukan NestJS** (murni Next.js), maka `@rekog/mcp-nest` (yang merupakan **NestJS module**) **belum bisa langsung digunakan** di project Anda.

Opsi MCP yang sudah terinstall dan bisa dipakai:

| Package | Versi | Fungsi |
|---------|-------|--------|
| `@yukihito/mysql-mcp-server` | `^1.0.2` | Expose MySQL tools ke AI |
| `tailwindcss-mcp-server` | `^0.1.1` | Tailwind CSS tools |
| `@modelcontextprotocol/*` | `^2.0.0` | MCP protocol core/server/node |

---

*Analisis dibuat berdasarkan kondisi project pada September 2026.*
