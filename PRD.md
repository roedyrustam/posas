# PRD — KasirPro: Aplikasi Kasir SaaS

**Versi**: 1.0.0  
**Tanggal**: 26 Juni 2026  
**Status**: Draft  
**Bahasa Target**: Indonesia

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Problem Statement](#2-latar-belakang--problem-statement)
3. [Target Pengguna & Persona](#3-target-pengguna--persona)
4. [Tujuan Produk & Metrik Sukses](#4-tujuan-produk--metrik-sukses)
5. [Paket Langganan: Free, Pro, Premium](#5-paket-langganan-free-pro-premium)
6. [Fitur Lengkap per Modul](#6-fitur-lengkap-per-modul)
7. [User Stories](#7-user-stories)
8. [Arsitektur Teknis](#8-arsitektur-teknis)
9. [Desain Database & Data Model](#9-desain-database--data-model)
10. [API Design](#10-api-design)
11. [Keamanan & Compliance](#11-keamanan--compliance)
12. [Roadmap & Milestone Pengembangan Bertahap](#12-roadmap--milestone-pengembangan-bertahap)
13. [Non-Goals](#13-non-goals)
14. [Open Questions](#14-open-questions)
15. [Alternatif yang Dipertimbangkan](#15-alternatif-yang-dipertimbangkan)

---

## 1. Ringkasan Eksekutif

**KasirPro** adalah aplikasi kasir berbasis SaaS (Software-as-a-Service) yang dirancang untuk UMKM, toko retail, restoran, dan distributor di Indonesia. Aplikasi ini menyediakan tiga modul utama yang terintegrasi:

1. **Manajemen Stok & Inventori** — pelacakan stok real-time, multi-gudang, dan notifikasi stok menipis.
2. **Perhitungan HPP (Harga Pokok Penjualan)** — kalkulasi HPP otomatis dengan metode FIFO/Average/LIFO, laporan laba kotor per produk.
3. **Tagihan & Faktur** — pembuatan invoice profesional, pengiriman via WhatsApp/email, dan pelacakan pembayaran.

Aplikasi tersedia dalam tiga tier: **Free**, **Pro**, dan **Premium**, memungkinkan pengguna mulai tanpa biaya dan upgrade sesuai kebutuhan bisnis.

---

## 2. Latar Belakang & Problem Statement

### Masalah Utama

| #   | Masalah                                                        | Dampak                                        |
| --- | -------------------------------------------------------------- | --------------------------------------------- |
| 1   | UMKM masih catat stok manual (Excel/buku) → error, lambat      | Kehilangan omzet & stok tidak terkontrol      |
| 2   | HPP dihitung manual → margin profit tidak akurat               | Keputusan bisnis salah, rugi tidak terdeteksi |
| 3   | Faktur dibuat manual di Word/Excel → tidak profesional, lambat | Citra buruk, pembayaran molor                 |
| 4   | Solusi POS enterprise terlalu mahal (>Rp 500rb/bulan)          | UMKM tidak mampu adopsi teknologi             |
| 5   | Tidak ada solusi all-in-one yang terjangkau di Indonesia       | Harus pakai 3–4 aplikasi berbeda              |

### Solusi

Satu platform SaaS terjangkau yang mengintegrasikan kasir, inventori, HPP, dan faktur — bisa diakses dari browser dan HP tanpa instalasi khusus.

---

## 3. Target Pengguna & Persona

### Persona 1 — Budi, Pemilik Toko Sembako (Free → Pro)

- **Usia**: 35 tahun, Semarang
- **Tech-savvy**: Rendah–Sedang (pakai HP Android, WhatsApp)
- **Pain**: Stok sering habis tiba-tiba, tidak tahu produk mana yang untung
- **Goal**: Tahu stok real-time, bikin nota pembelian cepat
- **Budget**: Rp 0–150rb/bulan

### Persona 2 — Rina, Pemilik Butik Fashion (Pro)

- **Usia**: 28 tahun, Surabaya
- **Tech-savvy**: Sedang (Instagram, Shopee)
- **Pain**: HPP baju tidak jelas, faktur ke reseller manual
- **Goal**: Laporan laba per produk, kirim invoice via WhatsApp
- **Budget**: Rp 150–350rb/bulan

### Persona 3 — PT Makmur Jaya, Distributor (Premium)

- **Usia perusahaan**: 8 tahun, Jakarta
- **Tech-savvy**: Tinggi (sudah punya tim IT kecil)
- **Pain**: Multi-gudang tidak sinkron, laporan HPP untuk audit susah
- **Goal**: Konsolidasi inventori multi-cabang, laporan keuangan lengkap
- **Budget**: Rp 500rb–1jt/bulan

---

## 4. Tujuan Produk & Metrik Sukses

### Business Goals

- Capai 1.000 pengguna aktif di bulan ke-6
- Capai 15% konversi Free → Pro di bulan ke-9
- MRR (Monthly Recurring Revenue) Rp 50 juta di bulan ke-12

### Product Metrics (KPI)

| Metrik                       | Target 3 Bulan | Target 12 Bulan |
| ---------------------------- | -------------- | --------------- |
| Registered users             | 500            | 5.000           |
| Active users (DAU/MAU > 30%) | 150 / 500      | 1.500 / 5.000   |
| Free → Pro conversion        | 5%             | 15%             |
| Churn rate (Pro)             | < 10%          | < 7%            |
| Invoice dikirim/bulan        | 2.000          | 25.000          |
| NPS Score                    | > 40           | > 55            |
| Uptime                       | 99.5%          | 99.9%           |

---

## 5. Paket Langganan: Free, Pro, Premium

### Perbandingan Fitur

| Fitur                             | 🆓 Free        | ⭐ Pro                | 💎 Premium                 |
| --------------------------------- | -------------- | --------------------- | -------------------------- |
| **Harga**                         | Rp 0/bulan     | Rp 199.000/bulan      | Rp 499.000/bulan           |
| **Pengguna**                      | 1 user         | 5 user                | Unlimited                  |
| **Produk**                        | Maks 100 SKU   | Maks 2.000 SKU        | Unlimited SKU              |
| **Transaksi/bulan**               | 200 transaksi  | 5.000 transaksi       | Unlimited                  |
| **Gudang**                        | 1 gudang       | 3 gudang              | Unlimited gudang           |
| **Kasir (POS)**                   | ✅ Dasar       | ✅ Lengkap            | ✅ Lengkap + offline       |
| **Manajemen Stok**                | ✅ Dasar       | ✅ + Notifikasi       | ✅ + Multi-gudang          |
| **Laporan Stok**                  | Dasar          | Detail + ekspor       | Detail + audit trail       |
| **Perhitungan HPP**               | Average saja   | FIFO + Average        | FIFO + Average + LIFO      |
| **Laporan HPP**                   | Ringkasan      | Per produk + kategori | Per produk + batch + audit |
| **Buat Tagihan/Faktur**           | Maks 10/bulan  | Unlimited             | Unlimited                  |
| **Template Faktur**               | 1 template     | 5 template            | Custom branding            |
| **Kirim via WhatsApp**            | ❌             | ✅                    | ✅                         |
| **Kirim via Email**               | ❌             | ✅                    | ✅                         |
| **Pelacakan Pembayaran**          | ❌             | ✅                    | ✅ + reminder otomatis     |
| **Laporan Keuangan**              | Dasar (omzet)  | Lengkap (L/R, kas)    | Lengkap + komparasi        |
| **Ekspor Excel/PDF**              | ❌             | ✅                    | ✅                         |
| **API Access**                    | ❌             | ❌                    | ✅                         |
| **Integrasi (Tokopedia, Shopee)** | ❌             | ❌                    | ✅ (coming soon)           |
| **Support**                       | Email 3x24 jam | Email 1x24 jam        | Priority + WhatsApp        |
| **Backup data**                   | 7 hari         | 30 hari               | 1 tahun                    |

---

## 6. Fitur Lengkap per Modul

---

### 6.1 Modul Kasir (Point of Sale)

#### Deskripsi

Antarmuka kasir berbasis web yang bisa digunakan di tablet atau laptop. Mendukung transaksi penjualan, retur, diskon, dan multi metode pembayaran.

#### Sub-fitur

**Transaksi Penjualan**

- Pencarian produk by nama, SKU, atau barcode
- Tambah item ke keranjang dengan qty dan harga
- Diskon per item atau diskon total transaksi (nominal/persen)
- Multi metode pembayaran: Tunai, Transfer, QRIS, Kredit
- Cetak struk (thermal printer 58mm/80mm via WebUSB atau PDF)
- Transaksi hold (parkir) dan resume

**Manajemen Pelanggan di POS**

- Cari/tambah pelanggan saat transaksi
- Riwayat pembelian pelanggan
- Harga khusus per pelanggan (Pro/Premium)

**Retur & Refund**

- Retur item dari transaksi sebelumnya
- Pilih metode refund: tunai atau kredit ke akun pelanggan
- Stok otomatis dikembalikan saat retur disetujui

**Shift Kasir**

- Buka/tutup shift dengan modal awal
- Rekap penjualan per shift (kas masuk, metode bayar, total transaksi)
- Laporan tutup shift dalam PDF

**Offline Mode** (Premium)

- Transaksi tetap jalan meski koneksi internet putus
- Sinkronisasi otomatis saat koneksi kembali
- Conflict resolution jika ada transaksi bersamaan

---

### 6.2 Modul Manajemen Stok & Inventori

#### Deskripsi

Sistem inventori real-time untuk melacak pergerakan stok masuk, keluar, dan transfer antar gudang dengan audit trail lengkap.

#### Sub-fitur

**Master Produk**

- Nama, SKU, barcode (generate/scan), kategori, satuan
- Harga beli, harga jual (bisa multiple harga jual)
- Foto produk (upload max 5 foto/produk)
- Stok minimum (trigger notifikasi)
- Varian produk (warna, ukuran) — Pro/Premium
- Bundling produk — Premium

**Manajemen Stok Masuk (Pembelian)**

- Buat Purchase Order (PO) ke supplier
- Penerimaan barang (Good Receipt) — update stok otomatis
- Catat harga beli per batch untuk HPP
- Retur ke supplier
- Cetak/kirim PO dalam PDF

**Manajemen Stok Keluar**

- Stok berkurang otomatis saat transaksi kasir
- Penyesuaian stok manual (stok opname, susut, rusak)
- Catat alasan penyesuaian + bukti foto (opsional)

**Transfer Antar Gudang** (Pro/Premium)

- Buat Transfer Order dari Gudang A ke Gudang B
- Status transfer: Draft → Dikirim → Diterima
- Stok update di kedua gudang setelah konfirmasi

**Stok Opname**

- Buat sesi stok opname per gudang
- Input stok fisik vs stok sistem
- Selisih tampil otomatis; bisa approve/reject per item
- Laporan selisih stok opname dalam PDF/Excel

**Notifikasi Stok**

- Push/email notifikasi saat stok ≤ minimum
- Laporan produk hampir habis (reorder report)
- Notifikasi produk tidak bergerak (slow-moving) — Pro/Premium

**Laporan Inventori**

- Kartu stok per produk (riwayat masuk/keluar)
- Laporan nilai inventori (stok × harga beli)
- Laporan pergerakan stok (periode tertentu)
- Ekspor ke Excel — Pro/Premium

---

### 6.3 Modul Perhitungan HPP

#### Deskripsi

Kalkulasi Harga Pokok Penjualan secara otomatis berdasarkan metode akuntansi yang dipilih, untuk mengetahui margin laba kotor per produk secara akurat.

#### Metode Kalkulasi

| Metode                           | Tersedia di        |
| -------------------------------- | ------------------ |
| **Average (Rata-rata bergerak)** | Free, Pro, Premium |
| **FIFO (First In First Out)**    | Pro, Premium       |
| **LIFO (Last In First Out)**     | Premium            |

#### Sub-fitur

**Kalkulasi Otomatis**

- HPP dihitung ulang otomatis setiap ada transaksi masuk/keluar
- Tidak perlu input manual — sistem tarik dari data pembelian
- History HPP tersimpan per batch

**Dashboard HPP**

- HPP per produk saat ini
- Perbandingan HPP vs Harga Jual → Margin Kotor (%)
- Produk dengan margin terendah/tertinggi (top 10)
- Grafik tren HPP per produk (3/6/12 bulan)

**Laporan HPP**

- Laporan HPP per produk per periode
- Laporan Laba Kotor per produk = Omzet − HPP
- Laporan Laba Kotor per kategori
- Perbandingan HPP antar periode — Pro/Premium
- Ekspor PDF/Excel — Pro/Premium

**HPP Multi-komponen** (Premium)

- Tambah biaya overhead ke HPP (ongkos kirim, biaya impor)
- Alokasi biaya ke multi produk secara proporsional

---

### 6.4 Modul Tagihan & Faktur

#### Deskripsi

Buat, kirim, dan lacak faktur/invoice kepada pelanggan dengan tampilan profesional yang dapat dikustomisasi.

#### Sub-fitur

**Pembuatan Faktur**

- Nomor invoice otomatis (format custom: INV/2026/06/001)
- Data pelanggan (nama, alamat, NPWP opsional)
- Item: nama barang, qty, harga satuan, diskon, subtotal
- Tambah biaya lain (ongkir, biaya admin)
- PPN/pajak (opsional, bisa diatur 0%, 11%, atau custom)
- Tanggal faktur dan jatuh tempo
- Catatan/terms & conditions
- Nomor PO dari pelanggan (referensi)

**Template & Branding**

- 1 template default (Free)
- 5 template pilihan warna & layout (Pro)
- Upload logo, tanda tangan digital, cap perusahaan (Pro/Premium)
- Custom warna, font, footer teks (Premium)

**Pengiriman Faktur**

- Download PDF (semua tier)
- Kirim via WhatsApp (generate pesan + link PDF) — Pro/Premium
- Kirim via Email langsung dari aplikasi — Pro/Premium
- Share link faktur online (pelanggan bisa lihat di browser)

**Pelacakan Pembayaran**

- Status invoice: Draft → Terkirim → Sebagian Dibayar → Lunas → Jatuh Tempo
- Catat pembayaran (tanggal, jumlah, metode, bukti transfer)
- Pembayaran parsial didukung
- Reminder otomatis saat mendekati/melewati jatuh tempo — Premium

**Tagihan Berulang (Recurring Invoice)** — Premium

- Set jadwal faktur otomatis (mingguan/bulanan)
- Invoice digenerate dan dikirim otomatis
- Cocok untuk pelanggan dengan kontrak rutin

**Laporan Piutang (AR)**

- Aging report: piutang 0–30, 31–60, 61–90, >90 hari
- Total piutang outstanding per pelanggan
- Riwayat pembayaran per faktur

---

### 6.5 Modul Laporan & Dashboard

#### Deskripsi

Dashboard analytics dan laporan operasional bisnis yang bisa dikustomisasi.

#### Dashboard Utama

- Ringkasan hari ini: omzet, jumlah transaksi, laba kotor
- Grafik omzet 7/30 hari terakhir
- Produk terlaris (top 5)
- Stok hampir habis (alert)
- Invoice jatuh tempo hari ini

#### Laporan Tersedia

| Laporan                      | Free      | Pro    | Premium         |
| ---------------------------- | --------- | ------ | --------------- |
| Laporan Penjualan Harian     | ✅        | ✅     | ✅              |
| Laporan Penjualan per Produk | Ringkasan | Detail | Detail + export |
| Laporan Laba Kotor           | ❌        | ✅     | ✅              |
| Laporan Inventori            | Ringkasan | Detail | Detail + audit  |
| Laporan HPP                  | ❌        | ✅     | ✅              |
| Laporan Piutang (AR)         | ❌        | ✅     | ✅              |
| Laporan Per Kasir            | ❌        | ✅     | ✅              |
| Laporan Shift                | ✅        | ✅     | ✅              |
| Laporan Pajak (PPN)          | ❌        | ✅     | ✅              |
| Ekspor Excel/PDF             | ❌        | ✅     | ✅              |
| Laporan Custom               | ❌        | ❌     | ✅              |

---

### 6.6 Modul Manajemen Pengguna & Peran

| Peran       | Akses                                      |
| ----------- | ------------------------------------------ |
| **Owner**   | Semua fitur, termasuk setting billing      |
| **Manager** | Semua kecuali billing & hapus data         |
| **Kasir**   | POS, lihat stok, tidak bisa ubah harga     |
| **Gudang**  | Kelola stok masuk/keluar, tidak bisa kasir |
| **Finance** | Faktur, laporan keuangan, tidak bisa kasir |

---

## 7. User Stories

### Prioritas P0 (MVP — Fase 1)

| ID  | Sebagai…     | Saya ingin…                                      | Agar…                       |
| --- | ------------ | ------------------------------------------------ | --------------------------- |
| U01 | Pemilik toko | Daftar dan mulai pakai gratis tanpa kartu kredit | Bisa coba dulu tanpa risiko |
| U02 | Kasir        | Cari produk dan tambah ke keranjang dengan cepat | Transaksi tidak mengantri   |
| U03 | Kasir        | Proses pembayaran tunai dan cetak struk          | Transaksi selesai lengkap   |
| U04 | Pemilik      | Tambah produk baru dengan stok awal              | Semua produk tercatat       |
| U05 | Gudang       | Catat pembelian barang dari supplier             | Stok update otomatis        |
| U06 | Pemilik      | Lihat stok saat ini per produk                   | Tahu kondisi inventori      |
| U07 | Pemilik      | Lihat ringkasan omzet hari ini                   | Monitor performa harian     |
| U08 | Finance      | Buat faktur ke pelanggan dan download PDF        | Kirim tagihan profesional   |

### Prioritas P1 (Fase 2 — Pro Features)

| ID  | Sebagai… | Saya ingin…                             | Agar…                                  |
| --- | -------- | --------------------------------------- | -------------------------------------- |
| U09 | Pemilik  | Lihat HPP dan margin per produk         | Tahu produk mana yang menguntungkan    |
| U10 | Finance  | Kirim invoice via WhatsApp              | Pelanggan terima tagihan cepat         |
| U11 | Gudang   | Transfer stok antar gudang              | Distribusi stok lebih mudah            |
| U12 | Pemilik  | Dapat notifikasi stok hampir habis      | Tidak kehabisan barang                 |
| U13 | Finance  | Catat pembayaran parsial pada invoice   | Lacak pelunasan bertahap               |
| U14 | Manager  | Tambah user kasir dengan akses terbatas | Delegasi tugas aman                    |
| U15 | Pemilik  | Ekspor laporan ke Excel                 | Analisis lebih lanjut di luar aplikasi |

### Prioritas P2 (Fase 3 — Premium Features)

| ID  | Sebagai… | Saya ingin…                           | Agar…                                       |
| --- | -------- | ------------------------------------- | ------------------------------------------- |
| U16 | Pemilik  | Pilih metode HPP FIFO/LIFO            | Sesuai standar akuntansi perusahaan         |
| U17 | Finance  | Set reminder pembayaran otomatis      | Piutang tidak terlupakan                    |
| U18 | IT       | Akses API untuk integrasi sistem lain | Hubungkan dengan ERP                        |
| U19 | Pemilik  | Gunakan kasir saat offline            | Transaksi tidak berhenti saat internet mati |
| U20 | Finance  | Buat invoice berulang otomatis        | Hemat waktu untuk pelanggan rutin           |

---

## 8. Arsitektur Teknis

### Stack Rekomendasi

| Layer            | Pilihan                     | Alasan                                    |
| ---------------- | --------------------------- | ----------------------------------------- |
| **Framework**    | Next.js 15 (App Router)     | RSC, PPR, Server Actions, SSR/SSG         |
| **Database**     | PostgreSQL + Drizzle ORM    | Type-safe, relasional, migration mudah    |
| **Auth**         | Clerk                       | Multi-tenant, SSO, MFA, passkeys built-in |
| **Cache**        | Redis (Upstash)             | Session, rate limiting, realtime queue    |
| **File Storage** | Vercel Blob / Cloudflare R2 | Foto produk, PDF invoice, logo            |
| **Email**        | Resend + React Email        | Kirim invoice via email, notifikasi       |
| **PDF**          | Puppeteer / React-PDF       | Generate faktur PDF                       |
| **Payment**      | Midtrans / Xendit           | Pembayaran langganan SaaS (IDR)           |
| **Queue**        | BullMQ + Redis              | Kirim email async, reminder invoice       |
| **Deployment**   | Vercel + Railway (DB)       | Zero-config deploy, managed DB            |
| **Monitoring**   | Sentry + Vercel Analytics   | Error tracking, performance               |
| **UI**           | Tailwind CSS + shadcn/ui    | Komponen siap pakai, konsisten            |

### Diagram Arsitektur Sistem

```
[Browser / Mobile Browser]
        │ HTTPS
        ▼
[Vercel Edge Network]
        │
[Next.js 15 App]
        │
        ├── [Edge Middleware]  ← Auth check (Clerk), rate limit, tenant routing
        │
        ├── [RSC Pages]        ← Data fetch langsung dari DB, no client JS
        │     ├── Dashboard
        │     ├── Kasir (POS)
        │     ├── Inventori
        │     ├── HPP
        │     └── Faktur
        │
        ├── [Server Actions]   ← Mutasi data (tambah transaksi, update stok)
        │
        └── [API Routes]       ← Webhook Midtrans, REST API (Premium)
              │
              ├── [PostgreSQL]  ← Data utama (multi-tenant dengan tenant_id)
              ├── [Redis]       ← Cache, session, BullMQ queue
              └── [BullMQ Workers]
                    ├── Kirim email invoice
                    ├── Reminder pembayaran
                    ├── Generate PDF
                    └── Notifikasi stok
```

### Multi-Tenancy Strategy

Menggunakan **Row-Level Multi-Tenancy** dengan `tenant_id` di setiap tabel.

```
org_id (dari Clerk)  →  tenant_id di semua tabel DB
```

Setiap query wajib include `WHERE tenant_id = :currentTenantId` melalui middleware DB layer.

---

## 9. Desain Database & Data Model

### Core Entities

```sql
-- Tenant (Organisasi/Toko)
tenants (
  id          UUID PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE,  -- untuk subdomain: toko-budi.kasirpro.com
  plan        ENUM('free', 'pro', 'premium'),
  plan_expires_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ
)

-- Produk
products (
  id           UUID PRIMARY KEY,
  tenant_id    UUID FK → tenants,
  sku          TEXT,
  name         TEXT NOT NULL,
  category_id  UUID FK → categories,
  unit         TEXT,              -- pcs, kg, liter, dll
  cost_price   NUMERIC(15,2),    -- Harga beli terakhir
  sell_price   NUMERIC(15,2),    -- Harga jual default
  min_stock    INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ
)

-- Gudang
warehouses (
  id         UUID PRIMARY KEY,
  tenant_id  UUID FK → tenants,
  name       TEXT,
  address    TEXT,
  is_active  BOOLEAN
)

-- Stok per Produk per Gudang
inventory (
  id           UUID PRIMARY KEY,
  tenant_id    UUID FK → tenants,
  product_id   UUID FK → products,
  warehouse_id UUID FK → warehouses,
  qty          NUMERIC(15,3) DEFAULT 0,
  updated_at   TIMESTAMPTZ
)

-- Batch Pembelian (untuk HPP FIFO)
inventory_batches (
  id            UUID PRIMARY KEY,
  tenant_id     UUID FK → tenants,
  product_id    UUID FK → products,
  warehouse_id  UUID FK → warehouses,
  purchase_id   UUID FK → purchases,
  qty_received  NUMERIC(15,3),
  qty_remaining NUMERIC(15,3),
  cost_price    NUMERIC(15,2),  -- Harga beli batch ini
  received_at   TIMESTAMPTZ
)

-- Pergerakan Stok (Audit Trail)
stock_movements (
  id            UUID PRIMARY KEY,
  tenant_id     UUID FK → tenants,
  product_id    UUID FK → products,
  warehouse_id  UUID FK → warehouses,
  type          ENUM('purchase','sale','adjustment','transfer_in','transfer_out','return'),
  qty_change    NUMERIC(15,3),  -- + masuk, - keluar
  qty_before    NUMERIC(15,3),
  qty_after     NUMERIC(15,3),
  reference_id  UUID,           -- ID transaksi asal
  note          TEXT,
  created_at    TIMESTAMPTZ,
  created_by    UUID FK → users
)

-- Transaksi Penjualan (Kasir)
sales (
  id              UUID PRIMARY KEY,
  tenant_id       UUID FK → tenants,
  invoice_number  TEXT UNIQUE,
  customer_id     UUID FK → customers NULLABLE,
  warehouse_id    UUID FK → warehouses,
  cashier_id      UUID FK → users,
  subtotal        NUMERIC(15,2),
  discount_amount NUMERIC(15,2) DEFAULT 0,
  tax_amount      NUMERIC(15,2) DEFAULT 0,
  total           NUMERIC(15,2),
  payment_method  ENUM('cash','transfer','qris','credit'),
  payment_amount  NUMERIC(15,2),
  change_amount   NUMERIC(15,2),
  status          ENUM('completed','voided','returned'),
  created_at      TIMESTAMPTZ
)

-- Item Transaksi Penjualan
sale_items (
  id           UUID PRIMARY KEY,
  sale_id      UUID FK → sales,
  product_id   UUID FK → products,
  qty          NUMERIC(15,3),
  unit_price   NUMERIC(15,2),
  discount     NUMERIC(15,2) DEFAULT 0,
  subtotal     NUMERIC(15,2),
  hpp_unit     NUMERIC(15,2),  -- HPP per unit saat transaksi (snapshot)
  gross_profit NUMERIC(15,2)   -- subtotal - (hpp_unit × qty)
)

-- Pembelian dari Supplier (Purchase Order)
purchases (
  id              UUID PRIMARY KEY,
  tenant_id       UUID FK → tenants,
  po_number       TEXT,
  supplier_id     UUID FK → suppliers,
  warehouse_id    UUID FK → warehouses,
  status          ENUM('draft','ordered','partial','received','cancelled'),
  subtotal        NUMERIC(15,2),
  tax_amount      NUMERIC(15,2) DEFAULT 0,
  total           NUMERIC(15,2),
  order_date      DATE,
  expected_date   DATE,
  received_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ
)

-- HPP per Produk (Cache kalkulasi)
product_hpp (
  id             UUID PRIMARY KEY,
  tenant_id      UUID FK → tenants,
  product_id     UUID FK → products,
  method         ENUM('average','fifo','lifo'),
  hpp_per_unit   NUMERIC(15,4),
  calculated_at  TIMESTAMPTZ
)

-- Invoice / Faktur
invoices (
  id              UUID PRIMARY KEY,
  tenant_id       UUID FK → tenants,
  invoice_number  TEXT,
  customer_id     UUID FK → customers,
  issue_date      DATE,
  due_date        DATE,
  status          ENUM('draft','sent','partial','paid','overdue','cancelled'),
  subtotal        NUMERIC(15,2),
  discount_amount NUMERIC(15,2) DEFAULT 0,
  tax_rate        NUMERIC(5,2) DEFAULT 0,
  tax_amount      NUMERIC(15,2) DEFAULT 0,
  total           NUMERIC(15,2),
  paid_amount     NUMERIC(15,2) DEFAULT 0,
  balance_due     NUMERIC(15,2),
  notes           TEXT,
  terms           TEXT,
  template_id     UUID FK → invoice_templates,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ
)

-- Pembayaran Invoice
invoice_payments (
  id           UUID PRIMARY KEY,
  invoice_id   UUID FK → invoices,
  amount       NUMERIC(15,2),
  method       ENUM('cash','transfer','qris','other'),
  paid_at      DATE,
  reference    TEXT,  -- nomor bukti transfer
  notes        TEXT,
  created_by   UUID FK → users
)
```

---

## 10. API Design

### REST API (Premium tier only)

**Base URL**: `https://api.kasirpro.com/v1`  
**Auth**: Bearer token (API Key dari dashboard)

#### Endpoint Utama

| Method | Path                    | Deskripsi                |
| ------ | ----------------------- | ------------------------ |
| `GET`  | `/products`             | List produk              |
| `POST` | `/products`             | Tambah produk            |
| `GET`  | `/products/:id/stock`   | Cek stok produk          |
| `GET`  | `/inventory`            | Ringkasan inventori      |
| `POST` | `/sales`                | Buat transaksi penjualan |
| `GET`  | `/sales`                | List transaksi           |
| `GET`  | `/invoices`             | List faktur              |
| `POST` | `/invoices`             | Buat faktur              |
| `POST` | `/invoices/:id/send`    | Kirim faktur             |
| `POST` | `/invoices/:id/payment` | Catat pembayaran         |
| `GET`  | `/reports/hpp`          | Laporan HPP              |
| `GET`  | `/reports/sales`        | Laporan penjualan        |

#### Webhook Events (Premium)

| Event             | Trigger                      |
| ----------------- | ---------------------------- |
| `invoice.paid`    | Invoice dilunasi             |
| `invoice.overdue` | Invoice melewati jatuh tempo |
| `stock.low`       | Stok produk ≤ minimum        |
| `sale.completed`  | Transaksi kasir selesai      |

---

## 11. Keamanan & Compliance

### Keamanan Aplikasi

- [ ] Autentikasi via Clerk (JWT + session management)
- [ ] Multi-factor authentication (MFA) untuk role Owner/Finance
- [ ] Row-level isolation: setiap query wajib filter `tenant_id`
- [ ] Input validation dengan Zod di semua boundary (form, API)
- [ ] Rate limiting: 100 req/menit/IP (public), 1000 req/menit/user (authenticated)
- [ ] HTTPS only; HSTS header
- [ ] Content Security Policy (CSP) header
- [ ] API Key untuk Premium: hashed di DB, tidak pernah tampil ulang

### Data & Privacy

- [ ] Data pengguna disimpan di region Asia Tenggara (Singapore)
- [ ] Enkripsi at-rest untuk data sensitif (harga, stok)
- [ ] GDPR/UU PDP compliance: ada fitur hapus akun + ekspor data
- [ ] Backup otomatis harian (7 hari Free, 30 hari Pro, 1 tahun Premium)
- [ ] Audit log semua aksi sensitif (hapus, edit harga, void transaksi)

### Pembayaran SaaS

- [ ] Pembayaran langganan via Midtrans (IDR, semua metode lokal)
- [ ] Kartu kredit diproses Midtrans (tidak disimpan di server kami)
- [ ] Auto-downgrade ke Free jika Pro/Premium kadaluarsa setelah 3 hari grace period

---

## 12. Roadmap & Milestone Pengembangan Bertahap

### Fase 0 — Fondasi & Setup (Minggu 1–2)

**Goal**: Infrastruktur siap, tidak ada fitur bisnis

- [ ] Setup repo Next.js 15 + TypeScript
- [ ] Konfigurasi Drizzle ORM + PostgreSQL (Railway)
- [ ] Integrasi Clerk (auth + multi-tenant)
- [ ] Setup Vercel deployment (staging + production)
- [ ] Setup Redis (Upstash) + BullMQ
- [ ] Design system: Tailwind + shadcn/ui + color tokens
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Sentry error monitoring

**Deliverable**: Landing page + halaman login/register berfungsi

---

### Fase 1 — MVP Core (Minggu 3–8)

**Goal**: Free tier bisa digunakan end-to-end

#### Minggu 3–4: Kasir & Produk

- [ ] CRUD produk (nama, SKU, harga beli, harga jual, stok awal)
- [ ] CRUD kategori produk
- [ ] Antarmuka POS: cari produk, keranjang, checkout
- [ ] Pembayaran tunai + kembalian
- [ ] Struk PDF sederhana

#### Minggu 5–6: Inventori Dasar

- [ ] Stok update otomatis saat transaksi kasir
- [ ] Pencatatan pembelian barang dari supplier (simple, tanpa PO)
- [ ] Kartu stok per produk (riwayat masuk/keluar)
- [ ] Dashboard: omzet hari ini, stok sekarang

#### Minggu 7–8: Faktur & Laporan Dasar

- [ ] Buat faktur ke pelanggan (manual, max 10/bulan untuk Free)
- [ ] Download PDF faktur (template 1)
- [ ] Laporan penjualan harian (ringkasan)
- [ ] Laporan stok ringkasan
- [ ] Manajemen pelanggan & supplier (CRUD)

**Deliverable**: Aplikasi Free tier siap → Beta testing dengan 20–50 user

---

### Fase 2 — Pro Features (Minggu 9–16)

**Goal**: Tier Pro live dan bisa mulai monetisasi

#### Minggu 9–10: HPP & Margin

- [ ] Engine HPP Average otomatis (update tiap transaksi)
- [ ] Engine HPP FIFO (batch-based)
- [ ] Dashboard HPP: margin per produk, top 10 margin
- [ ] Laporan laba kotor per produk + per kategori
- [ ] Snapshot HPP di setiap sale_item

#### Minggu 11–12: Pro Inventori

- [ ] Notifikasi stok hampir habis (push + email)
- [ ] Transfer stok antar gudang (max 3 gudang)
- [ ] Stok opname (buat sesi, input fisik, approve selisih)
- [ ] Ekspor laporan inventori ke Excel

#### Minggu 13–14: Pro Faktur

- [ ] Kirim invoice via WhatsApp (pesan otomatis + link PDF)
- [ ] Kirim invoice via Email (Resend)
- [ ] Catat pembayaran (full + parsial)
- [ ] Status invoice otomatis update
- [ ] Laporan piutang (AR aging report)
- [ ] 5 template faktur + upload logo

#### Minggu 15–16: Pro Dashboard & User

- [ ] Multi-user (max 5): undang via email
- [ ] Manajemen peran (Owner, Kasir, Gudang, Finance)
- [ ] Laporan lengkap: penjualan, HPP, piutang
- [ ] Ekspor semua laporan ke PDF/Excel
- [ ] Billing & subscription (Midtrans)
- [ ] Upgrade/downgrade plan dari dashboard

**Deliverable**: Pro tier live → mulai campaign ke 1.000 users

---

### Fase 3 — Premium Features (Minggu 17–24)

**Goal**: Tier Premium live + infrastruktur untuk scale

#### Minggu 17–18: Premium Inventori & HPP

- [ ] HPP metode LIFO
- [ ] Multi-gudang unlimited
- [ ] HPP multi-komponen (overhead, biaya kirim)
- [ ] Laporan HPP + audit trail lengkap
- [ ] Laporan slow-moving product

#### Minggu 19–20: Premium Faktur & Billing

- [ ] Recurring invoice (terjadwal otomatis)
- [ ] Reminder pembayaran otomatis (D-7, D-1, H+1, H+7)
- [ ] Custom branding invoice (font, warna, tanda tangan digital)
- [ ] Laporan pajak PPN

#### Minggu 21–22: Offline Mode & API

- [ ] POS offline mode (Service Worker + IndexedDB)
- [ ] Sinkronisasi otomatis saat online
- [ ] REST API public dengan API Key
- [ ] Dokumentasi API (Swagger/OpenAPI)
- [ ] Webhook events

#### Minggu 23–24: Polish & Scale

- [ ] Performa: optimasi query, index DB, caching Redis
- [ ] Mobile-responsive audit (tablet & HP)
- [ ] Onboarding tour interaktif (new user)
- [ ] Help center / FAQ in-app
- [ ] Load testing (target: 1.000 concurrent users)
- [ ] Audit keamanan (penetration testing dasar)

**Deliverable**: Premium tier live → target 50 pelanggan Premium di bulan ke-6

---

### Fase 4 — Integrasi & Growth (Bulan 7–12)

- [ ] Integrasi marketplace: Tokopedia, Shopee (sinkronisasi stok)
- [ ] Integrasi akuntansi: Jurnal.id, Accurate
- [ ] Mobile app (React Native atau PWA enhanced)
- [ ] Laporan custom (drag-and-drop report builder)
- [ ] AI Assistant: prediksi reorder stok, analisis margin (claude-sonnet-4-6)
- [ ] Affiliate/referral program
- [ ] White-label untuk reseller

---

## 13. Non-Goals

Hal-hal yang **TIDAK** akan dibangun dalam roadmap ini:

- ❌ Aplikasi mobile native (iOS/Android) — fokus web-first dulu
- ❌ Modul akuntansi lengkap (buku besar, neraca, arus kas) — itu scope ERP
- ❌ Integrasi payment gateway untuk kasir (QRIS fisik) di MVP
- ❌ Multi-bahasa di luar Bahasa Indonesia — v1 fokus pasar lokal
- ❌ Fitur loyalty points / membership pelanggan di v1
- ❌ Manajemen karyawan & penggajian (HR) — di luar scope kasir
- ❌ E-commerce storefront — kami B2B tool, bukan marketplace

---

## 14. Open Questions

| #   | Pertanyaan                                                                               | Owner         | Deadline         |
| --- | ---------------------------------------------------------------------------------------- | ------------- | ---------------- |
| Q1  | Apakah thermal printer perlu support via Bluetooth (mobile) atau hanya USB (desktop)?    | Product       | Fase 1 Minggu 3  |
| Q2  | Apakah HPP FIFO perlu tracking per gudang terpisah atau konsolidasi?                     | Tech Lead     | Fase 2 Minggu 9  |
| Q3  | Payment gateway: Midtrans vs Xendit — mana yang lebih cocok untuk SaaS subscription IDR? | Finance       | Fase 2 Minggu 15 |
| Q4  | Apakah perlu fitur konsinyasi (barang titipan) di v1?                                    | Product       | Fase 1 Minggu 4  |
| Q5  | Format nomor faktur: apakah user bisa atur prefix sendiri di Free tier?                  | Product       | Fase 1 Minggu 7  |
| Q6  | Apakah laporan pajak PPN perlu format e-Faktur Pajak resmi DJP?                          | Legal/Finance | Fase 3 Minggu 20 |

---

## 15. Alternatif yang Dipertimbangkan

| Alternatif                     | Mengapa Tidak Dipilih                                                    |
| ------------------------------ | ------------------------------------------------------------------------ |
| **Supabase** sebagai DB + Auth | Clerk lebih baik untuk multi-tenant SaaS; Supabase RLS kompleks          |
| **Prisma** sebagai ORM         | Drizzle lebih ringan, type-safe, dan tidak butuh binary generator        |
| **Next.js Pages Router**       | App Router + RSC lebih modern, performa lebih baik untuk dashboard       |
| **Xendit** untuk payment       | Midtrans lebih banyak dipakai UMKM Indonesia; UX checkout lebih familiar |
| **iPaymu / Duitku**            | Midtrans lebih mature, dokumentasi lebih baik, support lebih cepat       |
| **Monolith tanpa queue**       | Invoice email harus async; queue diperlukan agar response tidak lambat   |
| **Electron app (desktop)**     | Web-first lebih mudah update, tidak perlu install, support multi-device  |

---

## Appendix A — Definisi Istilah

| Istilah          | Definisi                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **HPP**          | Harga Pokok Penjualan — biaya yang dikeluarkan untuk memproduksi/membeli barang yang terjual |
| **FIFO**         | First In First Out — barang yang masuk pertama, keluar (terjual) pertama                     |
| **LIFO**         | Last In First Out — barang yang masuk terakhir, terjual pertama                              |
| **Average**      | HPP = total nilai stok / total qty stok                                                      |
| **SKU**          | Stock Keeping Unit — kode unik per produk                                                    |
| **PO**           | Purchase Order — surat pesanan pembelian ke supplier                                         |
| **AR**           | Accounts Receivable — piutang (invoice belum dibayar)                                        |
| **Aging Report** | Laporan piutang dikelompokkan berdasarkan umur (0–30, 31–60, dst.)                           |
| **Tenant**       | Satu toko/organisasi yang menggunakan aplikasi ini                                           |
| **RSC**          | React Server Component — komponen yang render di server, tidak kirim JS ke client            |
| **MRR**          | Monthly Recurring Revenue — pendapatan berulang per bulan dari subscription                  |

---

## Appendix B — Competitive Analysis

| Fitur                | KasirPro     | Moka POS   | iReap | Majoo    | Accurate |
| -------------------- | ------------ | ---------- | ----- | -------- | -------- |
| Harga mulai          | Rp 0         | Rp 299rb   | Rp 0  | Rp 149rb | Rp 300rb |
| HPP Otomatis         | ✅           | ❌         | ❌    | Terbatas | ✅       |
| Multi-gudang         | ✅           | Terbatas   | ❌    | ✅       | ✅       |
| Invoice ke pelanggan | ✅           | ❌         | ❌    | ✅       | ✅       |
| Kirim WA             | ✅           | ❌         | ❌    | ✅       | ❌       |
| API Access           | ✅ (Premium) | ✅ (mahal) | ❌    | ✅       | ✅       |
| Target market        | UMKM         | Resto/Cafe | Mikro | UMKM     | Menengah |

**Keunggulan KasirPro**: Satu-satunya yang mengintegrasikan HPP otomatis + faktur + multi-gudang di harga yang terjangkau untuk segmen UMKM.

---

_PRD ini adalah dokumen hidup. Revisi dilakukan setiap Sprint Review (2 minggu sekali)._  
_Versi berikutnya: v1.1.0 setelah Beta testing Fase 1 selesai._
