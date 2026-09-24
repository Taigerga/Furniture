# REDESIGN TEMA DAN VISUAL WEBSITE

Saya ingin mengubah **desain/tema visual website yang sudah ada** menjadi lebih profesional, modern, tegas, dan memiliki karakter **architectural / technical blueprint**.

## 1. ARAHAN UTAMA

Lakukan redesign terhadap UI website yang sudah ada dengan mempertahankan:

* Seluruh fitur dan fungsi yang sudah berjalan.
* Struktur routing.
* Struktur data dan backend.
* Logic bisnis.
* API atau integrasi yang sudah tersedia.
* Validasi form.
* Authentication/authorization.
* Responsive behavior yang sudah berfungsi.

**Jangan melakukan rewrite terhadap logic aplikasi hanya karena perubahan desain.**

Fokus utama adalah **UI/UX, visual hierarchy, layout, spacing, typography, color system, component styling, dan visual consistency.**

Sebelum melakukan perubahan:

1. Analisis terlebih dahulu struktur project.
2. Identifikasi framework dan library UI yang digunakan.
3. Identifikasi halaman utama, dashboard, form, tabel, card, modal, navbar, sidebar, button, badge, alert, dan komponen lainnya.
4. Identifikasi design token/style yang saat ini digunakan.
5. Tentukan komponen mana yang dapat dibuat reusable.
6. Pastikan perubahan desain diterapkan secara konsisten ke seluruh halaman.

---

# 2. DESIGN DIRECTION

Gunakan konsep:

**Modern Architectural Blueprint / Technical Corporate**

Karakter desain harus memberikan kesan:

* Profesional
* Modern
* Terstruktur
* Presisi
* Teknologi
* Architectural / engineering
* Stabil
* Clean
* Functional

Hindari desain yang:

* Terlalu playful.
* Terlalu colorful.
* Terlalu futuristik.
* Terlalu banyak gradient.
* Terlalu banyak glassmorphism.
* Terlalu rounded.
* Terlihat seperti template generik.
* Terlihat norak atau berlebihan.

Visual harus terasa seperti perpaduan antara **website perusahaan teknologi, architectural blueprint, dan modern engineering interface**.

---

# 3. COLOR SYSTEM

Gunakan sistem warna berikut sebagai dasar.

### Primary / Dominant

Navy Blue:

```text
#0A192F
```

Alternatif navy:

```text
#1B2A4A
```

Gunakan navy sebagai:

* Header
* Navbar
* Sidebar
* Section tertentu
* Background utama pada area tertentu
* Footer
* Elemen branding utama

### Accent / CTA

Electric Blue:

```text
#007BFF
```

Cyan:

```text
#00B4D8
```

Gunakan sebagai:

* Primary CTA
* Button penting
* Active state
* Link penting
* Focus state
* Icon tertentu
* Highlight
* Progress indicator

**Jangan menggunakan warna accent secara berlebihan.**

Accent harus tetap menjadi visual hierarchy, bukan memenuhi seluruh halaman.

### Neutral

Gunakan:

```text
#F4F5F7
#E2E8F0
#FFFFFF
```

Untuk:

* Background
* Card
* Border
* Divider
* Form
* Table
* Secondary section

### Text

Gunakan warna teks yang memiliki kontras baik terhadap background.

Contoh:

```text
#0F172A
#334155
#64748B
#FFFFFF
```

Sesuaikan dengan background masing-masing komponen.

---

# 4. BLUEPRINT VISUAL LANGUAGE

Tambahkan elemen visual yang terinspirasi dari **blueprint architecture / engineering drawing**.

Gunakan secara subtle, jangan sampai mengganggu readability.

Contohnya:

* Blueprint grid lines.
* Garis horizontal tipis.
* Garis vertikal tipis.
* Technical measurement lines.
* Grid background.
* Outline geometry.
* Thin borders.
* Coordinate-like visual elements.
* Architectural framing.
* Dashed technical lines jika relevan.

Grid dapat menggunakan pola seperti:

```text
background-image:
  linear-gradient(...),
  linear-gradient(...);
```

Namun opacity harus rendah sehingga konten tetap menjadi fokus utama.

**Jangan membuat seluruh halaman terlihat seperti kertas blueprint.**

Gunakan blueprint pattern terutama pada:

* Hero
* Section header
* Background dekoratif
* Dashboard header
* Empty state tertentu
* Footer atau section tertentu

---

# 5. LAYOUT

Gunakan layout berbasis **grid yang rapi dan terstruktur**.

Karakteristik:

* Alignment konsisten.
* Container memiliki max-width yang jelas.
* Spacing menggunakan sistem yang konsisten.
* Gunakan CSS Grid/Flexbox secara tepat.
* Hindari elemen yang terlihat "mengambang" tanpa alignment.
* Pastikan setiap section memiliki visual hierarchy yang jelas.

Gunakan prinsip:

```text
Grid
Alignment
Spacing
Hierarchy
Consistency
```

Layout harus terasa seperti sistem yang dirancang secara presisi, bukan kumpulan card yang ditempatkan secara acak.

---

# 6. BORDER DAN CORNER

Gunakan sudut elemen yang relatif tajam.

Prioritas:

```text
border-radius: 2px - 4px;
```

Hindari:

```text
border-radius: 9999px;
```

atau card yang terlalu membulat.

Namun jangan menghilangkan radius sepenuhnya.

Gunakan radius kecil hanya untuk:

* Card
* Button
* Input
* Modal
* Badge
* Image container

Karakter visual:

**Sharp, precise, structured.**

---

# 7. BORDER DAN SHADOW

Gunakan border tipis sebagai bagian penting dari visual language.

Contoh:

```text
1px solid #E2E8F0
```

Untuk elemen navy:

```text
1px solid rgba(...)
```

Shadow harus subtle.

Hindari:

* Shadow terlalu besar.
* Shadow terlalu gelap.
* Floating card berlebihan.
* Neumorphism.

Lebih baik gunakan:

**border + spacing + contrast**

daripada shadow yang berat.

---

# 8. TYPOGRAPHY

Gunakan sans-serif modern dan tegas.

Prioritas font:

1. Inter
2. Plus Jakarta Sans
3. Montserrat

Gunakan typography hierarchy yang jelas.

Contoh:

### Heading

* Bold / semibold
* Tegas
* Tidak terlalu dekoratif

### Body

* Regular
* Sangat readable
* Line-height nyaman

### Label

* Medium / semibold
* Compact
* Jelas

Hindari terlalu banyak jenis font.

Idealnya gunakan maksimal satu font family utama dengan beberapa font weight.

---

# 9. BUTTON

Button harus mengikuti visual identity baru.

Primary button:

* Navy atau Electric Blue
* Text putih
* Sharp corner
* Tidak terlalu rounded
* Hover state jelas

Secondary button:

* White / transparent
* Border
* Navy text

Danger:

* Gunakan warna merah secara restrained.

Button jangan menggunakan gradient kecuali memang diperlukan.

Contoh karakter:

```text
[ PRIMARY ACTION ]
```

bukan:

```text
( ✨ Get Started ✨ )
```

---

# 10. CARD

Card harus terlihat seperti bagian dari sistem desain architectural/technical.

Gunakan:

* Border tipis.
* Radius kecil.
* Padding konsisten.
* Typography hierarchy.
* Optional accent line.

Hindari:

* Card terlalu rounded.
* Shadow berlebihan.
* Gradient card.
* Terlalu banyak decorative elements.

Jika sebuah halaman memiliki banyak card, jangan membuat semuanya memiliki visual weight yang sama.

Gunakan hierarchy:

```text
Primary Card
Secondary Card
Supporting Card
```

---

# 11. NAVBAR / HEADER

Navbar harus menjadi salah satu elemen branding utama.

Gunakan:

* Navy Blue.
* Typography putih.
* Accent blue/cyan untuk active state.
* Border atau bottom line yang tipis.
* Layout clean dan structured.

Active navigation harus terlihat jelas tetapi tidak berlebihan.

Jika terdapat CTA pada navbar, gunakan Electric Blue sebagai accent.

---

# 12. SIDEBAR / DASHBOARD

Jika website memiliki dashboard:

Gunakan:

* Navy sidebar.
* Active menu menggunakan Electric Blue/Cyan.
* Icon outline/geometric.
* Typography clean.
* Divider tipis.
* Layout terstruktur.

Jangan membuat sidebar terlalu ramai.

Prioritaskan:

```text
Navigation
Hierarchy
Active state
Readability
```

---

# 13. FORM DAN INPUT

Form harus terlihat profesional dan clean.

Gunakan:

* Border tipis.
* Radius kecil.
* Background putih.
* Focus state Electric Blue/Cyan.
* Label yang jelas.
* Error state yang mudah dikenali.
* Helper text jika diperlukan.

Focus state harus terlihat jelas untuk accessibility.

---

# 14. TABLE

Jika terdapat tabel:

* Header menggunakan navy atau neutral yang kontras.
* Border tipis.
* Row spacing nyaman.
* Hover state subtle.
* Status menggunakan badge.
* Jangan menggunakan terlalu banyak warna.

Pastikan tabel tetap usable pada layar kecil.

---

# 15. BADGE / STATUS

Gunakan badge dengan radius kecil.

Contoh status:

```text
ACTIVE
PENDING
INACTIVE
SUCCESS
WARNING
ERROR
```

Warna harus konsisten secara semantik.

Jangan menjadikan semua badge berwarna biru.

---

# 16. ICON

Gunakan icon yang konsisten.

Preferensi:

* Outline
* Geometric
* Simple
* Clean

Hindari mencampur banyak style icon berbeda.

Icon harus berfungsi sebagai visual support, bukan dekorasi berlebihan.

---

# 17. ANIMATION

Gunakan animation secara subtle.

Contoh:

* Fade
* Small translate
* Hover
* Button transition
* Navigation transition
* Card interaction

Durasi dapat berada sekitar:

```text
150ms - 300ms
```

Hindari:

* Animasi berlebihan.
* Parallax berlebihan.
* Bounce.
* Efek flashy.
* Semua elemen bergerak ketika halaman dibuka.

Website harus tetap terasa profesional.

---

# 18. RESPONSIVE DESIGN

Pastikan redesign tetap optimal untuk:

* Desktop
* Laptop
* Tablet
* Mobile

Jangan hanya mengecilkan desktop layout.

Periksa:

* Navbar
* Sidebar
* Grid
* Card
* Table
* Form
* Button
* Typography
* Spacing
* Modal

Pada mobile, prioritaskan readability dan usability.

---

# 19. ACCESSIBILITY

Pastikan redesign tidak mengorbankan accessibility.

Perhatikan:

* Color contrast.
* Focus state.
* Keyboard navigation.
* Semantic HTML.
* Button accessibility.
* Form label.
* Error message.
* Responsive text.
* Touch target.

Jangan menggunakan warna sebagai satu-satunya indikator status.

---

# 20. DESIGN TOKENS

Jika project menggunakan CSS variables atau Tailwind theme, buat sistem token yang konsisten.

Contoh:

```css
--color-navy: #0A192F;
--color-navy-light: #1B2A4A;
--color-electric: #007BFF;
--color-cyan: #00B4D8;
--color-background: #F4F5F7;
--color-border: #E2E8F0;
--color-white: #FFFFFF;
--color-text: #0F172A;
--color-text-muted: #64748B;
```

Jangan hardcode warna secara acak di setiap komponen.

---

# 21. KONSISTENSI ANTAR HALAMAN

Setelah membuat redesign, pastikan seluruh halaman menggunakan visual language yang sama.

Periksa minimal:

* Landing/public page
* Login
* Register
* Dashboard
* Navbar
* Sidebar
* Form
* Table
* Detail page
* Modal
* Alert
* Empty state
* Error state
* Loading state
* Footer

Semua harus terasa berasal dari **satu design system yang sama**.

---

# 22. PRIORITAS VISUAL

Urutan prioritas:

```text
1. Usability
2. Readability
3. Information hierarchy
4. Consistency
5. Accessibility
6. Visual identity
7. Decorative elements
```

Jangan mengorbankan usability hanya demi tampilan.

---

# 23. IMPLEMENTATION RULE

Sebelum coding:

1. Inspect seluruh project.
2. Pahami struktur existing.
3. Identifikasi reusable components.
4. Identifikasi global stylesheet/theme.
5. Buat rencana perubahan.
6. Implementasikan secara bertahap.
7. Jalankan project.
8. Periksa console/build error.
9. Periksa responsive layout.
10. Pastikan tidak ada fitur existing yang rusak.

Jika sudah terdapat design system atau component system, **refactor dan extend sistem tersebut**, jangan membuat sistem styling kedua yang konflik.

---

# 24. HASIL AKHIR YANG DIHARAPKAN

Hasil akhir harus memiliki karakter:

> **Modern Architectural Blueprint + Technical Corporate**

Dengan kombinasi:

```text
Navy Blue
        +
Electric Blue / Cyan
        +
Clean White / Concrete Gray
        +
Structured Grid
        +
Blueprint Lines
        +
Sharp Corners
        +
Strong Sans-serif Typography
        +
Subtle Technical Details
```

Visual akhir harus terasa:

**professional, precise, structured, modern, technical, architectural, clean, dan premium.**

Jangan membuat desain terlihat seperti:

* Template dashboard generik.
* Website gaming.
* Cyberpunk.
* Glassmorphism.
* Neumorphism.
* Website terlalu colorful.
* Website terlalu playful.
* Website dengan rounded card berlebihan.

**Pertahankan fungsi aplikasi yang sudah ada. Yang diubah terutama adalah visual design, layout, styling, component appearance, dan design system.**
