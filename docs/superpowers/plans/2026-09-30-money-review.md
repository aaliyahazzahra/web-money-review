# Money Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun web pribadi pencatat pemasukan/pengeluaran (`web-money-review`) beserta skema Supabase-nya (`api-money-review`), sesuai spec.

**Architecture:** React SPA di Netlify berbicara langsung ke Supabase (Auth + PostgREST). Keamanan dijaga oleh RLS. Join hanya lewat view `vw_transactions`. Audit dan activity log diisi oleh trigger. Frontend dibagi menjadi beberapa lapisan:

- `lib/`: logika murni.
- `services/`: satu-satunya lapisan yang memanggil Supabase.
- `hooks/`: TanStack Query.
- `components/` dan `pages/`: tampilan.

**Tech Stack:**

- Node 24 / npm 12, Vite 8, React 19, TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`), React Router 8 (`react-router`), TanStack Query 5, Chart.js 4 + `react-chartjs-2`, `lucide-react`, `@supabase/supabase-js` 2.
- Pengujian: Vitest + React Testing Library + jsdom.
- Database: PostgreSQL (Supabase) + `pg_cron`.

**Spec:** `docs/superpowers/specs/2026-09-30-money-review-design.md` (di repo `web-money-review`). File spec ini **tidak boleh dihapus**.

## Global Constraints

**Repositori & Git**

- Kedua repo dibuat dari `D:\Code\template-sop-nf` **tanpa LICENSE**, dengan `git config core.hooksPath .githooks`.
- Commit mengikuti Conventional Commits (`^(build|ci|docs|feat|fix|perf|refactor|style|test)(\(scope\))?: .+`). Commit ditandatangani SSH (sudah dikonfigurasi global).
- Commit hanya di branch sementara `<tipe>/<issue>-<subtask>-<deskripsi>`. Hook `pre-commit` menolak commit di `main`/`develop`. Branch digabung ke `develop` dengan `git merge --no-ff`.
- `.gitignore` mengecualikan `node_modules`, `dist`, `coverage`, `*.log`, `.env`, `.env.*` (termasuk `.env.example`).

**Tampilan**

- Teks UI **bahasa Inggris**, pesan singkat. Contoh copy: `Transaction added`, `Saved`, `Transaction deleted`, `Failed to save, try again`, `Couldn't load data`, `Retry`, `Invalid email or password`, `Session expired, please log in`, `Category already exists`, `Amount is required`, `Category is required`.
- **Tidak ada emoji**. Ikon hanya dari `lucide-react`.
- Uang: `Rp 25.000` (spasi biasa, titik ribuan, tanpa desimal).
  - Expense diawali `−` (U+2212) + ikon `ArrowDown`.
  - Income diawali `+` + ikon `ArrowUp`.
  - Nominal memakai `tabular-nums`.
- `MAX_AMOUNT = 999_999_999_999`. Note maks 255 karakter. Nama kategori maks 50 karakter. Password baru min. 8 karakter.
- Tanggal disimpan `YYYY-MM-DD` dan ditampilkan `30 Sep 2026` (en-GB). Bulan ditampilkan `Sep 2026`.
- Breakpoint HP/laptop: `768px` (Tailwind `md`). Di HP: bottom nav 4 tab (Home, Transactions, Charts, Settings). Di `md` ke atas: sidebar kiri.
- Font: Plus Jakarta Sans (Google Fonts).
- Token warna (light / dark):

| Token | Light | Dark |
|---|---|---|
| `bg` | `#FFF9F2` | `#000000` |
| `surface` | `#F3E6D5` | `#1A0A0A` |
| `text` | `#2A0A10` | `#FFF9F2` |
| `text-muted` | `#6B4A4F` | `#B8A9A0` |
| `primary` | `#800020` | `#BC0202` |
| `primary-pressed` | `#5E0018` | `#830000` |
| `accent` | `#D45060` | `#FF0000` |
| `expense` | `#800020` | `#FF4D4D` |
| `income` | `#3F7D58` | `#5FB57F` |

- `CATEGORY_COLORS = ['#3F7D58','#2F6B9A','#C58B1A','#6A4C93','#1F8A8A','#8A6A4F','#5A7D2A','#B5651D','#4A5A8C','#7A7A7A']`
- Inaktivitas 7 hari (`604_800_000` ms). Key `localStorage`: `mr:lastActivity`, `mr:theme`.
- Env web: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Kunci service role tidak pernah dipakai di web.

**Database**

- Nama objek memakai `tb_` / `vw_` / `fn_` + snake_case.
- PK `bigint generated always as identity`. Waktu memakai `timestamptz`.
- Kolom audit `created_at/by`, `updated_at/by`, `deleted_at/by` di `tb_categories` dan `tb_transactions`.
- Tidak ada hard delete dari klien.

## Review Focus

1. **Nominal yang di-paste berisi teks** (`Rp 25.000`, `25,000`, ` 25000 `) harus menjadi `25000`. Input yang melebihi `MAX_AMOUNT` diabaikan, dan nilai sebelumnya dipertahankan. Tes di Task 6.
2. **Tanggal "hari ini" menjelang tengah malam WIB** harus memakai tanggal lokal, bukan UTC. Contoh: `2026-10-01T00:30+07:00` harus menjadi `2026-10-01`, bukan `2026-09-30`. Tes di Task 7.
3. **Pergantian tahun:** rentang bulan Desember dan seri 6 bulan yang melewati Januari harus benar, dan bulan tanpa transaksi bernilai 0. Tes di Task 7.
4. **Kategori terarsip:**
   - Tetap tampil (nama + ikon) di daftar dan tetap dihitung di grafik.
   - Tidak muncul di pemilih kategori form.
   - Nama kategori terarsip boleh dipakai lagi untuk kategori baru.

   Tes di Task 7, Task 11, dan cek SQL di Task 4.
5. **`localStorage` tidak tersedia/throw** (private mode) tidak boleh membuat app crash. Inaktivitas dianggap aktif dan tema dianggap `system`. Tes di Task 8.

---

## Fase A — `api-money-review`

### Task 1: Inisialisasi repo `api-money-review`

**Files:**
- Create: `D:\Code\api-money-review\{.githooks/, scripts/, README.md, CHANGELOG.md, .gitignore}` (disalin dari template, tanpa LICENSE)

**Interfaces:**
- Produces: repo dengan branch `main` (initial commit), `develop`, dan branch kerja `feature/1-1-schema`.

- [ ] **Step 1:** Di `D:\Code\api-money-review`, jalankan `git init -b main`. Salin `.githooks`, `scripts`, `README.md`, `CHANGELOG.md` dari `../template-sop-nf`. Buat `.gitignore` berisi `.env`, `.env.*`, `*.log`, `supabase/.temp/`.
- [ ] **Step 2:** Buat commit `docs: initial commit dari template-sop-nf` (sebelum hooks aktif), lalu jalankan `git config core.hooksPath .githooks`, `git switch -c develop`, dan `git switch -c feature/1-1-schema`.
- [ ] **Step 3: Verifikasi.** `git log --oneline` menampilkan 1 commit. `git branch` menampilkan `main`, `develop`, dan `* feature/1-1-schema`. `ls LICENSE` gagal (file memang tidak ada).

### Task 2: Tipe, tabel, dan trigger audit

**Files:**
- Create: `sql/001_types_and_tables.sql`
- Create: `sql/002_audit_triggers.sql`

**Interfaces:**
- Produces:
  - Tipe `public.transaction_type`.
  - Tabel `public.tb_categories` dan `public.tb_transactions` (kolom persis sesuai spec §6.3).
  - Function `public.fn_set_audit_fields()`.

- [ ] **Step 1:** Tulis `001_types_and_tables.sql`:
  - `create type transaction_type as enum ('expense','income')`.
  - Kedua tabel sesuai spec §6.3, termasuk:
    - `user_id uuid not null default auth.uid() references auth.users(id)`.
    - Kolom `_by` mereferensikan `auth.users(id)`.
    - `tb_categories`: `unique (id, type)`.
    - Unique index parsial `ux_tb_categories_user_type_name on (user_id, type, lower(name)) where deleted_at is null`.
    - `check (char_length(name) between 1 and 50)`.
    - `tb_transactions`: FK komposit `(category_id, type) references tb_categories(id, type)` dengan `on delete no action on update no action`.
    - `check (amount > 0 and amount <= 999999999999)`.
    - `note varchar(255)`.
    - Index `ix_tb_transactions_user_date (user_id, transaction_date)`, `ix_tb_transactions_category (category_id)`, `ix_tb_categories_user (user_id)`.
  - File diawali komentar urutan eksekusi.
- [ ] **Step 2:** Tulis `002_audit_triggers.sql` berisi `fn_set_audit_fields()` (`language plpgsql`, `set search_path = public`):
  - **INSERT:** `created_at = now()`, `created_by = auth.uid()`, `updated_* = null`, dan `deleted_*` dipaksa null.
  - **UPDATE:**
    - `created_*` dan `user_id` dikembalikan ke nilai `OLD`.
    - `updated_at = now()`, `updated_by = auth.uid()`.
    - Jika `OLD.deleted_at is null and NEW.deleted_at is not null`, maka `deleted_at = now()` dan `deleted_by = auth.uid()`.
    - Jika `OLD.deleted_at is not null`, maka `deleted_*` dikembalikan ke `OLD` (tidak bisa di-undelete dari klien).
    - Untuk `tb_categories`, `NEW.type := OLD.type` (jenis tidak bisa diubah).
  - Pasang trigger `trg_tb_categories_audit` dan `trg_tb_transactions_audit` (`before insert or update ... for each row`).
- [ ] **Step 3: Verifikasi sintaks.** Jika ada Postgres/Docker lokal, jalankan kedua file di database kosong (dengan stub skema `auth` + `auth.uid()`). Jika tidak ada, review manual dan tandai untuk dicek di Task 4 Step 4.
- [ ] **Step 4: Commit.** `git add sql && git commit -m "feat(db): menambahkan tabel kategori, transaksi, dan trigger audit"`

### Task 3: RLS, view, activity log, dan retensi

**Files:**
- Create: `sql/003_rls_policies.sql`
- Create: `sql/004_views.sql`
- Create: `sql/005_activity_logs.sql`
- Create: `sql/006_log_retention_cron.sql`

**Interfaces:**
- Consumes: tabel dari Task 2.
- Produces:
  - View `public.vw_transactions` dengan kolom `id, type, amount, category_id, transaction_date, note, created_at, category_name, category_icon, category_color, category_archived boolean`.
  - RPC `public.fn_log_activity(p_activity text) returns void`.
  - Tabel `public.tb_activity_logs`.

- [ ] **Step 1:** Tulis `003_rls_policies.sql`:
  - `enable row level security` di `tb_categories` dan `tb_transactions`.
  - Policy `select` / `insert` / `update` `to authenticated` dengan `user_id = auth.uid()` (insert/update memakai `with check` yang sama).
  - Untuk transaksi, `with check` juga mewajibkan `exists (select 1 from tb_categories c where c.id = category_id and c.user_id = auth.uid())`.
  - **Tidak ada** policy `delete`.
  - `revoke delete on tb_categories, tb_transactions from anon, authenticated`.
  - `revoke all ... from anon`.
- [ ] **Step 2:** Tulis `004_views.sql`:
  - `create view vw_transactions with (security_invoker = true) as` join `tb_transactions t` dengan `tb_categories c on c.id = t.category_id`.
  - Filter `where t.deleted_at is null`.
  - `category_archived = (c.deleted_at is not null)`.
  - `grant select on vw_transactions to authenticated`.
- [ ] **Step 3:** Tulis `005_activity_logs.sql`:
  - Tabel `tb_activity_logs` (spec §6.3) dengan RLS aktif dan policy `select` milik sendiri saja.
  - `fn_client_meta()`, internal, mengembalikan `(ip_address, user_agent)` dari `current_setting('request.headers', true)::json`. Nilainya adalah elemen pertama dari `x-forwarded-for` dan `user-agent` dipotong 255 karakter, dengan null-safe.
  - `fn_log_row_change()` (`security definer`, `set search_path = public`), `after insert or update`:
    - Menentukan activity `<entity>.create` / `.update` / `.delete` (delete = `deleted_at` berubah dari null menjadi terisi).
    - `entity` bernilai `transaction` / `category` dari `TG_TABLE_NAME`.
    - Menyisipkan log.
  - `fn_log_activity(p_activity text)` (`security definer`):
    - Hanya menerima `'login'`; nilai lain memicu `raise exception`.
    - Memakai `auth.uid()`; jika null memicu `raise exception`.
    - `grant execute ... to authenticated`, `revoke ... from anon, public`.
- [ ] **Step 4:** Tulis `006_log_retention_cron.sql`:
  - `create extension if not exists pg_cron`.
  - `select cron.schedule('purge_activity_logs', '15 17 * * *', $$delete from public.tb_activity_logs where created_at < now() - interval '1 year'$$)`. Waktu 17:15 UTC = 00:15 WIB.
- [ ] **Step 5: Verifikasi.** Sama seperti Task 2 Step 3.
- [ ] **Step 6: Commit.** `git commit -m "feat(db): menambahkan RLS, vw_transactions, activity log, dan retensi log"`

### Task 4: Seed, dokumentasi setup, dan checklist keamanan

**Files:**
- Create: `seed/default_categories.sql`
- Create: `docs/setup-supabase.md`
- Create: `docs/security-checklist.md`
- Modify: `README.md` (isi lengkap)
- Modify: `CHANGELOG.md` (entri `0.1.0`)

**Interfaces:**
- Consumes: semua SQL Task 2–3.

- [ ] **Step 1:** Tulis `seed/default_categories.sql`:
  - Variabel owner diambil dengan `select id from auth.users where email = :'owner_email'`. Di SQL Editor dipakai CTE dengan placeholder `'OWNER_EMAIL'` yang wajib diganti.
  - Insert 11 kategori spec §6.6 (nama + ikon persis). Warna diambil dari `CATEGORY_COLORS` berurutan: expense indeks 0–6, income indeks 7, 8, 9, 0.
  - `created_by` diisi langsung karena seed berjalan sebagai `postgres`, sehingga `auth.uid()` null.
  - Idempotent: `on conflict do nothing` lewat unique index parsial.
- [ ] **Step 2:** Tulis `docs/setup-supabase.md` dengan langkah bernomor:
  1. Buat project (region Singapore).
  2. Auth → matikan "Allow new users to sign up".
  3. Auth → Users → Add user (email + password, auto-confirm).
  4. SQL Editor: jalankan `sql/001`–`006` berurutan.
  5. Jalankan seed setelah mengganti `OWNER_EMAIL`.
  6. Ambil Project URL + anon/publishable key untuk web.
- [ ] **Step 3:** Tulis `docs/security-checklist.md`. Setiap item berisi perintah/query dan hasil yang diharapkan:
  - `curl` signup ke `/auth/v1/signup` harus ditolak (`Signups not allowed`).
  - `GET /rest/v1/tb_transactions` dengan anon key tanpa login harus ditolak atau mengembalikan `[]`.
  - User uji kedua tidak melihat data pemilik (lalu user uji dihapus).
  - `DELETE /rest/v1/tb_transactions?id=eq.X` ditolak.
  - `PATCH` dengan `created_by`/`created_at` palsu harus diabaikan (nilai lama tetap).
  - Membuat kategori terarsip dengan nama sama harus berhasil.
  - Transaksi dengan `type` yang tidak cocok dengan kategorinya harus ditolak (FK komposit).
  - `rpc/fn_log_activity` dengan `'hack'` ditolak.
- [ ] **Step 4:** **[Aksi pemilik]** Pemilik menjalankan `docs/setup-supabase.md` dan `docs/security-checklist.md` di Supabase. Claude tidak membuat akun atau memasukkan password. Semua kegagalan SQL diperbaiki di file terkait, lalu di-commit dengan `fix(db): ...`.
- [ ] **Step 5:** Isi `README.md` mengikuti struktur template SOP dan detail spec:
  - Judul & deskripsi.
  - URL (Supabase project, tanpa key).
  - Tujuan, sasaran pengguna, tech stack.
  - Arsitektur (diagram spec §3).
  - Struktur repo.
  - Adaptasi SOP ke PostgreSQL (tabel spec §6.2).
  - Skema tabel lengkap (spec §6.3).
  - Function/trigger (§6.4) dan RLS (§6.5).
  - Seed.
  - Penyimpangan SOP (§4).
  - Requirements & instalasi (setup-hooks, lalu setup-supabase).
  - Keamanan (tautan checklist).
  - Tautan ke spec di repo web.
- [ ] **Step 6:** Tambahkan entri `CHANGELOG.md` `## [0.1.0] - <tanggal>` dengan bagian `### Added`.
- [ ] **Step 7: Commit & merge.**
  - `git commit -m "docs: menambahkan seed, panduan setup, dan checklist keamanan"`
  - `git switch develop && git merge --no-ff feature/1-1-schema`

---

## Fase B — `web-money-review`

Sebelum Task 5: `git switch develop && git merge --no-ff docs/1-1-design-spec`, lalu setiap task memakai branch `feature/<n>-1-<deskripsi>` dari `develop` dan di-merge `--no-ff` ke `develop` di akhir task. Contoh: Task 5 memakai `feature/2-1-scaffold`.

### Task 5: Scaffold proyek, tema, dan konfigurasi deploy

**Files:**
- Delete: `supabase/` (folder kosong)
- Create:
  - `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `.gitignore`, `netlify.toml`
  - `src/main.tsx`, `src/index.css`, `src/test/setup.ts`, `src/types.ts`
  - Test: `src/test/smoke.test.ts`

**Interfaces:**
- Produces: `src/types.ts`:

```ts
export type TransactionType = 'expense' | 'income'
export interface Category { id: number; name: string; type: TransactionType; icon: string; color: string; archived: boolean }
export interface Transaction {
  id: number; type: TransactionType; amount: number; categoryId: number
  date: string; note: string | null
  categoryName: string; categoryIcon: string; categoryColor: string; categoryArchived: boolean
}
export interface TransactionInput { type: TransactionType; amount: number; categoryId: number; date: string; note: string | null }
```

- Produces: npm scripts `dev`, `build` (`tsc -b && vite build`), `test` (`vitest run`), `lint`. Kelas Tailwind `bg-bg`, `bg-surface`, `text-text`, `text-muted`, `bg-primary`, `text-expense`, `text-income`, `text-accent`, dst.

- [ ] **Step 1:** Scaffold dengan `npm create vite@latest . -- --template react-ts` (atau buat manual setara, tanpa menimpa README/CHANGELOG/docs). Pasang dependency runtime dan dev: `tailwindcss @tailwindcss/vite react-router @tanstack/react-query chart.js react-chartjs-2 lucide-react @supabase/supabase-js`, lalu `-D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`. Hapus aset demo Vite.
- [ ] **Step 2:** Konfigurasi.
  - `vite.config.ts`: plugin react + tailwind; `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true }`.
  - `.gitignore`: sesuai Global Constraints.
  - `netlify.toml`: `[build] command = "npm run build"`, `publish = "dist"`, `[build.environment] NODE_VERSION = "24"`, `[[redirects]] from = "/*" to = "/index.html" status = 200`.
- [ ] **Step 3:** Tulis `src/index.css`:
  - `@import "tailwindcss"`.
  - Token warna light di `:root`, override di `:root[data-theme="dark"]`.
  - `@theme inline` yang memetakan `--color-bg: var(--bg)` dst.
  - `body` dengan `background: var(--bg)`, `color: var(--text)`, dan font Plus Jakarta Sans (link Google Fonts di `index.html`).
  - `index.html` berisi `<title>Money Review</title>`, `lang="en"`, dan viewport meta.
- [ ] **Step 4:** Tulis tes `smoke.test.ts` yang memastikan `1 + 1 === 2` sebagai bukti setup berjalan. Jalankan `npm test` (harus PASS) dan `npm run build` (sukses, `dist/` terbentuk).
- [ ] **Step 5: Commit.** `git commit -m "build: scaffold vite react typescript tailwind dan konfigurasi netlify"`

### Task 6: `lib/money.ts`

**Files:**
- Create: `src/lib/money.ts`
- Test: `src/lib/money.test.ts`

**Interfaces:**
- Produces:
  - `MAX_AMOUNT = 999_999_999_999`
  - `formatRupiah(amount: number): string`, contoh `"Rp 25.000"`
  - `formatSignedRupiah(amount: number, type: TransactionType): string`, contoh `"−Rp 25.000"` / `"+Rp 25.000"`
  - `parseAmountInput(raw: string): number | null`
  - `formatAmountInput(amount: number | null): string`, contoh `"25.000"` atau `""`

- [ ] **Step 1: Tulis tes yang gagal.**
  - `formatRupiah(25000) === 'Rp 25.000'` (spasi biasa, bukan NBSP).
  - `formatRupiah(0) === 'Rp 0'`.
  - `formatRupiah(1234567) === 'Rp 1.234.567'`.
  - `formatSignedRupiah(25000,'expense') === '\u2212Rp 25.000'`.
  - `formatSignedRupiah(25000,'income') === '+Rp 25.000'`.
  - `parseAmountInput('25000') === 25000`.
  - `parseAmountInput('Rp 25.000') === 25000`.
  - `parseAmountInput('25,000') === 25000`.
  - `parseAmountInput(' 25000 ') === 25000`.
  - `parseAmountInput('') === null`.
  - `parseAmountInput('abc') === null`.
  - `parseAmountInput('0') === 0`.
  - `parseAmountInput('1000000000000') === null` (melebihi MAX).
  - `formatAmountInput(25000) === '25.000'`.
  - `formatAmountInput(null) === ''`.
- [ ] **Step 2:** `npx vitest run src/lib/money.test.ts` harus FAIL (modul tidak ada).
- [ ] **Step 3:** Implementasikan.
  - Parse: buang semua non-digit. Hasil kosong berarti `null`. Nilai `> MAX_AMOUNT` berarti `null`.
  - Format: pengelompokan titik manual atau via `toLocaleString('id-ID')`, lalu normalisasi spasi.
- [ ] **Step 4:** Tes PASS.
- [ ] **Step 5: Commit.** `feat(lib): menambahkan format dan parse nominal rupiah`

### Task 7: `lib/dates.ts` dan `lib/summary.ts`

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/summary.ts`
- Test: `src/lib/dates.test.ts`, `src/lib/summary.test.ts`

**Interfaces:**
- Produces (`dates.ts`, semua tanggal berupa string `YYYY-MM-DD`, bulan berupa `YYYY-MM`):
  - `todayISO(now?: Date): string` (tanggal **lokal**)
  - `currentMonthKey(now?: Date): string`
  - `monthRange(monthKey: string): { from: string; to: string }` (inklusif)
  - `lastNMonths(endMonthKey: string, n: number): string[]` (urut naik)
  - `shiftMonth(monthKey: string, delta: number): string`
  - `formatDisplayDate(iso: string): string`, contoh `'30 Sep 2026'`
  - `formatMonthLabel(monthKey: string): string`, contoh `'Sep 2026'`
- Produces (`summary.ts`):
  - `monthlySummary(txs: Transaction[]): { income: number; expense: number; net: number }`
  - `expenseByCategory(txs: Transaction[]): { categoryId: number; name: string; color: string; total: number; percent: number }[]` (urut total menurun; `percent` dibulatkan 1 desimal)
  - `monthlySeries(txs: Transaction[], months: string[]): { month: string; income: number; expense: number }[]`
  - `groupByDate(txs: Transaction[]): { date: string; items: Transaction[] }[]` (tanggal menurun, urutan item dalam grup dipertahankan)

- [ ] **Step 1: Tulis tes yang gagal.**
  - `dates`:
    - `todayISO(new Date(2026, 9, 1, 0, 30)) === '2026-10-01'` (konstruktor lokal; implementasi tidak boleh memakai `toISOString`).
    - `monthRange('2026-02')` → `{from:'2026-02-01',to:'2026-02-28'}`.
    - `monthRange('2028-02').to === '2028-02-29'`.
    - `monthRange('2026-12')` → `{from:'2026-12-01',to:'2026-12-31'}`.
    - `lastNMonths('2027-02', 6)` → `['2026-09','2026-10','2026-11','2026-12','2027-01','2027-02']`.
    - `shiftMonth('2026-01', -1) === '2025-12'`.
    - `formatDisplayDate('2026-09-30') === '30 Sep 2026'`.
    - `formatMonthLabel('2026-09') === 'Sep 2026'`.
  - `summary`, dengan fixture 4 transaksi (2 expense beda kategori, salah satunya `categoryArchived: true`, 1 income, 1 expense bulan lain):
    - `monthlySummary` menghasilkan income/expense/net benar dan `net` bisa negatif.
    - `expenseByCategory` menyertakan kategori terarsip, total & percent benar, urutan menurun, dan array kosong menghasilkan `[]`.
    - `monthlySeries(txs, lastNMonths('2027-01', 3))` mengisi bulan kosong dengan `{income:0, expense:0}`.
    - `groupByDate` mengembalikan tanggal menurun.
- [ ] **Step 2:** Tes FAIL.
- [ ] **Step 3:** Implementasikan.
  - Aritmetika bulan memakai `new Date(y, m, 0).getDate()` untuk hari terakhir.
  - Format tampilan memakai `Intl.DateTimeFormat('en-GB', { day:'numeric', month:'short', year:'numeric', timeZone:'UTC' })` pada `Date.UTC(...)` supaya bebas dari zona waktu.
- [ ] **Step 4:** Tes PASS.
- [ ] **Step 5: Commit.** `feat(lib): menambahkan utilitas tanggal dan agregasi ringkasan`

### Task 8: `lib/inactivity.ts`, `lib/theme.ts`, dan `lib/icons.ts`

**Files:**
- Create: `src/lib/inactivity.ts`, `src/lib/theme.ts`, `src/lib/icons.ts`
- Test: `src/lib/inactivity.test.ts`, `src/lib/theme.test.ts`

**Interfaces:**
- Produces (`inactivity.ts`, `storage` bertipe `Pick<Storage,'getItem'|'setItem'>`):
  - `INACTIVITY_LIMIT_MS = 604_800_000`
  - `readLastActivity(storage): number | null` (throw atau nilai rusak menghasilkan `null`)
  - `recordActivity(storage, now: number): void` (tidak menulis jika nilai tersimpan < 60 detik yang lalu; throw ditelan)
  - `isInactive(last: number | null, now: number): boolean` (`null` → `false`)
- Produces (`theme.ts`):
  - `type ThemePref = 'system' | 'light' | 'dark'`
  - `loadThemePref(storage): ThemePref` (default & saat throw → `'system'`)
  - `saveThemePref(storage, pref): void`
  - `resolveTheme(pref, prefersDark: boolean): 'light' | 'dark'`
  - `applyTheme(theme: 'light'|'dark'): void` (set `document.documentElement.dataset.theme`)
- Produces (`icons.ts`):
  - `CATEGORY_ICONS: Record<string, LucideIcon>`. Kunci berupa nama kebab-case, sekitar 30 ikon, termasuk semua ikon seed: `utensils, bus, shopping-bag, receipt, clapperboard, heart-pulse, circle-ellipsis, wallet, gift, hand-coins`, ditambah `car, fuel, home, zap, droplet, wifi, smartphone, graduation-cap, book, shirt, baby, dog, plane, coffee, dumbbell, pill, briefcase, piggy-bank, trending-up, landmark`.
  - `getCategoryIcon(name: string): LucideIcon` (fallback `CircleEllipsis`)
  - `CATEGORY_COLORS` (sesuai Global Constraints)

- [ ] **Step 1: Tulis tes yang gagal.**
  - `isInactive(null, t) === false`.
  - `isInactive(t - 604_800_000 + 1, t) === false`.
  - `isInactive(t - 604_800_001, t) === true`.
  - `readLastActivity` dengan storage yang `getItem` melempar error mengembalikan `null`.
  - `readLastActivity` dengan nilai `'abc'` mengembalikan `null`.
  - `recordActivity` 2x berselang 30 detik hanya memanggil `setItem` sekali; berselang 61 detik memanggil dua kali.
  - `recordActivity` dengan storage yang throw tidak melempar error.
  - `loadThemePref` dengan storage yang throw mengembalikan `'system'`; dengan nilai `'purple'` juga `'system'`.
  - `resolveTheme('system', true) === 'dark'`.
  - `resolveTheme('light', true) === 'light'`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan. **Step 4:** PASS.
- [ ] **Step 5: Commit.** `feat(lib): menambahkan aturan inaktivitas, tema, dan daftar ikon kategori`

### Task 9: Lapisan `services/` dan `hooks/`

**Files:**
- Create:
  - `src/services/supabase.ts`, `src/services/auth.ts`, `src/services/transactions.ts`, `src/services/categories.ts`, `src/services/errors.ts`
  - `src/hooks/useCategories.ts`, `src/hooks/useTransactions.ts`
- Test: `src/services/transactions.test.ts`, `src/services/categories.test.ts`

**Interfaces:**
- Produces (`services`, semua async dan melempar `Error` saat gagal):
  - `supabase`: client dari `import.meta.env.VITE_SUPABASE_URL/ANON_KEY` (throw jelas jika env kosong)
  - `auth.ts`:
    - `signIn(email, password): Promise<void>`: sukses lalu memanggil `rpc('fn_log_activity',{p_activity:'login'})` (kegagalan log diabaikan); kredensial salah melempar `InvalidCredentialsError`
    - `signOut(): Promise<void>`
    - `getSession()`
    - `onAuthChange(cb: (signedIn: boolean) => void): () => void`
    - `changePassword(current: string, next: string): Promise<void>`: login ulang dengan email sesi + `current`; gagal melempar `InvalidCredentialsError`; lalu `updateUser({ password: next })`
  - `transactions.ts`:
    - `listTransactions(f: { from: string; to: string; categoryId?: number }): Promise<Transaction[]>`: dari `vw_transactions`, `gte/lte transaction_date`, urut `transaction_date desc, id desc`
    - `listRecentTransactions(limit = 5): Promise<Transaction[]>`
    - `createTransaction(i: TransactionInput): Promise<void>`
    - `updateTransaction(id: number, i: TransactionInput): Promise<void>`
    - `deleteTransaction(id: number): Promise<void>`: `update({ deleted_at: new Date().toISOString() })`, **tidak pernah** `.delete()`
  - `categories.ts`:
    - `listCategories(): Promise<Category[]>`: semua, termasuk yang terarsip, `archived = deleted_at !== null`
    - `createCategory(c: { name: string; type: TransactionType; icon: string }): Promise<void>`: `color = CATEGORY_COLORS[totalCategoryCount % 10]`
    - `updateCategory(id, c: { name: string; icon: string }): Promise<void>`
    - `archiveCategory(id): Promise<void>`
    - Kode Postgres `23505` → `DuplicateCategoryError`
  - `errors.ts`: `InvalidCredentialsError`, `DuplicateCategoryError`
  - Pemetaan snake_case → camelCase dilakukan di `services`
- Produces (`hooks`):
  - `useCategories()`, key `['categories']`
  - `useTransactions(filter)`, key `['transactions', filter]`
  - `useRecentTransactions()`, key `['transactions','recent']`
  - `useSaveTransaction()`: mutation `{ id?: number; input: TransactionInput }`
  - `useDeleteTransaction()`
  - `useCategoryMutations()`: `{ create, update, archive }`
  - Semua mutation meng-invalidate `['transactions']` dan/atau `['categories']`
  - QueryClient memakai `refetchOnWindowFocus: true`, `retry: 1`

- [ ] **Step 1: Tulis tes yang gagal.** Gunakan `vi.mock('./supabase')` dengan query builder palsu yang merekam pemanggilan.
  - `deleteTransaction(7)` memanggil `from('tb_transactions').update({deleted_at: <string>}).eq('id', 7)` dan tidak memanggil `delete`.
  - `listTransactions({from:'2026-09-01',to:'2026-09-30'})` membaca `vw_transactions` dan memetakan `category_archived` → `categoryArchived`.
  - `createCategory` dengan 12 kategori yang sudah ada memakai `CATEGORY_COLORS[2]`.
  - Error `{code:'23505'}` → `DuplicateCategoryError`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan services + hooks. **Step 4:** PASS, dan `npm run build` sukses.
- [ ] **Step 5: Commit.** `feat(services): menambahkan lapisan supabase dan hook data`

### Task 10: Shell app — router, auth guard, login, navigasi, toast, dialog

**Files:**
- Create:
  - `src/App.tsx`
  - `src/components/AppLayout.tsx`, `src/components/AppNav.tsx`, `src/components/Toast.tsx`, `src/components/ConfirmDialog.tsx`, `src/components/QueryState.tsx`
  - `src/pages/LoginPage.tsx`
  - `src/hooks/useAuth.ts`, `src/hooks/useInactivityGuard.ts`, `src/hooks/useTheme.ts`
- Modify: `src/main.tsx`
- Test: `src/pages/LoginPage.test.tsx`, `src/hooks/useInactivityGuard.test.tsx`

**Interfaces:**
- Produces:
  - Route: `/login`, `/` (Home), `/transactions`, `/charts`, `/settings`. Route selain `/login` dibungkus `RequireAuth` (redirect ke `/login` jika belum login; tampil skeleton saat sesi dicek). `*` diarahkan ke `/`.
  - `ToastProvider` + `useToast(): { show(message: string, kind?: 'success'|'error'): void }` (hilang otomatis setelah 3 detik, posisi bawah, `role="status"`).
  - `ConfirmDialog` props `{ open, title, message, confirmLabel, onConfirm, onCancel }` (`role="dialog"`).
  - `QueryState` props `{ isLoading, isError, onRetry, children }` (skeleton / `Couldn't load data` + `Retry`).
  - `useTheme(): { pref, setPref }` (menerapkan tema ke `<html>` dan mengikuti perubahan `prefers-color-scheme` saat `system`).
  - `useInactivityGuard()`:
    - Saat mount dan `visibilitychange` → visible: jika `isInactive`, maka `signOut()` lalu navigasi ke `/login` dengan `state: { expired: true }`; jika tidak, `recordActivity`.
    - Juga `recordActivity` pada `pointerdown`/`keydown`.
  - `AppNav`: bottom nav `md:hidden` + sidebar `hidden md:flex`, ikon Lucide `House, List, ChartPie, Settings`, tab aktif ditandai warna `accent`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `LoginPage`:
    - Submit memanggil `signIn(email, password)`.
    - Saat `InvalidCredentialsError`, tampil teks `Invalid email or password`.
    - Tombol `Log in` disabled selama proses.
    - Dengan `state.expired`, tampil `Session expired, please log in`.
    - Tidak ada teks `Sign up`.
  - `useInactivityGuard`:
    - `localStorage` berisi waktu 8 hari lalu → `signOut` dipanggil sekali.
    - 1 hari lalu → tidak dipanggil.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan. **Step 4:** PASS.
- [ ] **Step 5: Verifikasi manual.** Buat `.env` lokal (diisi pemilik). Jalankan `npm run dev`, lalu cek di viewport 375px dan 1280px: login, pindah tab, logout via hapus sesi.
- [ ] **Step 6: Commit.** `feat(app): menambahkan routing, login, navigasi, toast, dan guard inaktivitas`

### Task 11: Form transaksi

**Files:**
- Create: `src/components/AmountInput.tsx`, `src/components/CategoryPicker.tsx`, `src/components/TransactionForm.tsx`
- Test: `src/components/AmountInput.test.tsx`, `src/components/CategoryPicker.test.tsx`, `src/components/TransactionForm.test.tsx`

**Interfaces:**
- Produces:
  - `AmountInput` props `{ value: number | null; onChange(v: number | null): void; error?: string }`:
    - `inputMode="numeric"`, prefix `Rp`, menampilkan `formatAmountInput(value)`.
    - Input yang `parseAmountInput`-nya `null` padahal teksnya berisi digit (melebihi MAX) diabaikan.
  - `CategoryPicker` props `{ categories: Category[]; type: TransactionType; value: number | null; onChange(id: number): void; error?: string }`:
    - Hanya menampilkan `!archived && c.type === type`.
    - Grid tombol ikon + nama, `aria-pressed` untuk yang terpilih.
  - `TransactionForm` props `{ initial?: Transaction; categories: Category[]; onSubmit(input: TransactionInput): Promise<void>; onDone?(): void; onDelete?(): void }`:
    - Toggle `Expense`/`Income` (default `expense`). Mengganti jenis mengosongkan kategori.
    - `Amount`, `Category`, `Date` (`<input type="date">`, default `todayISO()`), `Note` (maxLength 255), tombol `Save`.
    - Validasi: `Amount is required` (null atau 0) dan `Category is required`.
    - Mode baru: setelah sukses, reset amount/category/note, sedangkan type/date dipertahankan.
    - Gagal: nilai tetap ada dan error dilempar ulang ke pemanggil untuk toast.
    - Mode edit (`initial`) menampilkan tombol `Delete`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `AmountInput`:
    - Mengetik `25000` memanggil `onChange(25000)` dan menampilkan `25.000`.
    - Mengetik 13 digit tidak mengubah nilai.
  - `CategoryPicker`:
    - Kategori terarsip dan beda jenis tidak dirender.
    - Klik memanggil `onChange(id)`.
  - `TransactionForm`:
    - Submit kosong menampilkan kedua pesan validasi tanpa memanggil `onSubmit`.
    - Klik `Save` 2x cepat (`onSubmit` berupa promise yang belum resolve) hanya memanggil sekali.
    - `onSubmit` reject → nominal `25.000` masih tampil.
    - Sukses → nominal kosong, jenis tetap `income` jika sebelumnya income.
    - Ganti jenis → kategori terpilih dikosongkan.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan. **Step 4:** PASS.
- [ ] **Step 5: Commit.** `feat(ui): menambahkan form transaksi dengan input nominal dan pemilih kategori`

### Task 12: Halaman Home

**Files:**
- Create: `src/components/SummaryCards.tsx`, `src/components/TransactionList.tsx`, `src/pages/HomePage.tsx`
- Test: `src/components/SummaryCards.test.tsx`, `src/components/TransactionList.test.tsx`

**Interfaces:**
- Produces:
  - `SummaryCards` props `{ income: number; expense: number; net: number }`: label `Income`, `Expense`, `Net`. Net negatif memakai warna `expense` dan tanda `−`.
  - `TransactionList` props `{ transactions: Transaction[]; grouped?: boolean; onSelect?(t: Transaction): void }`:
    - Setiap baris: ikon kategori (`getCategoryIcon`), nama kategori, note (jika ada), dan `formatSignedRupiah` berwarna sesuai jenis dengan ikon `ArrowDown`/`ArrowUp`.
    - `grouped` memakai header `formatDisplayDate`.
    - Daftar kosong: `No transactions yet`.
  - `HomePage`: `SummaryCards` (bulan berjalan via `useTransactions(monthRange(currentMonthKey()))` + `monthlySummary`), `TransactionForm` (onSubmit → `useSaveTransaction`, toast `Transaction added` / `Failed to save, try again`), lalu `Recent` berisi `useRecentTransactions()`. Semua dibungkus `QueryState`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `SummaryCards` dengan net `-5000` menampilkan `−Rp 5.000`.
  - `TransactionList` menampilkan `−Rp 25.000` untuk expense dan `+Rp 1.000.000` untuk income.
  - Transaksi dengan kategori terarsip tetap menampilkan nama kategorinya.
  - Daftar kosong menampilkan `No transactions yet`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan. **Step 4:** PASS.
- [ ] **Step 5: Verifikasi manual** di 375px: input satu transaksi → toast muncul → ringkasan dan Recent diperbarui.
- [ ] **Step 6: Commit.** `feat(home): menambahkan ringkasan bulan, form input cepat, dan transaksi terbaru`

### Task 13: Halaman Transactions

**Files:**
- Create: `src/components/MonthPicker.tsx`, `src/pages/TransactionsPage.tsx`, `src/components/EditTransactionSheet.tsx`
- Test: `src/components/MonthPicker.test.tsx`, `src/pages/TransactionsPage.test.tsx`

**Interfaces:**
- Produces:
  - `MonthPicker` props `{ value: string; onChange(monthKey: string): void }`: tombol `ChevronLeft`/`ChevronRight` + label `formatMonthLabel` (dipakai ulang di Charts).
  - `EditTransactionSheet`: panel modal (bottom sheet di HP, dialog di tengah di `md`) berisi `TransactionForm` dengan `initial`.
  - `TransactionsPage`:
    - Filter `MonthPicker` (default bulan berjalan) + `<select>` kategori (`All categories` + semua kategori termasuk yang terarsip, diberi akhiran ` (archived)`).
    - `TransactionList grouped`.
    - `onSelect` membuka sheet.
    - Simpan → toast `Saved`.
    - Delete → `ConfirmDialog` (`Delete transaction?`, confirmLabel `Delete`) → `useDeleteTransaction` → toast `Transaction deleted`.

- [ ] **Step 1: Tulis tes yang gagal.**
  - `MonthPicker` dengan `2026-01` lalu klik prev → `onChange('2025-12')`.
  - `TransactionsPage` (hooks di-mock):
    - Klik baris lalu `Delete` → dialog muncul.
    - `Cancel` → mutation delete tidak dipanggil.
    - `Delete` → dipanggil dengan id benar.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan. **Step 4:** PASS.
- [ ] **Step 5: Commit.** `feat(transactions): menambahkan daftar transaksi dengan filter, edit, dan hapus`

### Task 14: Halaman Charts

**Files:**
- Create: `src/components/charts/ExpenseDonut.tsx`, `src/components/charts/MonthlyBars.tsx`, `src/pages/ChartsPage.tsx`, `src/lib/chartTheme.ts`
- Test: `src/pages/ChartsPage.test.tsx`

**Interfaces:**
- Consumes: `expenseByCategory`, `monthlySeries`, `lastNMonths`, `monthRange`, `MonthPicker`.
- Produces:
  - `ChartsPage`:
    - `MonthPicker` (default bulan berjalan).
    - Satu query `useTransactions({ from: monthRange(first).from, to: monthRange(selected).to })` untuk 6 bulan, lalu disaring ke bulan terpilih untuk donut.
    - Layout: dua kolom di `lg`, satu kolom di HP.
  - `ExpenseDonut` props `{ data: ReturnType<typeof expenseByCategory> }`:
    - Warna dari `color` kategori.
    - Legenda HTML: nama, `formatRupiah(total)`, dan `percent%`.
    - Kosong: `No expenses this month`.
  - `MonthlyBars` props `{ data: ReturnType<typeof monthlySeries> }`:
    - Dua dataset `Income` (warna token `income`) dan `Expense` (token `expense`).
    - Label sumbu x memakai `formatMonthLabel`.
    - Tooltip memakai `formatRupiah`.
  - `chartTheme.ts`: `readChartColors(): { text, muted, grid, income, expense }` dari `getComputedStyle(document.documentElement)`. Grafik dirender ulang saat tema berubah.

- [ ] **Step 1: Tulis tes yang gagal.** `ChartsPage` dengan transaksi di-mock (mock `react-chartjs-2` menjadi komponen yang merender `JSON.stringify(data)`):
  - Legenda donut menampilkan nama kategori + persentase.
  - Bulan tanpa expense menampilkan `No expenses this month`.
  - Seri batang berisi 6 label.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan (register komponen Chart.js yang dipakai saja). **Step 4:** PASS.
- [ ] **Step 5: Verifikasi manual** di 1280px dan 375px, mode light dan dark.
- [ ] **Step 6: Commit.** `feat(charts): menambahkan grafik pengeluaran per kategori dan tren 6 bulan`

### Task 15: Halaman Settings

**Files:**
- Create: `src/components/IconPicker.tsx`, `src/components/CategoryManager.tsx`, `src/components/ChangePasswordForm.tsx`, `src/pages/SettingsPage.tsx`
- Test: `src/components/CategoryManager.test.tsx`, `src/components/ChangePasswordForm.test.tsx`

**Interfaces:**
- Produces:
  - `IconPicker` props `{ value: string; onChange(name: string): void }`: grid semua `CATEGORY_ICONS`.
  - `CategoryManager`:
    - Dua bagian `Expense categories` / `Income categories`, hanya kategori aktif.
    - Tombol `Add category` membuka form (Name maks 50 + IconPicker).
    - Edit (nama + ikon, jenis tidak bisa diubah).
    - Delete → `ConfirmDialog` dengan pesan persis `Delete category? Existing transactions will keep it.` → `archive`.
    - Toast `Saved` / `Category deleted` / `Category already exists` (dari `DuplicateCategoryError`).
    - Validasi `Name is required`.
  - `ChangePasswordForm`:
    - Kolom `Current password`, `New password`, `Confirm new password`.
    - Validasi `Password must be at least 8 characters`, `Passwords do not match`.
    - `InvalidCredentialsError` → `Current password is incorrect`.
    - Sukses → toast `Password changed` dan form dikosongkan.
  - `SettingsPage`: bagian Categories, Appearance (segmented `System`/`Light`/`Dark` via `useTheme`), Password, dan tombol `Log out` (`signOut` → `/login`).

- [ ] **Step 1: Tulis tes yang gagal.**
  - `CategoryManager`:
    - Kategori terarsip tidak ditampilkan.
    - Delete → Cancel tidak memanggil `archive`; Confirm memanggil.
    - `create` reject dengan `DuplicateCategoryError` → toast `Category already exists`.
    - Nama kosong → `Name is required`.
  - `ChangePasswordForm`:
    - Password baru `1234567` → pesan minimal 8 karakter.
    - Konfirmasi berbeda → `Passwords do not match`.
    - `changePassword` reject `InvalidCredentialsError` → `Current password is incorrect`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementasikan. **Step 4:** PASS.
- [ ] **Step 5: Commit.** `feat(settings): menambahkan kelola kategori, tema, ganti password, dan logout`

### Task 16: README, CHANGELOG, dan verifikasi akhir

**Files:**
- Modify: `README.md`, `CHANGELOG.md`
- Keep: `docs/superpowers/specs/2026-09-30-money-review-design.md` (tidak dihapus)

- [ ] **Step 1:** Isi `README.md` mengikuti struktur template SOP dan detail spec:
  - Judul & deskripsi.
  - URL (Netlify, diisi setelah deploy).
  - Tujuan, sasaran pengguna.
  - Fitur per halaman (spec §5.2–5.5).
  - Tema & warna (tabel token).
  - Tech stack.
  - Arsitektur & batasan lapisan (§3, §5.7).
  - Struktur folder.
  - Environment variable (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, cara mengisi di `.env` dan Netlify).
  - Requirements (Node 24).
  - Instalasi (clone, setup-hooks, `npm install`, `.env`, `npm run dev`).
  - Unit test (`npm test`).
  - Deploy Netlify (sambungkan repo GitHub, branch `main`, env var).
  - Alur Git & penyimpangan SOP (§4).
  - Tautan ke spec, plan, dan repo `api-money-review`.
- [ ] **Step 2:** Tambahkan entri `CHANGELOG.md` `## [0.1.0] - <tanggal>` dengan bagian `### Added` per fitur.
- [ ] **Step 3: Verifikasi.** `npm test` (semua PASS), `npm run build` (sukses), `npx tsc -b` (tanpa error), dan `grep -rP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src` (tidak ada emoji).
- [ ] **Step 4:** Merge ke `develop`, lalu `git switch main && git merge --no-ff develop` dan `git tag -a v0.1.0 -m "Rilis awal money review"`. Hal yang sama dilakukan di `api-money-review`.
- [ ] **Step 5:** **[Aksi pemilik]**
  - Buat repo GitHub `web-money-review` & `api-money-review` (private).
  - Tambahkan remote, lalu `git push -u origin main develop --tags`.
  - Sambungkan Netlify ke `web-money-review` branch `main`.
  - Isi env var di Netlify.
  - Jalankan checklist keamanan dari HP: login, input, logout.
