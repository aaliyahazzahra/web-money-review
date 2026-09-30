# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini. Format penulisan didasarkan pada [SOP Manajemen Git dan Repositori](https://sos.nurulfikri.id/documentation/books/9/pages/15?shelf=3).

## [0.1.0] - 2026-09-30

### Added

- Login email + password tanpa pendaftaran, dengan logout otomatis setelah 7 hari tidak dipakai.
- Halaman Home: ringkasan bulan berjalan (Net, Income, Expense), form input cepat, dan 5 transaksi terbaru.
- Form transaksi dengan pemisah ribuan otomatis, pemilih kategori berikon, validasi, dan pencegahan simpan ganda.
- Halaman Transactions: filter bulan dan kategori, daftar per tanggal, edit, dan hapus dengan konfirmasi.
- Halaman Charts: donut pengeluaran per kategori dan grafik batang income vs expense 6 bulan.
- Halaman Settings: kelola kategori (tambah, ubah, arsipkan), tema System/Light/Dark, ganti password, dan logout.
- Tema warna light (burgundy + krem) dan dark (hitam + merah), serta tampilan responsif HP dan laptop.
- Konfigurasi deploy Netlify dan unit test (Vitest + React Testing Library).
