# Money Review — Design Spec

- **Tanggal:** 2026-09-30
- **Status:** Disetujui 2026-09-30 (revisi palet kategori di §5.6)
- **Repo:** `web-money-review` (frontend) dan `api-money-review` (skema & logika database Supabase)

## 1. Tujuan

Web pribadi untuk merekap pemasukan dan pengeluaran. Dipakai **satu orang** (pemilik) dari HP dan laptop dengan data yang sama.

- Di **HP**: fokus pada input transaksi yang cepat.
- Di **laptop**: melihat grafik dan meninjau transaksi.

**Kriteria berhasil:**

- Mencatat satu transaksi dari HP butuh beberapa ketukan saja: buka web, isi nominal, pilih kategori, simpan.
- Data yang diinput di HP langsung terlihat di laptop, dan sebaliknya.
- Hanya pemilik yang bisa mengakses data, dan ini dijaga oleh database.

## 2. Ruang lingkup

**Termasuk (v1):**

- Login email + password.
- Beranda: ringkasan bulan ini, form input cepat, dan 5 transaksi terakhir.
- Daftar transaksi: filter per bulan dan kategori, edit, hapus.
- Halaman grafik.
- Pengaturan: kelola kategori, tema, ganti password, logout.

**Tidak termasuk (v1):**

- Ekspor atau impor data.
- Anggaran per kategori, transaksi rutin, multi-dompet (kandidat versi berikutnya).
- PWA / mode offline.
- Login Google.
- Multi-user.
- Mata uang selain Rupiah.

## 3. Arsitektur

```
[Browser HP/Laptop]
      │  React SPA (web-money-review), di-hosting di Netlify
      │  supabase-js + publishable/anon key
      ▼
[Supabase]
   ├─ Auth (email + password, pendaftaran dimatikan)
   └─ PostgreSQL (skema dari api-money-review)
        ├─ Row Level Security di semua tabel
        ├─ view untuk data gabungan (join)
        └─ trigger/function untuk audit & activity log
```

Tidak ada server API sendiri. Supabase (PostgREST + Auth) berperan sebagai API. Repo `api-money-review` berisi semua yang berjalan di sisi Supabase: skema, RLS, view, function, trigger, seed, dan jadwal pembersihan log.

## 4. Repositori & alur Git

Kedua repo dibuat dari `template-sop-nf` **tanpa LICENSE** (permintaan pemilik). Isinya: README.md, CHANGELOG.md, .gitignore, `.githooks/`, dan `scripts/`.

**Aturan yang diikuti (SOP Git):**

- Branch `main` dan `develop`, ditambah branch sementara `<tipe>/<issue>-<subtask>-<deskripsi>`.
- Conventional Commits dan commit signing (SSH).
- SemVer dimulai dari 0.1.0, dengan CHANGELOG format Keep a Changelog.
- `.gitignore` mengecualikan `node_modules`, build, coverage, log, `.env*` (termasuk `.env.example`). Daftar environment variable didokumentasikan di README.

**Penyimpangan dari SOP (disetujui pemilik, proyek pribadi):**

| SOP | Proyek ini | Alasan |
|---|---|---|
| Remote hanya Gitea | Remote di **GitHub** | Netlify hanya bisa auto-deploy dari GitHub/GitLab/Bitbucket |
| PR di-review minimal 1 developer lain | PR `feature/*` → `develop` → `main` di-review sendiri oleh pemilik | Hanya ada satu developer |
| Secret di Infisical | Environment variable Netlify + `.env` lokal (di-gitignore) | Web hanya memakai kunci publik yang aman berada di browser |
| MySQL (InnoDB, `DATETIME`, dst.) | PostgreSQL (Supabase) dengan padanan terdekat (lihat §6) | Supabase berbasis PostgreSQL |

**Deploy:**

- Netlify terhubung ke repo GitHub `web-money-review` dan otomatis build + deploy setiap push ke `main`.
- `develop` boleh dipakai untuk branch deploy preview (opsional).
- Skema di `api-money-review` dijalankan manual lewat SQL Editor Supabase, berurutan sesuai nomor file.

## 5. Tampilan (frontend)

### 5.1 Bahasa & teks

- **Seluruh teks antarmuka dalam bahasa Inggris.**
- Pesan dibuat singkat dan netral. Contoh: `Saved`, `Transaction added`, `Transaction deleted`, `Failed to save, try again`, `Session expired, please log in`.
- Tidak ada emoji di mana pun. Semua ikon memakai **Lucide** (`lucide-react`).

### 5.2 Halaman & navigasi

Navigasi:

- **HP (< 768px):** bilah bawah dengan 4 tab: Home, Transactions, Charts, Settings.
- **Laptop:** sidebar kiri dengan menu yang sama.

| Halaman | Isi |
|---|---|
| **Login** | Email + password, tombol "Log in". Tidak ada tautan daftar. |
| **Home** | Kartu ringkasan bulan berjalan: Income, Expense, Net (= income − expense). Di bawahnya form input cepat, lalu 5 transaksi terakhir. |
| **Transactions** | Filter bulan (default bulan berjalan) dan kategori (default semua). Daftar dikelompokkan per tanggal, terbaru di atas. Ketuk item untuk membuka form edit (form yang sama dengan input) beserta tombol Delete. Delete selalu meminta konfirmasi. |
| **Charts** | Pemilih bulan. Donut pengeluaran per kategori untuk bulan terpilih (maks. 7 irisan, sisanya digabung menjadi "Other"), dengan legenda nominal dan persentase di bawahnya. Grafik batang income vs expense selama 6 bulan terakhir (sampai bulan terpilih). Dioptimalkan untuk laptop, tetap bisa dibuka di HP. |
| **Settings** | Kelola kategori, tema (System / Light / Dark), ganti password, Log out. |

### 5.3 Form transaksi

- **Toggle Expense / Income.** Default: Expense.
- **Amount:**
  - Kolom dengan `inputmode="numeric"`, hanya menerima digit.
  - Selama mengetik, pemisah ribuan titik ditambahkan otomatis (`25000` tampil `25.000`), dengan prefix `Rp`.
  - Nilai yang disimpan adalah angka apa adanya, tanpa pengali.
  - Batas maksimum 999.999.999.999.
- **Category:** grid tombol ikon + nama, hanya kategori aktif sesuai jenis yang dipilih. Wajib dipilih.
- **Date:**
  - Default hari ini menurut tanggal perangkat.
  - Tanggal masa depan diperbolehkan.
  - Ditampilkan dalam format mudah dibaca (mis. `30 Sep 2026`) dan disimpan sebagai `YYYY-MM-DD`.
- **Note:** opsional, maksimal 255 karakter.
- **Save:** dinonaktifkan selama proses simpan untuk mencegah data ganda. Setelah berhasil, muncul toast `Transaction added` lalu form dikosongkan kecuali jenis dan tanggal. Jika gagal, isi form tetap ada.
- **Validasi** ditampilkan di bawah kolom: `Amount is required`, `Category is required`.

### 5.4 Kelola kategori (Settings)

- Dua daftar: Expense dan Income.
- **Tambah / ubah:** nama (wajib, maks 50 karakter, unik per jenis di antara kategori aktif) dan ikon (pilih dari kumpulan ikon Lucide yang sudah dikurasi).
- **Warna grafik** diberikan otomatis dari palet kategori (§5.6): warna yang paling jarang dipakai kategori aktif sejenis.
- **Hapus** = arsip (soft delete, `deleted_at` diisi):
  - Kategori hilang dari form input.
  - Transaksi lama tetap menampilkan nama dan ikon kategori tersebut dan tetap dihitung di grafik.
  - Konfirmasi: "Delete category? Existing transactions will keep it."
- Jenis kategori tidak bisa diubah setelah dibuat, supaya tidak bentrok dengan transaksi yang sudah ada.

### 5.5 Sesi & akun

- Sesi dikelola Supabase Auth: token akses diperbarui otomatis dan sesi bertahan walau browser ditutup.
- **Logout otomatis setelah 7 hari tidak aktif:**
  - Waktu aktivitas terakhir disimpan di `localStorage` dan diperbarui setiap kali app dibuka, tab kembali terlihat, atau ada interaksi (dibatasi maksimal sekali per menit).
  - Saat app dibuka atau tab kembali terlihat, jika selisihnya lebih dari 7 hari, app memanggil `signOut()` dan menampilkan halaman Login dengan pesan `Session expired, please log in`.
- **Ganti password:**
  - Isian: password saat ini, password baru (min. 8 karakter), dan konfirmasi.
  - Password saat ini diverifikasi dengan login ulang sebelum `updateUser`.
- **Log out** menghapus sesi dan kembali ke Login.

### 5.6 Tema & warna

Mode **System** (default) mengikuti `prefers-color-scheme`. **Light** dan **Dark** bisa dipilih manual, dan pilihannya disimpan di `localStorage`. Semua warna didefinisikan sebagai CSS variable dan dipetakan ke Tailwind.

| Token | Light (palet 1) | Dark (palet 2) |
|---|---|---|
| `bg` | `#FFF9F2` | `#000000` |
| `surface` | `#F3E6D5` | `#1A0A0A` |
| `text` | `#2A0A10` | `#FFF9F2` |
| `text-muted` | `#6B4A4F` | `#B8A9A0` |
| `primary` | `#800020` | `#BC0202` |
| `primary-pressed` | `#5E0018` | `#830000` |
| `accent` | `#D45060` | `#FF0000` (hanya untuk sorotan kecil, mis. indikator tab aktif) |
| `expense` | `#800020` | `#FF4D4D` |
| `income` | `#3F7D58` | `#5FB57F` |

- Nominal pengeluaran selalu diawali `−` dan ikon `arrow-down`. Nominal pemasukan diawali `+` dan ikon `arrow-up`.
- **Palet warna kategori** (untuk grafik, tanpa merah supaya tidak tertukar dengan expense), 7 hue yang lolos validasi buta warna dan normal-vision di permukaan light dan dark. Database menyimpan nilai light; mode dark memakai step pasangannya:

  | Light | `#2a78d6` | `#eb6834` | `#1baf7a` | `#eda100` | `#e87ba4` | `#008300` | `#4a3aa7` |
  |---|---|---|---|---|---|---|---|
  | Dark | `#3987e5` | `#d95926` | `#199e70` | `#c98500` | `#d55181` | `#008300` | `#9085e9` |

  *Revisi 2026-09-30:* palet 10 warna di draft awal gagal validasi (pasangan warna tertentu tidak terbedakan bagi penderita buta warna), sehingga diganti dengan palet di atas. Irisan "Other" memakai abu-abu `#8c8a86`.
- **Huruf:** Plus Jakarta Sans (Google Fonts). Nominal memakai `tabular-nums`.
- Format uang: `Rp 25.000` (`Intl.NumberFormat('id-ID')`, tanpa desimal). Format tanggal di UI memakai locale `en-GB` (mis. `30 Sep 2026`).

### 5.7 Tech stack & struktur

- **Stack:** Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query, Chart.js (`react-chartjs-2`), `lucide-react`, `@supabase/supabase-js`.
- **Pengujian:** Vitest + React Testing Library.

```
web-money-review/
├─ .githooks/  scripts/  README.md  CHANGELOG.md  .gitignore
├─ netlify.toml            ← build command, publish dir, SPA redirect /* → /index.html 200
├─ index.html
├─ src/
│  ├─ main.tsx, App.tsx    ← router, QueryClient, auth guard
│  ├─ index.css            ← CSS variable tema light/dark
│  ├─ lib/                 ← logika murni, tanpa React/Supabase
│  │   ├─ money.ts         ← format Rupiah, parse & format input nominal
│  │   ├─ dates.ts         ← awal/akhir bulan, format tanggal
│  │   ├─ summary.ts       ← ringkasan bulanan, total per kategori, seri 6 bulan
│  │   ├─ inactivity.ts    ← aturan logout 7 hari
│  │   └─ theme.ts         ← pilihan tema
│  ├─ services/            ← satu-satunya lapisan yang memanggil Supabase
│  │   ├─ supabase.ts      ← client dari env
│  │   ├─ auth.ts
│  │   ├─ transactions.ts
│  │   └─ categories.ts
│  ├─ hooks/               ← hook TanStack Query di atas services
│  ├─ components/          ← AmountInput, CategoryPicker, TransactionForm, TransactionList,
│  │                          SummaryCards, AppNav, Toast, ConfirmDialog, IconPicker, charts/
│  └─ pages/               ← LoginPage, HomePage, TransactionsPage, ChartsPage, SettingsPage
└─ docs/superpowers/specs/
```

**Batasan antar lapisan:**

- `pages` menyusun `components`.
- `components` memakai `hooks`.
- `hooks` memanggil `services`.
- Perhitungan ada di `lib`.
- Tidak ada komponen yang memanggil Supabase langsung.

**Environment variable** (didokumentasikan di README, diisi di Netlify dan `.env` lokal):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (kunci publik; kunci service role tidak pernah dipakai di web)

## 6. Database (repo `api-money-review`)

### 6.1 Struktur repo

```
api-money-review/
├─ .githooks/  scripts/  README.md  CHANGELOG.md  .gitignore
├─ sql/
│  ├─ 001_types_and_tables.sql
│  ├─ 002_audit_triggers.sql
│  ├─ 003_rls_policies.sql
│  ├─ 004_views.sql
│  ├─ 005_activity_logs.sql
│  └─ 006_log_retention_cron.sql
├─ seed/
│  └─ default_categories.sql   ← dijalankan sekali setelah akun pemilik dibuat
└─ docs/
   ├─ setup-supabase.md        ← buat project, matikan sign-up, buat user, jalankan SQL
   └─ security-checklist.md    ← cek manual RLS & sign-up
```

### 6.2 Adaptasi SOP Desain Database ke PostgreSQL

| SOP (MySQL) | Diterapkan sebagai |
|---|---|
| `BIGINT UN AUTO_INCREMENT` | `bigint generated always as identity` |
| `DATETIME` | `timestamptz` (disimpan UTC, ditampilkan waktu lokal) |
| `ENUM` | tipe enum PostgreSQL `transaction_type ('expense','income')` |
| `VARCHAR(n)` | `varchar(n)` |
| Prefix `tb_` / `vw_` / `fn_` | Diikuti |
| Kolom audit `created/updated/deleted _at/_by` | Ada di `tb_categories` dan `tb_transactions`. Kolom `_by` bertipe `uuid` yang merujuk `auth.users(id)` |
| Join wajib lewat SP/ORM | Join hanya di dalam view `vw_transactions` |
| FK default `NO ACTION` | Diikuti |
| Wajib `activity_logs`, retensi 1 tahun | `tb_activity_logs` + job `pg_cron` harian |
| charset/collation | Tidak berlaku (PostgreSQL Supabase memakai UTF-8) |

### 6.3 Tabel

**`tb_categories`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigint identity` PK | |
| `user_id` | `uuid` not null, default `auth.uid()`, FK `auth.users` | pemilik |
| `name` | `varchar(50)` not null | |
| `type` | `transaction_type` not null | |
| `icon` | `varchar(50)` not null | nama ikon Lucide |
| `color` | `varchar(7)` not null | hex |
| `created_at`, `updated_at`, `deleted_at` | `timestamptz` | `created_at` default `now()` |
| `created_by`, `updated_by`, `deleted_by` | `uuid` FK `auth.users` | |

Constraint dan index:

- `unique (id, type)` sebagai target FK komposit dari transaksi.
- Unique index parsial `(user_id, type, lower(name)) where deleted_at is null`.
- Index pada `user_id`.

**`tb_transactions`**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `bigint identity` PK | |
| `user_id` | `uuid` not null, default `auth.uid()`, FK `auth.users` | |
| `type` | `transaction_type` not null | |
| `amount` | `bigint` not null, `check (amount > 0 and amount <= 999999999999)` | Rupiah bulat |
| `category_id` | `bigint` not null | |
| `transaction_date` | `date` not null | |
| `note` | `varchar(255)` null | |
| kolom audit | sama seperti di atas | |

Constraint dan index:

- FK komposit `(category_id, type)` → `tb_categories(id, type)`, sehingga jenis transaksi dan kategori pasti cocok.
- Index `(user_id, transaction_date)` dan `category_id`.

**`tb_activity_logs`**

- Kolom: `id`, `user_id`, `activity varchar(50)` (mis. `login`, `transaction.create`, `transaction.update`, `transaction.delete`, `category.create`, `category.update`, `category.delete`), `entity_id bigint null`, `ip_address varchar(45)`, `user_agent varchar(255)`, `created_at`, `created_by`.
- **Penyimpangan kecil:** tabel log bersifat append-only, sehingga tidak memakai kolom `updated_*` / `deleted_*`.

### 6.4 Function & trigger

- **`fn_set_audit_fields()`**, trigger `BEFORE INSERT/UPDATE` di kedua tabel:
  - Mengisi `created_by` / `updated_by` / `updated_at` dari `auth.uid()` dan `now()`.
  - Saat `deleted_at` berubah dari null menjadi terisi, mengisi `deleted_by`.
  - Klien tidak bisa memalsukan kolom audit.
- **`fn_log_row_change()`**, trigger `AFTER INSERT/UPDATE` (`security definer`):
  - Menulis ke `tb_activity_logs`. Update yang mengisi `deleted_at` dicatat sebagai `*.delete`.
  - `ip_address` dan `user_agent` diambil dari `current_setting('request.headers', true)` (header `x-forwarded-for`, `user-agent`).
- **`fn_log_activity(p_activity text)`**, RPC yang dipanggil web setelah login berhasil untuk mencatat `login`.
- **Soft delete:** tidak ada policy `DELETE` untuk klien, jadi baris tidak bisa dihapus permanen dari web. Hapus = update `deleted_at`.

### 6.5 Row Level Security

- RLS aktif di ketiga tabel.
- **`tb_categories` & `tb_transactions`:**
  - `SELECT` / `INSERT` / `UPDATE` hanya jika `user_id = auth.uid()`.
  - `INSERT` mewajibkan `user_id = auth.uid()` (with check).
  - Untuk transaksi, `INSERT` / `UPDATE` juga mewajibkan kategori milik user yang sama.
- **`tb_activity_logs`:** `SELECT` milik sendiri. Tidak ada `INSERT` / `UPDATE` / `DELETE` langsung dari klien (hanya lewat function `security definer`).
- **`vw_transactions`:**
  - Dibuat dengan `security_invoker = true` agar RLS tabel dasar tetap berlaku.
  - Isinya transaksi yang `deleted_at is null` digabung dengan nama, ikon, warna, dan status arsip kategorinya (termasuk kategori yang sudah diarsipkan).
- **Pengaturan Supabase Auth:** "Allow new users to sign up" dimatikan. Akun pemilik dibuat manual dari dashboard.

### 6.6 Seed kategori awal

| Jenis | Kategori (ikon Lucide) |
|---|---|
| Expense | Food & Drinks (`utensils`), Transport (`bus`), Shopping (`shopping-bag`), Bills (`receipt`), Entertainment (`clapperboard`), Health (`heart-pulse`), Other (`circle-ellipsis`) |
| Income | Salary (`wallet`), Bonus (`gift`), Gift (`hand-coins`), Other (`circle-ellipsis`) |

Nama kategori dalam bahasa Inggris karena tampil di antarmuka. Semua bisa diubah dari Settings.

## 7. Aliran data

- **Baca:**
  - Home membaca `vw_transactions` bulan berjalan untuk ringkasan, plus 5 transaksi terbaru tanpa filter bulan (urut `transaction_date desc, id desc`).
  - Transactions membaca `vw_transactions` dengan filter rentang tanggal bulan terpilih (dan kategori bila dipilih).
  - Charts membaca rentang 6 bulan.
  - Ringkasan dan agregasi grafik dihitung di browser (`lib/summary.ts`).
  - Kategori dibaca dari `tb_categories` (yang aktif untuk form; semua untuk label).
- **Tulis:** insert/update ke `tb_transactions` / `tb_categories`. Setelah sukses, TanStack Query meng-invalidate query transaksi/kategori sehingga Home, Transactions, dan Charts segar kembali.
- **Cache:** data tetap segar ketika pindah perangkat karena query di-refetch saat tab kembali fokus.

## 8. Penanganan error

| Situasi | Perilaku |
|---|---|
| Validasi form gagal | Pesan singkat di bawah kolom, tidak mengirim request |
| Gagal jaringan/server saat simpan | Toast `Failed to save, try again`, isi form tetap |
| Gagal memuat data | Pesan `Couldn't load data` + tombol `Retry` |
| Login salah | `Invalid email or password` |
| Sesi tidak valid / 7 hari tidak aktif | Kembali ke Login + `Session expired, please log in` |
| Nama kategori duplikat | `Category already exists` |
| Proses simpan berjalan | Tombol disabled + indikator loading, cegah submit ganda |
| Data sedang dimuat | Skeleton, bukan layar kosong |

## 9. Pengujian

**Unit test (Vitest) untuk `lib/`:**

- `money`: format Rupiah; parse input (hanya digit, hapus titik, batas maksimum); format saat mengetik.
- `dates`: rentang awal/akhir bulan, termasuk pergantian tahun.
- `summary`: total income/expense/net per bulan; total per kategori termasuk kategori terarsip; seri 6 bulan dengan bulan kosong bernilai 0.
- `inactivity`: kurang dari 7 hari tetap login, lebih dari 7 hari logout, tidak ada catatan dianggap aktif baru.

**Component test (React Testing Library, `services` di-mock):**

- `AmountInput`: pemisah ribuan saat mengetik.
- `TransactionForm`:
  - Validasi wajib isi.
  - Tombol disabled saat submit (tidak terkirim dua kali).
  - Isi tetap ada saat gagal.
  - Reset setelah sukses.
- `CategoryPicker`: hanya menampilkan kategori aktif sesuai jenis.

**Cek manual keamanan** (`api-money-review/docs/security-checklist.md`):

- Sign-up via API ditolak.
- Anon tanpa login tidak bisa membaca tabel.
- User kedua uji coba tidak bisa membaca/mengubah data pemilik (lalu dihapus).
- `DELETE` dari klien ditolak.
- Kolom audit tidak bisa dipalsukan.

**Verifikasi manual UI:** input dari HP (viewport mobile), grafik di laptop, mode light/dark.
