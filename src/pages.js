// ========== POSAS Page Renderers ==========
import { products, customers, transactions, invoices, bookings, getWeeklyRevenue, getStats, cart, formatRupiah, getInitials, hashColor, getCurrentUser } from './data.js';

// ===== DASHBOARD =====
export function renderDashboard() {
  const stats = getStats();
  const weeklyRevenue = getWeeklyRevenue();
  const maxRev = Math.max(...weeklyRevenue.map(d => d.amount), 1);
  const user = getCurrentUser() || { name: 'Pengguna' };
  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Pagi' : hour < 15 ? 'Siang' : hour < 19 ? 'Sore' : 'Malam';

  return `
  <div class="fade-in">
    <div class="mb-16">
      <p class="text-sm text-muted">Selamat ${greeting}, <strong>${user.name.split(' ')[0]}</strong> 👋</p>
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
  if (bookings.length === 0) {
    return `
    <div class="fade-in">
      <div class="empty-state">
        <span class="material-icons-round">calendar_month</span>
        <h3>Belum ada booking</h3>
        <p>Buat booking pertama untuk mengatur jadwal layanan Anda.</p>
      </div>
      <button class="btn-fab" id="btn-add-booking" aria-label="Tambah Booking">
        <span class="material-icons-round">add</span>
      </button>
    </div>`;
  }
  const upcoming = bookings.filter(b => b.status === 'confirmed');
  const past = bookings.filter(b => b.status !== 'confirmed');
  return `
  <div class="fade-in">
    ${upcoming.length > 0 ? `
    <div class="section">
      <div class="section-header"><span class="section-title">Akan Datang (${upcoming.length})</span></div>
      <div class="grid-1">${upcoming.map(b => `
        <div class="card flex items-center gap-12" style="padding:14px 16px;border-left:3px solid var(--accent)">
          <div class="stat-icon purple"><span class="material-icons-round">event</span></div>
          <div class="list-content">
            <div class="list-title">${b.customerName}</div>
            <div class="list-subtitle">${b.service} · ${b.date} ${b.time}</div>
          </div>
          <button class="icon-btn btn-complete-booking" data-id="${b.id}" aria-label="Selesai">
            <span class="material-icons-round" style="color:var(--success)">check_circle</span>
          </button>
        </div>`).join('')}
      </div>
    </div>` : ''}
    ${past.length > 0 ? `
    <div class="section">
      <div class="section-header"><span class="section-title">Riwayat</span></div>
      <div class="grid-1">${past.slice(0, 10).map(b => `
        <div class="card flex items-center gap-12" style="padding:14px 16px;opacity:0.6">
          <div class="stat-icon green"><span class="material-icons-round">event_available</span></div>
          <div class="list-content">
            <div class="list-title">${b.customerName}</div>
            <div class="list-subtitle">${b.service} · ${b.date} ${b.time}</div>
          </div>
          <span class="badge badge-success">${b.status === 'completed' ? 'Selesai' : 'Batal'}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}
    <button class="btn-fab" id="btn-add-booking" aria-label="Tambah Booking">
      <span class="material-icons-round">add</span>
    </button>
  </div>`;
}

// ===== INVOICES =====
export function renderInvoices() {
  const statusMap = { draft: ['badge-info', 'Draft'], sent: ['badge-warning', 'Terkirim'], paid: ['badge-success', 'Lunas'] };
  if (invoices.length === 0) {
    return `
    <div class="fade-in">
      <div class="empty-state">
        <span class="material-icons-round">receipt_long</span>
        <h3>Belum ada invoice</h3>
        <p>Buat invoice pertama Anda untuk menagih pelanggan secara profesional.</p>
      </div>
      <button class="btn-fab" id="btn-create-invoice" aria-label="Buat Invoice">
        <span class="material-icons-round">add</span>
      </button>
    </div>`;
  }
  return `
  <div class="fade-in">
    <div class="grid-2 mb-16">
      <div class="stat-card green">
        <div class="stat-icon green"><span class="material-icons-round">check_circle</span></div>
        <div class="stat-value" style="font-size:18px">${invoices.filter(i => i.status === 'paid').length}</div>
        <div class="stat-label">Lunas</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon orange"><span class="material-icons-round">pending</span></div>
        <div class="stat-value" style="font-size:18px">${invoices.filter(i => i.status !== 'paid').length}</div>
        <div class="stat-label">Belum Lunas</div>
      </div>
    </div>
    <div class="grid-1">${invoices.map(inv => {
      const [bc, bt] = statusMap[inv.status] || statusMap.draft;
      return `
      <div class="card" style="padding:14px 16px">
        <div class="flex justify-between items-center mb-8">
          <span class="fw-700" style="color:var(--accent-light)">${inv.number}</span>
          <span class="badge ${bc}">${bt}</span>
        </div>
        <div class="list-title">${inv.customer}</div>
        <div class="flex justify-between items-center" style="margin-top:6px">
          <span class="list-subtitle">${inv.createdAt}</span>
          <span class="fw-700">${formatRupiah(inv.total)}</span>
        </div>
        ${inv.status !== 'paid' ? `<div class="flex gap-8" style="margin-top:10px">
          ${inv.status === 'draft' ? `<button class="btn btn-sm btn-secondary btn-inv-status" data-id="${inv.id}" data-status="sent">Kirim</button>` : ''}
          <button class="btn btn-sm btn-primary btn-inv-status" data-id="${inv.id}" data-status="paid">Tandai Lunas</button>
        </div>` : ''}
      </div>`;
    }).join('')}
    </div>
    <button class="btn-fab" id="btn-create-invoice" aria-label="Buat Invoice">
      <span class="material-icons-round">add</span>
    </button>
  </div>`;
}

// ===== REPORTS =====
export function renderReports() {
  const stats = getStats();
  const weeklyRevenue = getWeeklyRevenue();
  const maxRev = Math.max(...weeklyRevenue.map(d => d.amount), 1);
  const methods = {};
  transactions.forEach(t => { methods[t.method] = (methods[t.method] || 0) + t.total; });
  const methodTotal = Object.values(methods).reduce((a, b) => a + b, 0) || 1;
  const productCounts = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      const name = item.replace(/\s*x\d+$/, '');
      const qm = item.match(/x(\d+)$/);
      productCounts[name] = (productCounts[name] || 0) + (qm ? parseInt(qm[1]) : 1);
    });
  });
  const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return `
  <div class="fade-in">
    <div class="grid-2 mb-16">
      <div class="stat-card purple">
        <div class="stat-icon purple"><span class="material-icons-round">payments</span></div>
        <div class="stat-value" style="font-size:16px">${formatRupiah(stats.todayRevenue)}</div>
        <div class="stat-label">Hari Ini</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon green"><span class="material-icons-round">trending_up</span></div>
        <div class="stat-value" style="font-size:16px">${formatRupiah(stats.monthRevenue)}</div>
        <div class="stat-label">Total Penjualan</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Tren Mingguan</span>
        <button class="btn btn-sm btn-secondary" id="btn-export-csv" style="padding: 6px 12px; font-size: 11px;">
          <span class="material-icons-round" style="font-size:14px">download</span> Export CSV
        </button>
      </div>
      <div class="card">
        <div class="chart-bar-container">${weeklyRevenue.map(d => `
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height:${(d.amount / maxRev) * 100}%"></div>
            <span class="chart-label">${d.day}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header"><span class="section-title">Produk Terlaris</span></div>
      <div class="card" style="padding:8px 16px">
        ${topProducts.length > 0 ? topProducts.map(([name, count], i) => {
          const p = products.find(pr => pr.name === name);
          return `<div class="list-item">
            <div style="font-size:24px;width:32px;text-align:center">${p ? p.emoji : '📦'}</div>
            <div class="list-content">
              <div class="list-title">${name}</div>
              <div class="list-subtitle">${count} terjual</div>
            </div>
            <span class="badge badge-info">#${i + 1}</span>
          </div>`;
        }).join('') : '<div class="text-sm text-muted" style="padding:16px 0;text-align:center">Belum ada data</div>'}
      </div>
    </div>

    <div class="section">
      <div class="section-header"><span class="section-title">Metode Pembayaran</span></div>
      <div class="card" style="padding:14px 16px">
        ${Object.entries(methods).length > 0 ? Object.entries(methods).map(([method, amount]) => {
          const pct = Math.round((amount / methodTotal) * 100);
          return `<div style="margin-bottom:12px">
            <div class="flex justify-between items-center mb-8">
              <span class="text-sm fw-600">${method}</span>
              <span class="text-sm text-muted">${pct}% · ${formatRupiah(amount)}</span>
            </div>
            <div style="height:6px;background:var(--bg-elevated);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent),#a855f7);border-radius:3px"></div>
            </div>
          </div>`;
        }).join('') : '<div class="text-sm text-muted" style="text-align:center">Belum ada data</div>'}
      </div>
    </div>

    <div class="section">
      <div class="section-header"><span class="section-title">Ringkasan</span></div>
      <div class="grid-2">
        <div class="card" style="text-align:center;padding:14px">
          <div class="stat-value" style="font-size:28px;color:var(--accent-light)">${stats.totalProducts}</div>
          <div class="stat-label">Produk</div>
        </div>
        <div class="card" style="text-align:center;padding:14px">
          <div class="stat-value" style="font-size:28px;color:var(--info)">${stats.totalCustomers}</div>
          <div class="stat-label">Pelanggan</div>
        </div>
        <div class="card" style="text-align:center;padding:14px">
          <div class="stat-value" style="font-size:28px;color:var(--success)">${transactions.length}</div>
          <div class="stat-label">Transaksi</div>
        </div>
        <div class="card" style="text-align:center;padding:14px">
          <div class="stat-value" style="font-size:28px;color:var(--warning)">${stats.lowStock}</div>
          <div class="stat-label">Stok Menipis</div>
        </div>
      </div>
    </div>
  </div>`;
}

// ===== SETTINGS =====
export function renderSettings() {
  const user = getCurrentUser() || { name: 'Pengguna', email: '', storeName: 'Toko Saya', plan: 'free' };
  const initials = getInitials(user.name);

  return `
  <div class="fade-in">
    <div class="card mb-16 flex items-center gap-12">
      <div class="avatar-btn" style="width:52px;height:52px;font-size:18px"><span class="avatar-text">${initials}</span></div>
      <div class="list-content">
        <div class="list-title" style="font-size:16px">${user.name}</div>
        <div class="list-subtitle">${user.email} · Pemilik</div>
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
      <div class="card flex items-center gap-12 section-link" data-page="team" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">people</span>
        <div class="list-content">
          <div class="list-title">Tim & Akses</div>
          <div class="list-subtitle">Kelola karyawan dan hak akses</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">security</span>
        <div class="list-content">
          <div class="list-title">Keamanan</div>
          <div class="list-subtitle">Password dan verifikasi</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">help</span>
        <div class="list-content">
          <div class="list-title">Bantuan</div>
          <div class="list-subtitle">FAQ dan dukungan</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
    </div>

    <div class="card flex items-center gap-12 mb-16" style="padding:14px 16px;border-color:rgba(99,102,241,0.3);background:rgba(99,102,241,0.08)">
      <span class="material-icons-round" style="color:var(--accent-light)">diamond</span>
      <div class="list-content">
        <div class="list-title" style="color:var(--accent-light)">Upgrade ke Pro</div>
        <div class="list-subtitle">Buka semua fitur premium</div>
      </div>
      <span class="material-icons-round" style="color:var(--accent-light)">chevron_right</span>
    </div>

    <button class="btn btn-danger btn-block" id="btn-logout" style="margin-bottom:16px">
      <span class="material-icons-round" style="font-size:18px">logout</span>
      Keluar
    </button>

    <p class="text-sm text-muted" style="text-align:center">POSAS v1.0.0 · Paket ${user.plan === 'free' ? 'Gratis' : 'Premium'}</p>
  </div>`;
}

export function renderTeam() {
  const user = getSession();
  return `
  <div class="p-20 fade-in">
    <div class="flex justify-between items-center mb-20">
      <div>
        <h2 class="fw-700" style="font-size:20px">Tim & Akses</h2>
        <p class="text-muted text-sm">Manajemen staf dan hak akses toko</p>
      </div>
      <button class="btn btn-primary btn-sm" id="btn-invite-staff">
        <span class="material-icons-round" style="font-size:18px">person_add</span>
        Tambah Staf
      </button>
    </div>

    <div class="grid-1 gap-12" id="team-list">
      <div class="flex items-center justify-center p-40">
        <span class="material-icons-round spin" style="font-size:32px;color:var(--accent)">sync</span>
      </div>
    </div>

    <div class="card mt-24" style="background:rgba(99,102,241,0.05);border-color:rgba(99,102,241,0.2)">
      <div class="flex gap-12 p-16">
        <span class="material-icons-round" style="color:var(--accent)">info</span>
        <div>
          <div class="fw-600 mb-4" style="font-size:14px">Tentang Hak Akses</div>
          <ul class="text-sm text-muted" style="padding-left:16px;margin:0">
            <li><strong>Owner</strong>: Akses penuh ke semua fitur dan data.</li>
            <li><strong>Manajer</strong>: Akses semua kecuali hapus data & kelola staf.</li>
            <li><strong>Kasir</strong>: Hanya akses POS, Pelanggan, dan Booking.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>`;
}
