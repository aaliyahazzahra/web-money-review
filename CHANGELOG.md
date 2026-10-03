# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan dalam file ini. Format penulisan didasarkan pada [SOP Manajemen Git dan Repositori](https://sos.nurulfikri.id/documentation/books/9/pages/15?shelf=3).

## [Unreleased]

### Added

- Nomor versi aplikasi (mis. `v0.3.0 · 8e0da4e`) di pojok kiri bawah sidebar laptop dan di bagian bawah halaman Settings, diambil otomatis dari `package.json` dan commit yang di-deploy Netlify.

### Changed

- Kartu utama di Home menjadi **Balance**: saldo keseluruhan lintas bulan (uang yang sedang dipegang), menggantikan kartu Net yang hanya menghitung bulan berjalan. Income dan Expense tetap untuk bulan berjalan.
- Balance dibaca dari view `vw_balance` di database (butuh `sql/007_balance_view.sql` dari repo `api-money-review` dijalankan di Supabase), sehingga tetap akurat berapa pun jumlah transaksinya.

## [0.2.0] - 2026-10-01

### Changed

- Nama tampilan aplikasi menjadi Librasica (judul tab, halaman login, sidebar). Nama repo, folder, dan package tetap `web-money-review`.
- Logo baru Librasica (monogram L faceted dengan timbangan) di halaman login, sidebar, favicon, dan ikon layar utama HP (`apple-touch-icon.png`).
- README mencantumkan URL production https://librasica.netlify.app.

## [0.1.0] - 2026-09-30

### Added

- Login email + password tanpa pendaftaran, dengan logout otomatis setelah 7 hari tidak dipakai.
- Halaman Home: ringkasan bulan berjalan (Net, Income, Expense), form input cepat, dan 5 transaksi terbaru.
- Form transaksi dengan pemisah ribuan otomatis, pemilih kategori berikon, validasi, dan pencegahan simpan ganda.
- Halaman Transactions: filter bulan dan kategori, daftar per tanggal, edit, dan hapus dengan konfirmasi.
- Halaman Charts: donut pengeluaran per kategori dan grafik batang income vs expense 6 bulan.
- Halaman Settings: kelola kategori (tambah, ubah, arsipkan), tema System/Light/Dark, ganti password, dan logout.
- Tema warna light (burgundy + krem) dan dark (arang kemerahan + merah), serta tampilan responsif HP dan laptop.
- Konfigurasi deploy Netlify dan unit test (Vitest + React Testing Library).
