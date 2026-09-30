# web-money-review

Frontend **Money Review**, web pribadi untuk merekap pemasukan dan pengeluaran. Tampilannya dioptimalkan untuk **input cepat dari HP**, sedangkan grafik ada di halaman terpisah untuk ditinjau dari **laptop**. Data tersimpan di Supabase (lihat repo [`api-money-review`](../api-money-review)) sehingga sama di semua perangkat.

## Web Url / App Build

- **URL (Production):** https://librasica.netlify.app
- **URL (Staging):** tidak ada (opsional: deploy preview Netlify dari branch `develop`)

## Tujuan

- Mencatat transaksi dari HP dalam beberapa ketukan: isi nominal, pilih kategori, simpan.
- Menampilkan ringkasan bulan berjalan (income, expense, net).
- Menyajikan grafik pengeluaran per kategori dan tren 6 bulan untuk ditinjau di laptop.
- Menjaga data hanya bisa diakses pemiliknya (login + Row Level Security di database).

## Sasaran Pengguna

Satu orang (pemilik), memakai HP dan laptop dengan data yang sama.

## Fitur

Seluruh teks antarmuka berbahasa Inggris. Pesan notifikasi dibuat singkat, dan semua ikon memakai [Lucide](https://lucide.dev) tanpa emoji.

| Halaman | Isi |
|---|---|
| **Login** | Email + password. Tidak ada pendaftaran; akun dibuat manual di Supabase. |
| **Home** | Kartu ringkasan bulan berjalan (Net, Income, Expense), form input cepat, dan 5 transaksi terbaru. |
| **Transactions** | Filter bulan dan kategori (termasuk kategori terarsip), daftar per tanggal, edit, dan hapus dengan konfirmasi. |
| **Charts** | Donut pengeluaran per kategori (maks. 7 irisan + "Other") dengan legenda nominal dan persentase, serta batang income vs expense 6 bulan. |
| **Settings** | Kelola kategori (tambah, ubah nama/ikon, hapus = arsip), tema System/Light/Dark, ganti password, dan Log out. |

**Form transaksi:**

- **Jenis:** toggle Expense/Income. Mengganti jenis mengosongkan kategori.
- **Amount:** diketik lengkap dan diberi titik ribuan otomatis (`25000` tampil `25.000`), maksimal Rp 999.999.999.999.
- **Category:** kategori dipilih lewat tombol ikon.
- **Date:** default hari ini menurut tanggal perangkat.
- **Note:** opsional, maksimal 255 karakter.
- **Save:** tombol dinonaktifkan selama proses supaya data tidak tersimpan ganda. Jika gagal, isi form tetap ada.

**Sesi:**

- Login bertahan walau browser ditutup.
- Logout otomatis setelah **7 hari tidak dipakai** (dicatat di `localStorage` dengan key `mr:lastActivity`).
- Ganti password memverifikasi password lama terlebih dahulu.

**Navigasi:**

- **HP (< 768px):** bilah bawah dengan 4 tab.
- **Laptop:** sidebar kiri.

## Tema & Warna

Mode **System** (default) mengikuti setelan perangkat. **Light** dan **Dark** bisa dipilih manual di Settings, dan pilihannya disimpan di `localStorage` dengan key `mr:theme`.

| Token | Light (palet 1) | Dark (palet 2) |
|---|---|---|
| `bg` | `#FFF9F2` | `#1A1012` |
| `surface` | `#F3E6D5` | `#2A1A1E` |
| `text` | `#2A0A10` | `#FFF9F2` |
| `text-muted` | `#6B4A4F` | `#C9BAB3` |
| `primary` | `#800020` | `#BC0202` |
| `primary-pressed` | `#5E0018` | `#830000` |
| `accent` | `#D45060` | `#FF0000` (sorotan kecil saja) |
| `expense` | `#800020` + tanda `−` dan ikon panah turun | `#FF4D4D` |
| `income` | `#3F7D58` + tanda `+` dan ikon panah naik | `#5FB57F` |

- **Palet kategori:** 7 hue yang lolos validasi buta warna, tanpa merah: `#2a78d6`, `#eb6834`, `#1baf7a`, `#eda100`, `#e87ba4`, `#008300`, `#4a3aa7`. Di mode dark masing-masing memakai step yang lebih terang. Kategori baru mendapat warna yang paling jarang dipakai kategori aktif sejenis.
- **Huruf:** Plus Jakarta Sans.
- **Format:** uang `Rp 25.000`, tanggal `30 Sep 2026`.

Semua token didefinisikan di [src/index.css](src/index.css) sebagai CSS variable dan dipetakan ke kelas Tailwind (`bg-surface`, `text-expense`, dst.).

## Tech Stack

- **Client/Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS 4, React Router 8, TanStack Query 5, Chart.js 4 (`react-chartjs-2`), Lucide
- **Server/Backend:** Supabase Auth + PostgREST (tanpa server sendiri), skema di repo `api-money-review`
- **Database:** PostgreSQL (Supabase)
- **Lainnya:** Netlify (hosting & auto-deploy), Vitest + React Testing Library

## Arsitektur

```
[Browser HP/Laptop]
      │  React SPA (repo ini), di-hosting di Netlify
      │  supabase-js + anon key
      ▼
[Supabase]
   ├─ Auth (email + password, pendaftaran dimatikan)
   └─ PostgreSQL (skema dari api-money-review)
        ├─ Row Level Security di semua tabel
        ├─ vw_transactions (join transaksi + kategori)
        └─ trigger audit & activity log
```

**Batasan antar lapisan:**

- `pages` menyusun `components`.
- `components` memakai `hooks`.
- `hooks` (TanStack Query) memanggil `services`.
- Hanya `services` yang memanggil Supabase.
- Perhitungan murni ada di `lib`.

## Struktur Folder

```
web-money-review/
├─ src/
│  ├─ main.tsx, App.tsx      ← provider (Query, Theme, Toast), routing, auth guard
│  ├─ index.css              ← token warna light/dark
│  ├─ types.ts               ← Category, Transaction, TransactionInput
│  ├─ queryClient.ts
│  ├─ lib/                   ← logika murni + unit test
│  │   ├─ money.ts           ← format Rupiah, parse/format input nominal
│  │   ├─ dates.ts           ← rentang bulan, format tanggal
│  │   ├─ summary.ts         ← ringkasan bulanan, total per kategori, seri 6 bulan
│  │   ├─ inactivity.ts      ← aturan logout 7 hari
│  │   ├─ theme.ts, storage.ts
│  │   ├─ icons.ts           ← ikon kategori & palet warna
│  │   └─ chartTheme.ts      ← warna grafik dari tema aktif
│  ├─ services/              ← supabase.ts, auth.ts, transactions.ts, categories.ts, errors.ts
│  ├─ hooks/                 ← useTransactions, useCategories, useAuth, useTheme, useInactivityGuard
│  ├─ components/            ← form, daftar, ringkasan, dialog, toast, navigasi, charts/
│  └─ pages/                 ← Login, Home, Transactions, Charts, Settings
├─ docs/superpowers/
│  ├─ specs/2026-09-30-money-review-design.md   ← design spec (acuan utama)
│  └─ plans/2026-09-30-money-review.md          ← rencana implementasi
├─ netlify.toml              ← build, publish dir, SPA redirect
├─ .githooks/  scripts/      ← hooks & setup SOP
└─ README.md  CHANGELOG.md
```

## Environment Variable

| Nama | Isi | Sumber |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL Supabase | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | anon / publishable key | Supabase → Project Settings → API Keys |

- Kunci anon memang aman berada di browser karena akses data dijaga RLS. **Jangan pernah** memakai `service_role` / secret key di sini.
- Lokal: buat file `.env` di root proyek (sudah di-gitignore, termasuk `.env.example` sesuai SOP):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

- Netlify: isi keduanya di **Site configuration → Environment variables**.

## Requirements

Requirements untuk development environment:
- Node.js 24+ dan npm 12+
- Operating Systems: macOS, Windows (termasuk WSL), dan Linux
- Project Supabase yang sudah disiapkan lewat `api-money-review/docs/setup-supabase.md`

## Metode Instalasi

1. **Clone proyek**

```bash
git clone <url-repo-github>/web-money-review.git
```

2. **Masuk ke folder proyek**

```bash
cd web-money-review
```

3. **Konfigurasi awal (Git identity dan Git Hooks)**

Linux/macOS/Git Bash:
```bash
./scripts/setup-hooks.sh
```

Windows PowerShell:
```ps
.\scripts\setup-hooks.ps1
```

4. **Install dependencies**

```bash
npm install
```

5. **Buat file `.env`** (lihat bagian Environment Variable)

6. **Start server (development)**

```bash
npm run dev
```

Buka http://localhost:5173 di browser Anda untuk melihat halaman.

Proyek ini menggunakan [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) dari Google Fonts dan ikon [Lucide](https://lucide.dev).

## _Unit Test_

Menjalankan pengetesan (logika `lib/`, lapisan `services/` dengan Supabase tiruan, dan komponen/halaman dengan React Testing Library):

```bash
npm test
```

Pemeriksaan lain:

```bash
npx tsc -b
npm run lint
npm run build
```

## Deploy (Netlify)

1. Push repo ke GitHub.
2. Netlify: **Add new site → Import an existing project → GitHub**, lalu pilih `web-money-review`.
3. Build settings dibaca dari `netlify.toml`: build `npm run build`, publish `dist`, Node 24. Semua route diarahkan ke `index.html`.
4. Isi environment variable, lalu jalankan **Deploy**.
5. **Production branch:** `main`. Setiap push ke `main` otomatis ter-deploy.

## Alur Git & Penyimpangan SOP

- Branch `main` dan `develop`, ditambah branch sementara `<tipe>/<issue>-<subtask>-<deskripsi>` (`feature/*`, `fix/*`, `docs/*`, …), digabung ke `develop` lewat PR/merge `--no-ff`.
- Conventional Commits (divalidasi hook `commit-msg`), commit signing SSH, dan larangan commit langsung di `main`/`develop` (hook `pre-commit`).
- SemVer dengan tag beranotasi. CHANGELOG memakai format Keep a Changelog.
- Tanpa file LICENSE (proyek pribadi).

| SOP | Proyek ini | Alasan |
|---|---|---|
| Remote hanya Gitea | Remote di **GitHub** | Netlify hanya bisa auto-deploy dari GitHub/GitLab/Bitbucket |
| PR di-review minimal 1 developer lain | Di-review sendiri oleh pemilik | Hanya ada satu developer |
| Secret di Infisical | Environment variable Netlify + `.env` lokal (di-gitignore) | Web hanya memakai kunci publik |
| MySQL | PostgreSQL (Supabase) | Detail adaptasi di README `api-money-review` |

## Sumber Lainnya

- Design spec: [docs/superpowers/specs/2026-09-30-money-review-design.md](docs/superpowers/specs/2026-09-30-money-review-design.md)
- Rencana implementasi: [docs/superpowers/plans/2026-09-30-money-review.md](docs/superpowers/plans/2026-09-30-money-review.md)
- [React Documentation](https://react.dev): belajar mengenai fitur dan API React
- [Supabase Documentation](https://supabase.com/docs): Auth, Database, RLS, dan `supabase-js`
- [TanStack Query](https://tanstack.com/query/latest): pengambilan & cache data
- [Tailwind CSS](https://tailwindcss.com/docs): utility CSS
- [Chart.js](https://www.chartjs.org/docs/latest/): grafik
- [Netlify Docs](https://docs.netlify.com): deploy & environment variable
