# Furniture Backend (NestJS)

REST API untuk frontend Next.js di `../my-app`. Satu-satunya lapisan yang boleh
mengakses database (MySQL + Prisma v7 via driver adapter MariaDB).

## Persiapan

```bash
npm install
npx prisma generate
```

Isi `.env` (lihat `.env.example`):

```
DATABASE_URL="mysql://root:@localhost:3306/furniture_db"
JWT_SECRET="<secret-min-32-karakter, BEDA dari NEXTAUTH_SECRET frontend>"
JWT_EXPIRES_IN="8h"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
```

> Prisma 7: URL database untuk CLI ada di `prisma.config.ts` (baca dari
> `DATABASE_URL` yang sama); runtime memakai driver adapter MariaDB yang
> dibangun dari URL tersebut di `src/prisma/prisma.adapter.ts`. Client
> ter-generate di `src/generated/prisma` (git-ignored).

Pastikan database sudah dimigrasi lalu seed (dari folder ini):

```bash
npx prisma migrate deploy
npm run db:seed   # admin@furniture.local / Admin123! | worker@furniture.local / Worker123!
```

## Menjalankan

```bash
npm run start:dev   # http://localhost:4000, Swagger: http://localhost:4000/api-docs
npm run build       # verifikasi kompilasi
```

## Struktur

- `src/config` — env config (`@nestjs/config`)
- `src/common` — `Roles()` decorator, `JwtAuthGuard`, `RolesGuard`
  (pengganti `requireAdmin/requireWorker/requireOwnerOrAdmin`), filter,
  interceptor envelope `{ success, data }`, `sanitize.util`
  (pindahan `lib/sanitize.ts`), `ActivityService` (pindahan `lib/actions/workflow.ts`)
- `src/prisma` — `PrismaService` global (pengganti `lib/db.ts`)
- `src/modules/auth` — `POST /auth/login` (rate limit 10x/10 mnt), `GET /auth/me`
- `src/modules/{users,products,categories,articles,gallery,portfolios,inquiries,company-profile,notifications,approvals,upload,dashboard}`
  - Public: `GET /products`, `/categories`, `/articles`, `/gallery`,
    `/portfolios`, `/company-profile`, `POST /inquiries` (rate limit 5x/10 mnt),
    `GET /public/counts`
  - Admin (`@Roles('ADMIN')`): prefix `/admin/...`
  - Worker (`@Roles('ADMIN','WORKER')`): prefix `/worker/...`
- `prisma/` — schema + migrations + seed (dipindah dari `my-app/prisma`)
- `uploads/` — storage lokal dev, diserve di `/uploads/*`

## Catatan migrasi

- Workflow approval + shadow columns (`pending*`) dipertahankan 1:1 dari
  `my-app/lib/actions/*`. Produk tidak punya kolom bayangan (revisi langsung
  jadi PENDING), kategori/artikel/galeri pakai kolom bayangan.
- Frontend (`my-app`) memanggil API ini lewat `lib/api/*` dengan header
  `Authorization: Bearer <backendAccessToken>` dari session next-auth.
