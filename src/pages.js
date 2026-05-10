// ========== POSAS Page Renderers ==========
import { products, customers, transactions, getWeeklyRevenue, getStats, cart, formatRupiah, getInitials, hashColor } from './data.js';

// ===== DASHBOARD =====
export function renderDashboard() {
  const stats = getStats();
  const weeklyRevenue = getWeeklyRevenue();
  const maxRev = Math.max(...weeklyRevenue.map(d => d.amount), 1);
  return `
  <div class="fade-in">
    <div class="mb-16">
      <p class="text-sm text-muted">Selamat sore, <strong>Roedy</strong> 👋</p>
    </div>

    <div class="grid-2 mb-16">
      <div class="stat-card purple">
        <div class="stat-icon purple"><span class="material-icons-round">payments</span></div>
        <div class="stat-value">${formatRupiah(stats.todayRevenue)}</div>
        <div class="stat-label">Pendapatan Hari Ini</div>
        <div class="stat-change up"><span class="material-icons-round" style="font-size:14px">trending_up</span> +12%</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon green"><span class="material-icons-round">receipt</span></div>
        <div class="stat-value">${stats.todayOrders}</div>
        <div class="stat-label">Pesanan Hari Ini</div>
        <div class="stat-change up"><span class="material-icons-round" style="font-size:14px">trending_up</span> +3</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon blue"><span class="material-icons-round">people</span></div>
        <div class="stat-value">${stats.totalCustomers}</div>
        <div class="stat-label">Total Pelanggan</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon orange"><span class="material-icons-round">warning</span></div>
        <div class="stat-value">${stats.lowStock}</div>
        <div class="stat-label">Stok Menipis</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Pendapatan Minggu Ini</span>
        <span class="text-sm fw-700" style="color:var(--accent-light)">${formatRupiah(stats.monthRevenue)}</span>
      </div>
      <div class="card">
        <div class="chart-bar-container">
          ${weeklyRevenue.map(d => `
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="height:${(d.amount / maxRev) * 100}%"></div>
              <span class="chart-label">${d.day}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Transaksi Terakhir</span>
        <button class="section-link" data-page="finance">Lihat Semua</button>
      </div>
      <div class="card" style="padding:4px 16px">
        ${transactions.slice(0, 4).map(t => `
          <div class="list-item">
            <div class="list-avatar" style="background:${hashColor(t.customer)};color:#fff">${getInitials(t.customer)}</div>
            <div class="list-content">
              <div class="list-title">${t.customer}</div>
              <div class="list-subtitle">${t.items.join(', ')}</div>
            </div>
            <div class="list-trailing">
              <div class="list-amount" style="color:var(--success)">${formatRupiah(t.total)}</div>
              <div class="list-meta">${t.method}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Produk Terlaris</span>
        <button class="section-link" data-page="products">Lihat Semua</button>
      </div>
      <div class="card" style="padding:4px 16px">
        ${products.slice(0, 3).map((p, i) => `
          <div class="list-item">
            <div style="font-size:28px">${p.emoji}</div>
            <div class="list-content">
              <div class="list-title">${p.name}</div>
              <div class="list-subtitle">${p.category} · Stok: ${p.stock}</div>
            </div>
            <div class="list-trailing">
              <div class="list-amount">${formatRupiah(p.price)}</div>
              <div class="list-meta">#${i + 1}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ===== POS =====
export function renderPOS() {
  return `
  <div class="fade-in">
    <div class="search-bar">
      <span class="material-icons-round">search</span>
      <input type="text" placeholder="Cari produk..." id="pos-search" />
    </div>

    <div class="flex gap-8 mb-16" style="overflow-x:auto;padding-bottom:4px">
      <button class="btn btn-sm btn-primary pos-filter active" data-cat="all">Semua</button>
      <button class="btn btn-sm btn-secondary pos-filter" data-cat="Makanan">🍛 Makanan</button>
      <button class="btn btn-sm btn-secondary pos-filter" data-cat="Minuman">☕ Minuman</button>
      <button class="btn btn-sm btn-secondary pos-filter" data-cat="Snack">🍫 Snack</button>
    </div>

    <div class="pos-grid" id="pos-products">
      ${products.map(p => `
        <div class="pos-product" data-id="${p.id}">
          <div class="pos-product-icon">${p.emoji}</div>
          <div class="pos-product-name">${p.name}</div>
          <div class="pos-product-price">${formatRupiah(p.price)}</div>
        </div>
      `).join('')}
    </div>

    <div style="height:80px"></div>

    <div class="cart-summary" id="cart-summary" style="display:${cart.count > 0 ? 'flex' : 'none'}">
      <div>
        <div class="cart-count"><strong>${cart.count}</strong> item</div>
        <div class="cart-total">${formatRupiah(cart.total)}</div>
      </div>
      <button class="btn btn-primary" id="btn-checkout">
        <span class="material-icons-round" style="font-size:18px">shopping_cart_checkout</span>
        Bayar
      </button>
    </div>
  </div>`;
}

// ===== PRODUCTS =====
export function renderProducts() {
  return `
  <div class="fade-in">
    <div class="search-bar">
      <span class="material-icons-round">search</span>
      <input type="text" placeholder="Cari produk..." id="product-search" />
    </div>

    <div class="flex justify-between items-center mb-16">
      <span class="text-sm text-muted">${products.length} produk</span>
      <button class="btn btn-sm btn-secondary" id="btn-sort-products">
        <span class="material-icons-round" style="font-size:16px">sort</span> Urutkan
      </button>
    </div>

    <div class="grid-1">
      ${products.map(p => `
        <div class="card flex items-center gap-12" style="padding:14px 16px">
          <div style="font-size:32px;flex-shrink:0">${p.emoji}</div>
          <div class="list-content">
            <div class="list-title">${p.name}</div>
            <div class="list-subtitle">${p.category}</div>
          </div>
          <div class="list-trailing">
            <div class="list-amount">${formatRupiah(p.price)}</div>
            <span class="badge ${p.stock < 20 ? 'badge-warning' : 'badge-success'}" style="margin-top:4px">
              ${p.stock < 20 ? '⚠ ' : ''}${p.stock} stok
            </span>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="btn-fab" id="btn-add-product" aria-label="Tambah Produk">
      <span class="material-icons-round">add</span>
    </button>
  </div>`;
}

// ===== CUSTOMERS =====
export function renderCustomers() {
  return `
  <div class="fade-in">
    <div class="search-bar">
      <span class="material-icons-round">search</span>
      <input type="text" placeholder="Cari pelanggan..." id="customer-search" />
    </div>

    <div class="flex justify-between items-center mb-16">
      <span class="text-sm text-muted">${customers.length} pelanggan</span>
    </div>

    <div class="grid-1">
      ${customers.map(c => `
        <div class="card flex items-center gap-12" style="padding:14px 16px">
          <div class="list-avatar" style="background:${hashColor(c.name)};color:#fff;width:44px;height:44px;font-size:15px">${getInitials(c.name)}</div>
          <div class="list-content">
            <div class="list-title">${c.name}</div>
            <div class="list-subtitle">${c.phone} · ${c.visits} kunjungan</div>
          </div>
          <div class="list-trailing">
            <div class="list-amount" style="font-size:13px">${formatRupiah(c.totalSpent)}</div>
            <div class="list-meta">Total belanja</div>
          </div>
        </div>
      `).join('')}
    </div>

    <button class="btn-fab" id="btn-add-customer" aria-label="Tambah Pelanggan">
      <span class="material-icons-round">person_add</span>
    </button>
  </div>`;
}

// ===== FINANCE =====
export function renderFinance() {
  const stats = getStats();
  const totalIn = transactions.reduce((s, t) => s + t.total, 0);
  return `
  <div class="fade-in">
    <div class="grid-2 mb-16">
      <div class="stat-card green">
        <div class="stat-icon green"><span class="material-icons-round">arrow_downward</span></div>
        <div class="stat-value" style="font-size:18px;color:var(--success)">${formatRupiah(totalIn)}</div>
        <div class="stat-label">Pemasukan</div>
      </div>
      <div class="stat-card" style="border-color:var(--border)">
        <div class="stat-icon" style="background:rgba(239,68,68,0.15);color:var(--danger)"><span class="material-icons-round">arrow_upward</span></div>
        <div class="stat-value" style="font-size:18px;color:var(--danger)">${formatRupiah(85000)}</div>
        <div class="stat-label">Pengeluaran</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Riwayat Transaksi</span>
      </div>
      <div class="card" style="padding:4px 16px">
        ${transactions.map(t => `
          <div class="list-item">
            <div class="list-avatar" style="background:${hashColor(t.customer)};color:#fff">${getInitials(t.customer)}</div>
            <div class="list-content">
              <div class="list-title">${t.customer}</div>
              <div class="list-subtitle">${t.date} · ${t.method}</div>
            </div>
            <div class="list-trailing">
              <div class="list-amount" style="color:var(--success)">+${formatRupiah(t.total)}</div>
              <div class="list-meta">${t.items.length} item</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

// ===== BOOKING =====
export function renderBooking() {
  return `
  <div class="fade-in">
    <div class="empty-state">
      <span class="material-icons-round">calendar_month</span>
      <h3>Belum ada booking</h3>
      <p>Fitur booking & jadwal akan segera hadir untuk membantu mengatur layanan Anda.</p>
      <button class="btn btn-primary">
        <span class="material-icons-round" style="font-size:18px">notifications</span>
        Beritahu Saya
      </button>
    </div>
  </div>`;
}

// ===== INVOICES =====
export function renderInvoices() {
  return `
  <div class="fade-in">
    <div class="empty-state">
      <span class="material-icons-round">receipt_long</span>
      <h3>Belum ada invoice</h3>
      <p>Buat invoice pertama Anda untuk menagih pelanggan secara profesional.</p>
      <button class="btn btn-primary" id="btn-create-invoice">
        <span class="material-icons-round" style="font-size:18px">add</span>
        Buat Invoice
      </button>
    </div>
  </div>`;
}

// ===== REPORTS =====
export function renderReports() {
  return `
  <div class="fade-in">
    <div class="grid-1 mb-16">
      <div class="card flex items-center gap-12" style="cursor:pointer">
        <div class="stat-icon purple"><span class="material-icons-round">bar_chart</span></div>
        <div class="list-content">
          <div class="list-title">Laporan Penjualan</div>
          <div class="list-subtitle">Ringkasan penjualan harian, mingguan, bulanan</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12" style="cursor:pointer">
        <div class="stat-icon green"><span class="material-icons-round">inventory</span></div>
        <div class="list-content">
          <div class="list-title">Laporan Inventaris</div>
          <div class="list-subtitle">Stok masuk, keluar, dan opname</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12" style="cursor:pointer">
        <div class="stat-icon blue"><span class="material-icons-round">people</span></div>
        <div class="list-content">
          <div class="list-title">Laporan Pelanggan</div>
          <div class="list-subtitle">Pelanggan terbaik dan analisis retensi</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12" style="cursor:pointer">
        <div class="stat-icon orange"><span class="material-icons-round">account_balance</span></div>
        <div class="list-content">
          <div class="list-title">Laporan Keuangan</div>
          <div class="list-subtitle">Laba rugi dan arus kas</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
    </div>
  </div>`;
}

// ===== SETTINGS =====
export function renderSettings() {
  return `
  <div class="fade-in">
    <div class="card mb-16 flex items-center gap-12">
      <div class="avatar-btn" style="width:52px;height:52px;font-size:18px"><span class="avatar-text">RS</span></div>
      <div class="list-content">
        <div class="list-title" style="font-size:16px">Roedy Santosa</div>
        <div class="list-subtitle">roedy@email.com · Pemilik</div>
      </div>
      <span class="material-icons-round text-muted">chevron_right</span>
    </div>

    <div class="section-title mb-8" style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Toko</div>
    <div class="grid-1 mb-16">
      ${[
        ['storefront', 'Profil Toko', 'Nama, alamat, logo'],
        ['palette', 'Tampilan', 'Tema dan warna'],
        ['print', 'Struk & Nota', 'Template dan printer'],
        ['payments', 'Metode Pembayaran', 'QRIS, tunai, transfer'],
      ].map(([icon, title, sub]) => `
        <div class="card flex items-center gap-12" style="padding:14px 16px;cursor:pointer">
          <span class="material-icons-round text-muted">${icon}</span>
          <div class="list-content">
            <div class="list-title">${title}</div>
            <div class="list-subtitle">${sub}</div>
          </div>
          <span class="material-icons-round text-muted">chevron_right</span>
        </div>
      `).join('')}
    </div>

    <div class="section-title mb-8" style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Akun</div>
    <div class="grid-1 mb-16">
      ${[
        ['people', 'Tim & Akses', 'Kelola karyawan dan hak akses'],
        ['security', 'Keamanan', 'Password dan verifikasi'],
        ['help', 'Bantuan', 'FAQ dan dukungan'],
      ].map(([icon, title, sub]) => `
        <div class="card flex items-center gap-12" style="padding:14px 16px;cursor:pointer">
          <span class="material-icons-round text-muted">${icon}</span>
          <div class="list-content">
            <div class="list-title">${title}</div>
            <div class="list-subtitle">${sub}</div>
          </div>
          <span class="material-icons-round text-muted">chevron_right</span>
        </div>
      `).join('')}
    </div>

    <div class="card flex items-center gap-12 mb-16" style="padding:14px 16px;border-color:rgba(99,102,241,0.3);background:rgba(99,102,241,0.08)">
      <span class="material-icons-round" style="color:var(--accent-light)">diamond</span>
      <div class="list-content">
        <div class="list-title" style="color:var(--accent-light)">Upgrade ke Pro</div>
        <div class="list-subtitle">Buka semua fitur premium</div>
      </div>
      <span class="material-icons-round" style="color:var(--accent-light)">chevron_right</span>
    </div>

    <button class="btn btn-danger btn-block" style="margin-bottom:16px">
      <span class="material-icons-round" style="font-size:18px">logout</span>
      Keluar
    </button>

    <p class="text-sm text-muted" style="text-align:center">POSAS v1.0.0 · Paket Gratis</p>
  </div>`;
}
