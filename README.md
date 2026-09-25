# Furniture — Company Profile & Content Management System

> Website company profile untuk perusahaan furniture, dilengkapi katalog produk, portofolio, artikel, galeri, inquiry pelanggan, serta dashboard untuk admin dan worker.

Furniture adalah aplikasi full-stack yang dirancang untuk membantu perusahaan furniture mengelola konten dan relasi pelanggan dari satu tempat. Pengunjung dapat menjelajahi profil perusahaan dan katalog tanpa login, sedangkan admin dan worker menggunakan dashboard terproteksi untuk mengelola konten dan memproses inquiry.

---

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Fitur Utama](#fitur-utama)
- [Arsitektur](#arsitektur)
- [Design System](#design-system)
- [Alur Inquiry dan WhatsApp](#alur-inquiry-dan-whatsapp)
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
- Form inquiry publik tanpa login. Setelah terkirim, pelanggan mendapat ringkasan inquiry dan tombol untuk melanjutkan percakapan ke WhatsApp dengan pesan yang sudah terisi otomatis.
- Tombol konsultasi WhatsApp di seluruh halaman publik, dengan pesan awal yang terisi otomatis dan nomor yang dinormalisasi ke format internasional.

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
- Balas inquiry via WhatsApp dengan pesan yang sudah terisi otomatis, pratinjau teks, tombol salin, dan aksi satu klik "Tandai sudah dihubungi".
- Balas cepat langsung dari daftar inquiry tanpa membuka detail.
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

## Design System

Frontend memakai satu bahasa visual: **Modern Architectural Blueprint / Technical Corporate**. Seluruh token terkumpul di `my-app/app/globals.css` pada blok `@theme`. Tidak ada lagi palet lama (cream, pine, moss, ink) maupun font display serif.

### Font

| Peran | Font | Variabel CSS |
|---|---|---|
| Sans (UI, body, heading) | Plus Jakarta Sans (400–800) | `--font-sans` |
| Mono (label teknis, nomor, tanggal) | Geist Mono | `--font-geist-mono` |

Hanya satu keluarga sans-serif. Mono dipakai khusus untuk label teknis, nomor telepon, angka statistik, dan tanggal — bukan untuk paragraf.

### Warna

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `navy` | `#0A192F` | Sidebar, header, footer, tombol utama, heading |
| `navy-light` | `#1B2A4A` | Panel/nav mobile di atas navy |
| `navy-hover` | `#13233F` | Hover tombol utama |
| `electric` | `#007BFF` | CTA di header publik, aksen border atas |
| `electric-dark` | `#0063CE` | Teks aksen kecil (lolos AA di atas putih) |
| `electric-active` | `#0056B3` | State pressed |
| `cyan` | `#00B4D8` | **Hanya dekorasi teknis** di atas navy |
| `background` | `#F4F5F7` | Background halaman |
| `surface` | `#FFFFFF` | Kartu, panel, tabel |
| `border` / `border-strong` | `#E2E8F0` / `#CBD5E1` | Border tipis |
| `text` / `text-secondary` / `text-muted` | `#0F172A` / `#334155` / `#64748B` | Hierarki teks |

Status semantik (dipakai badge, alert, empty state):

| Status | Teks | Latar |
|---|---|---|
| Success | `#15803D` | `#DCFCE7` |
| Warning | `#B45309` | `#FEF3C7` |
| Error | `#DC2626` | `#FEE2E2` |
| Info | `#007BFF` | `#DBEAFE` |

### Aturan bentuk dan warna

- **Radius dikunci 3px** (`--radius-sharp`) untuk tombol, kartu, input, badge, tabel. `rounded-full` hanya untuk dot, avatar, dan badge angka.
- **Biru `#007BFF` tidak dipakai sebagai warna teks di atas putih** untuk ukuran kecil — kontrasnya tidak lolos AA. Gunakan `electric-dark` `#0063CE`.
- **Satu aksen saja.** Cyan tidak pernah menjadi warna tombol kedua.
- **Border tipis + spasi** lebih diutamakan daripada shadow. Shadow hanya untuk elemen yang benar-benar melayang.
- Motif grid blueprint (`bg-blueprint-light` / `bg-blueprint-dark`, opacity 0.055–0.06) hanya pada hero, section header, dashboard header, dan empty state. Jangan dipakai sebagai background penuh halaman.
- `.tech-label` untuk label teknis mono uppercase dengan letter-spacing lebar.
- Focus ring global `:focus-visible` berwarna electric, 2px.
- Animasi hanya transform/opacity, 150–300ms, dan menghormati `prefers-reduced-motion`.

---

## Alur Inquiry dan WhatsApp

### Normalisasi nomor

`wa.me` hanya menerima format internasional **tanpa `+` dan tanpa `0` di depan**. Mayoritas orang Indonesia mengetik format lokal `08xx`, yang akan menghasilkan link rusak bila tidak dinormalisasi. Seluruh normalisasi terpusat di `my-app/lib/wa.ts`:

| Input | Angka hasil |
|---|---|
| `0812-3456-7890` | `6281234567890` |
| `+62 812 3456 7890` | `6281234567890` |
| `6281234567890` | `6281234567890` |

Nomor yang tidak bisa dinormalisasi (terlalu pendek, terlalu panjang, bukan angka) menghasilkan `null`, dan UI menyembunyikan tombol WhatsApp serta menampilkan alternatif telepon dan email.

Data lama di database tidak pernah dimigrasi. Normalisasi dijalankan saat render, sehingga record bertulis `0812…` maupun `+62812…` tetap menghasilkan link yang benar.

### Alur pelanggan

```text
Form inquiry (publik)
  → createInquiryAction
      → normalisasi nomor → validasi Zod → POST /inquiries
      → backend simpan + kirim notifikasi ke admin
  → server menyusun teks pesan WhatsApp
  → success state: ringkasan inquiry + tombol WA + tombol salin
```

Teks yang dikirim pelanggan ke nomor perusahaan:

```text
Halo {NAMA PERUSAHAAN},

Saya baru mengirim inquiry lewat website.

Nama     : {nama}
WhatsApp : +62 812-3456-7890
Email    : {email}
Produk   : {nama produk / Pertanyaan umum}
Jumlah   : {jumlah} pcs

Pesan:
{isi pesan}

Mohon dikonfirmasi ya. Terima kasih.
```

Jika nomor WhatsApp perusahaan kosong atau tidak valid, tombol WA digantikan oleh tautan telepon dan email, dan tombol **Salin pesan** tetap tersedia.

### Alur admin dan worker

```text
Daftar inquiry → tombol "Balas WA"  (opsional, tanpa buka detail)
Detail inquiry → panel "Balas ke pelanggan"
                 ├── Buka WhatsApp   (pesan terisi otomatis)
                 ├── Salin teks
                 ├── Telepon / Email
                 ├── Tandai sudah dihubungi  → status CONTACTED
                 └── Pratinjau teks balasan (bisa disalin)
```

Teks balasan yang disiapkan admin atau worker:

```text
Halo Kak {nama pelanggan},

Terima kasih sudah menghubungi {NAMA PERUSAHAAN} dan mengirim inquiry lewat website.

Ringkasan inquiry Anda:
Produk : {nama produk / Pertanyaan umum}
Jumlah : {jumlah} pcs
Tanggal: {tanggal inquiry}

Pesan Anda:
"{isi pesan pelanggan}"

Mohon ditunggu, tim kami akan menindaklanjuti segera.

Balas langsung di chat ini ya. Kalau ada yang perlu disesuaikan, silakan informasikan.

Salam,
{NAMA PERUSAHAAN}
{nomor telepon perusahaan}
```

Satu klik **Buka WhatsApp** sudah cukup: Admin tinggal memeriksa di WhatsApp lalu menekan tombol kirim. Tombol **Tandai sudah dihubungi** dipakai bila ingin mencatat bahwa pelanggan sudah ditindaklanjuti.

### Format nomor pada Company Profile

| Field | Cara mengisi | Tersimpan sebagai | Tampil sebagai |
|---|---|---|---|
| WhatsApp | `6282121730722` | `6282121730722` | `+62 821-2173-0722` |
| Telepon | Bebas, mis. `0821 2173 0722` atau `021-21730722` | apa adanya | apa adanya |

Field WhatsApp **dinormalisasi otomatis ketika form disimpan**, jadi mengetik `0821 2173 0722` tetap aman. Field Telepon sengaja tidak dinormalisasi supaya tetap enak dibaca; hanya link `tel:`-nya yang dinormalisasi, dan landline seperti `021-…` tetap dipertahankan sebagai nomor lokal.

Halaman **Admin → Profil Perusahaan** menampilkan pratinjau tautan langsung (`wa.me/...` dan `tel:...`) supaya Admin bisa memverifikasi tanpa menghitung sendiri.

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
│   │   ├── validations.ts           # Zod validation
│   │   └── wa.ts                    # Normalisasi nomor WA/telepon + pembentuk pesan
│   ├── shared/
│   │   └── ui/                      # Primitive UI yang dipakai lintas domain
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

Seed juga mengisi company profile demo dengan nomor kontak contoh. Nomor WhatsApp pada seed **sudah disimpan dalam format kanonik** (`6282121730722`), sedangkan nomor inquiry pada seed sengaja dibiarkan format lokal `08…` sebagai regression test — normalisasi saat render harus tetap mengubahnya menjadi link yang benar.

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
- `POST /inquiries` — mengembalikan `{ id, productName }`; `productName` dipakai frontend untuk menyusun pesan WhatsApp pelanggan tanpa perlu fetch ulang.

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

### Tombol WhatsApp hilang atau membuka nomor yang salah

- Buka **Admin → Profil Perusahaan**, cek baris "Nomor WhatsApp" pada panel "Tampil di mana". Panel tersebut menampilkan link hasil akhir, misalnya `https://wa.me/6282121730722`.
- Format yang benar adalah angka saja, internasional, tanpa `+` dan tanpa `0` di depan: `6282121730722`.
- Simpan ulang form untuk memindahkan data lama (mis. `082121730722`) ke format kanonik.
- Di halaman detail inquiry, panel "Balas ke pelanggan" menampilkan nomor pelanggan yang sudah dinormalisasi. Kalau tombol WA tidak muncul, berarti nomor pelanggan memang tidak valid, dan tautan telepon/email otomatis menggantikan.
- Format landline seperti `021-21730722` **tidak boleh** diubah menjadi `+6221…`; itu akan menyambungkan ke nomor yang salah. Sistem sudah otomatis membedakan seluler (`08xx`) dan landline.

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
