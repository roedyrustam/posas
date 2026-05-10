// ========== POSAS Page Renderers ==========
import { products, customers, transactions, invoices, bookings, staff, logs, getWeeklyRevenue, getStats, cart, formatRupiah, getInitials, hashColor, getCurrentUser, branding, getLowStockProducts, getTopProducts, getTopCustomers, generateSalesCSV, exportToCSV } from './data.js';

// ===== DASHBOARD =====
export function renderDashboard() {
  const stats = getStats();
  const lowStock = getLowStockProducts();
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

    ${lowStock.length > 0 ? `
    <div class="card mb-16" style="background:rgba(255,193,7,0.1); border:1px solid var(--warning); border-radius:16px; padding:12px 16px">
      <div class="flex items-center gap-12">
        <div class="flex-center" style="background:var(--warning); color:white; width:32px; height:32px; border-radius:10px">
          <span class="material-icons-round" style="font-size:18px">warning</span>
        </div>
        <div class="flex-1">
          <div class="fw-700 text-sm">Stok Hampir Habis!</div>
          <div class="text-xs text-muted">${lowStock.length} produk butuh perhatian Anda.</div>
        </div>
        <button class="btn btn-sm btn-outline" style="border-radius:10px; padding:4px 10px; font-size:11px" onclick="navigateTo('products')">Lihat</button>
      </div>
    </div>` : ''}

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
      <div class="card" style="padding:12px">
        <canvas id="salesChartDashboard" height="150"></canvas>
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
        <button class="section-link" data-page="reports">Detail Analisis</button>
      </div>
      <div class="card" style="padding:4px 16px">
        ${getTopProducts(3).length > 0 ? getTopProducts(3).map((p, i) => {
          const product = products.find(pr => pr.name === p.name) || { emoji: '📦', price: 0 };
          return `
            <div class="list-item">
              <div style="font-size:24px">${product.emoji}</div>
              <div class="list-content ml-8">
                <div class="list-title">${p.name}</div>
                <div class="list-subtitle">${formatRupiah(product.price)}</div>
              </div>
              <div class="list-trailing">
                <div class="list-amount">${p.count}</div>
                <div class="list-meta">Terjual</div>
              </div>
            </div>`;
        }).join('') : `
          <div class="py-20 text-center opacity-40">
            <p class="text-xs">Belum ada data penjualan</p>
          </div>
        `}
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

    <div class="card mb-16 p-12 flex items-center justify-between" style="border-radius:12px; cursor:pointer" id="pos-select-customer">
      <div class="flex items-center gap-12">
        <div class="flex-center" style="background:var(--bg-elevated); width:32px; height:32px; border-radius:8px">
          <span class="material-icons-round" style="font-size:18px; color:var(--accent)">person</span>
        </div>
        <div>
          <div class="text-xs text-muted">Pelanggan</div>
          <div class="fw-700 text-sm" id="pos-customer-name">Walk-in Customer</div>
        </div>
      </div>
      <span class="material-icons-round text-muted">chevron_right</span>
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
      <div class="flex gap-8">
        <button class="btn btn-sm btn-secondary" id="btn-import-products">
          <span class="material-icons-round" style="font-size:16px">file_upload</span> Import
        </button>
        <button class="btn btn-sm btn-secondary" id="btn-sort-products">
          <span class="material-icons-round" style="font-size:16px">sort</span> Urutkan
        </button>
      </div>
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
  const user = getCurrentUser() || { plan: 'free' };
  const isPro = user.plan === 'pro';

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
      <div class="card p-12 mb-12 flex items-center gap-12 customer-item" data-id="${c.id}" style="cursor:pointer">
        <div class="avatar-btn" style="background:${hashColor(c.name)}"><span class="avatar-text" style="color:white">${getInitials(c.name)}</span></div>
        <div class="list-content">
          <div class="list-title">${c.name}</div>
          <div class="list-subtitle">${c.phone} · ${c.visits} kunjungan</div>
        </div>
        <div class="text-right">
          <div class="fw-700">${formatRupiah(c.totalSpent)}</div>
          ${isPro ? `
          <div class="flex items-center gap-4 justify-end">
            <span class="material-icons-round text-warning" style="font-size:14px">stars</span>
            <span class="text-xs fw-600" style="color:var(--warning)">${c.points || 0} pts</span>
          </div>` : ''}
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
  const lowStock = getLowStockProducts();
  const totalIn = transactions.reduce((s, t) => s + t.total, 0);

  return `
  <div class="fade-in">
    ${lowStock.length > 0 ? `
    <div class="card mb-16" style="background:rgba(255,193,7,0.1); border:1px solid var(--warning); border-radius:16px; padding:12px 16px">
      <div class="flex items-center gap-12">
        <div class="flex-center" style="background:var(--warning); color:white; width:32px; height:32px; border-radius:10px">
          <span class="material-icons-round" style="font-size:18px">warning</span>
        </div>
        <div class="flex-1">
          <div class="fw-700 text-sm">Stok Hampir Habis!</div>
          <div class="text-xs text-muted">${lowStock.length} produk butuh perhatian Anda.</div>
        </div>
        <button class="btn btn-sm btn-outline" style="border-radius:10px; padding:4px 10px; font-size:11px" onclick="navigateTo('products')">Lihat</button>
      </div>
    </div>` : ''}

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
        <div class="flex gap-8" style="margin-top:12px">
          <button class="btn btn-sm btn-ghost btn-view-invoice" data-id="${inv.id}" style="border:1px solid var(--border-color)">
            <span class="material-icons-round" style="font-size:16px">visibility</span> Lihat
          </button>
          ${inv.status !== 'paid' ? `
            <button class="btn btn-sm btn-primary btn-inv-status" data-id="${inv.id}" data-status="paid">Lunas</button>
          ` : ''}
        </div>
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
      <div class="card" style="padding:12px">
        <canvas id="mainSalesChart" height="200"></canvas>
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
      <div class="avatar-btn" style="width:52px;height:52px;font-size:18px;background:var(--accent)"><span class="avatar-text">${initials}</span></div>
      <div class="list-content">
        <div class="list-title" style="font-size:16px">${user.name}</div>
        <div class="list-subtitle">${user.email} · Pemilik</div>
      </div>
      <span class="material-icons-round text-muted">chevron_right</span>
    </div>

    <div class="section-title mb-8" style="font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Toko</div>
    <div class="grid-1 mb-16">
      <div class="card flex items-center gap-12 section-link" data-page="storeProfile" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">storefront</span>
        <div class="list-content">
          <div class="list-title">Profil Toko</div>
          <div class="list-subtitle">Nama: ${branding.storeName}</div>
        </div>
        <span class="badge badge-warning" style="font-size:10px">PRO</span>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12 section-link" data-page="appearance" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">palette</span>
        <div class="list-content">
          <div class="list-title">Tampilan</div>
          <div class="list-subtitle">Tema dan warna aksen</div>
        </div>
        <span class="badge badge-warning" style="font-size:10px">PRO</span>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12 section-link" data-page="receiptSettings" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">print</span>
        <div class="list-content">
          <div class="list-title">Struk & Nota</div>
          <div class="list-subtitle">Header, footer, dan logo</div>
        </div>
        <span class="badge badge-warning" style="font-size:10px">PRO</span>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
      <div class="card flex items-center gap-12" style="padding:14px 16px;cursor:pointer">
        <span class="material-icons-round text-muted">payments</span>
        <div class="list-content">
          <div class="list-title">Metode Pembayaran</div>
          <div class="list-subtitle">QRIS, tunai, transfer</div>
        </div>
        <span class="material-icons-round text-muted">chevron_right</span>
      </div>
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

    <div class="card flex items-center gap-12 mb-16 section-link" data-page="pricing" style="padding:14px 16px;border-color:rgba(99,102,241,0.3);background:rgba(99,102,241,0.08);cursor:pointer">
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

function renderStaffItem(s) {
  const isOwner = s.role === 'Owner';
  return `
  <div class="card p-12 flex items-center justify-between mb-8" style="border-radius:12px">
    <div class="flex items-center gap-12">
      <div class="list-avatar" style="background:${hashColor(s.name)};color:#fff">${getInitials(s.name)}</div>
      <div>
        <div class="fw-700 text-sm">${s.name} ${isOwner ? '<span class="badge badge-primary ml-4" style="font-size:10px;padding:2px 6px">YOU</span>' : ''}</div>
        <div class="text-xs text-muted">${s.role} · ${s.email}</div>
      </div>
    </div>
    <div class="flex items-center gap-8">
      <div class="text-xs ${s.status === 'Active' ? 'text-success' : 'text-muted'} fw-600">${s.status}</div>
      ${!isOwner ? `
        <button class="icon-btn btn-remove-staff" data-id="${s.id}" style="color:var(--danger); opacity:0.6">
          <span class="material-icons-round" style="font-size:20px">delete</span>
        </button>
      ` : ''}
    </div>
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

    <div class="grid-1 gap-4" id="team-list">
      ${staff.map(s => renderStaffItem(s)).join('')}
      ${staff.length === 0 ? `
        <div class="text-center py-40 opacity-40">
          <span class="material-icons-round" style="font-size:48px">group_off</span>
          <p class="text-sm">Belum ada staf terdaftar</p>
        </div>
      ` : ''}
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
export function renderPricing() {
  const user = getCurrentUser() || { plan: 'free' };
  
  return `
  <div class="p-20 fade-in">
    <div class="text-center mb-32">
      <h2 class="fw-700" style="font-size:24px">Pilih Paket Bisnis Anda</h2>
      <p class="text-muted text-sm">Upgrade untuk membuka potensi penuh POSAS</p>
    </div>

    <div class="grid-1 gap-20">
      <!-- Free Plan -->
      <div class="card p-24" style="${user.plan === 'free' ? 'border: 2px solid var(--accent); position: relative' : 'opacity: 0.8'}">
        ${user.plan === 'free' ? '<span class="badge badge-primary" style="position:absolute; top:-12px; right:20px">PAKET ANDA</span>' : ''}
        <div class="fw-700 text-lg mb-4">Gratis</div>
        <div class="flex items-baseline gap-4 mb-16">
          <span class="fw-700" style="font-size:32px">Rp 0</span>
          <span class="text-muted text-sm">/selamanya</span>
        </div>
        <ul class="text-sm text-muted mb-24" style="padding-left:16px; list-style: disc">
          <li class="mb-8">Kelola Produk & Stok</li>
          <li class="mb-8">Point of Sale (POS)</li>
          <li class="mb-8">Manajemen Pelanggan</li>
          <li class="mb-8" style="text-decoration: line-through; opacity:0.5">Laporan & Analitik</li>
          <li class="mb-8" style="text-decoration: line-through; opacity:0.5">Manajemen Tim (Staf)</li>
        </ul>
        <button class="btn btn-secondary btn-block" disabled>Sedang Digunakan</button>
      </div>

      <!-- Pro Plan -->
      <div class="card p-24" style="${user.plan === 'pro' ? 'border: 2px solid var(--accent); position: relative' : 'border-color: rgba(99, 102, 241, 0.3); background: linear-gradient(to bottom, rgba(99,102,241,0.05), transparent)'}">
        ${user.plan === 'pro' ? '<span class="badge badge-primary" style="position:absolute; top:-12px; right:20px">PAKET ANDA</span>' : '<span class="badge badge-warning" style="position:absolute; top:-12px; right:20px">TERPOPULER</span>'}
        <div class="flex items-center gap-8 mb-4">
          <div class="fw-700 text-lg">Pro</div>
          <span class="material-icons-round text-warning" style="font-size:18px">diamond</span>
        </div>
        <div class="flex items-baseline gap-4 mb-16">
          <span class="fw-700" style="font-size:32px">Rp 99.000</span>
          <span class="text-muted text-sm">/bulan</span>
        </div>
        <ul class="text-sm mb-24" style="padding-left:16px; list-style: disc">
          <li class="mb-8">Semua fitur Paket Gratis</li>
          <li class="mb-8 fw-600">Laporan & Analitik Canggih</li>
          <li class="mb-8 fw-600">Manajemen Tim (Unlimited Staf)</li>
          <li class="mb-8 fw-600">Export Data (Excel/CSV/PDF)</li>
          <li class="mb-8 fw-600">Backup Data Otomatis</li>
        </ul>
        <button class="btn btn-primary btn-block" id="btn-upgrade-pro" ${user.plan === 'pro' ? 'disabled' : ''}>
          ${user.plan === 'pro' ? 'Paket Aktif' : 'Upgrade ke Pro'}
        </button>
      </div>
    </div>

    <p class="text-xs text-muted text-center mt-24">
      Pembayaran aman. Batalkan kapan saja.<br>Butuh bantuan? <span class="text-accent">Hubungi CS</span>
    </p>
  </div>`;
}

// ===== CUSTOM BRANDING PAGES =====

export function renderAppearance() {
  const colors = [
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Slate', hex: '#64748b' }
  ];

  return `
  <div class="fade-in">
    <div class="section">
      <div class="section-header"><span class="section-title">Warna Aksen</span></div>
      <p class="text-sm text-muted mb-16">Pilih warna yang sesuai dengan identitas brand Anda.</p>
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px">
        ${colors.map(c => `
          <div class="color-picker-item ${branding.accent === c.hex ? 'active' : ''}" 
               data-color="${c.hex}" 
               style="background:${c.hex}; height:60px; border-radius:var(--radius-md); cursor:pointer; position:relative; border: 2px solid transparent">
            ${branding.accent === c.hex ? '<span class="material-icons-round" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:white">check</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-header"><span class="section-title">Tema Aplikasi</span></div>
      <div class="card flex items-center justify-between p-16">
        <div class="flex items-center gap-12">
          <span class="material-icons-round text-muted">dark_mode</span>
          <div class="list-title">Mode Gelap</div>
        </div>
        <span class="badge badge-success">Aktif</span>
      </div>
      <p class="text-xs text-muted mt-8">Mode terang akan tersedia di versi mendatang.</p>
    </div>

    <button class="btn btn-primary btn-block mt-24" id="btn-save-appearance">
      Simpan Perubahan
    </button>
  </div>
  <style>
    .color-picker-item.active { border-color: white !important; box-shadow: 0 0 15px rgba(255,255,255,0.3); }
  </style>`;
}

export function renderStoreProfile() {
  return `
  <div class="fade-in">
    <div class="card p-20 mb-20">
      <div class="input-group">
        <label class="input-label">Nama Toko</label>
        <input class="input" id="inp-store-name" value="${branding.storeName}" placeholder="Nama Bisnis Anda" />
      </div>
      <div class="input-group">
        <label class="input-label">Ikon Toko (Emoji)</label>
        <div class="flex gap-12 items-center">
          <input class="input" id="inp-store-emoji" value="${branding.storeEmoji}" placeholder="🏪" maxlength="4" style="width:80px; text-align:center; font-size:24px" />
          <p class="text-xs text-muted">Pilih emoji yang menggambarkan bisnis Anda (misal: ☕, 🍛, 🛍️)</p>
        </div>
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="btn-save-store-profile">
      Simpan Profil
    </button>
  </div>`;
}

export function renderReceiptSettings() {
  return `
  <div class="fade-in">
    <div class="section">
      <div class="section-header"><span class="section-title">Preview Struk</span></div>
      <div class="receipt mb-24" id="receipt-preview">
        <div class="receipt-header">
          <div class="receipt-store" id="preview-store-name">${branding.storeName}</div>
          <div class="receipt-info" id="preview-header-text">${branding.receiptHeader}</div>
        </div>
        <div class="receipt-items">
          <div class="receipt-item"><span>Produk Contoh</span><span>Rp 25.000</span></div>
          <div class="receipt-item"><span>Minuman Segar</span><span>Rp 10.000</span></div>
        </div>
        <div class="receipt-total"><span>TOTAL</span><span>Rp 35.000</span></div>
        <div class="receipt-footer">
          <p id="preview-footer-text">${branding.receiptFooter}</p>
          <p>Terima Kasih</p>
        </div>
      </div>
    </div>

    <div class="card p-20 mb-20">
      <div class="input-group">
        <label class="input-label">Header Struk</label>
        <textarea class="input" id="inp-receipt-header" rows="2" style="resize:none">${branding.receiptHeader}</textarea>
      </div>
      <div class="input-group">
        <label class="input-label">Footer Struk</label>
        <textarea class="input" id="inp-receipt-footer" rows="2" style="resize:none">${branding.receiptFooter}</textarea>
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="btn-save-receipt">
      Simpan Pengaturan
    </button>
  </div>`;
}

// ===== REPORTS =====
export function renderReports() {
  const user = getCurrentUser() || { plan: 'free' };
  const isPro = user.plan === 'pro';
  const topProducts = getTopProducts(5);
  const topCustomers = getTopCustomers(5);

  return `
  <div class="fade-in">
    <div class="flex items-center justify-between mb-24">
      <h2 class="fw-700">Analisis Bisnis</h2>
      <button class="btn btn-sm btn-outline flex items-center gap-8" id="btn-export-sales" ${isPro ? '' : 'disabled'}>
        <span class="material-icons-round" style="font-size:18px">download</span>
        Ekspor CSV
      </button>
    </div>

    <div class="section mb-24">
      <div class="section-header">
        <span class="section-title">Tren Penjualan 7 Hari</span>
        ${isPro ? '' : '<span class="badge badge-warning">PRO</span>'}
      </div>
      <div class="card p-12" style="height:200px">
        ${isPro ? '<canvas id="mainSalesChart"></canvas>' : `
          <div class="flex-center flex-col h-full opacity-40">
            <span class="material-icons-round mb-8" style="font-size:32px">show_chart</span>
            <p class="text-xs">Upgrade Pro untuk melihat grafik</p>
          </div>
        `}
      </div>
    </div>

    ${!isPro ? `
    <div class="card mb-24 p-20 text-center" style="background:linear-gradient(135deg, var(--accent), var(--accent-light)); color:white">
      <span class="material-icons-round mb-12" style="font-size:40px">insights</span>
      <h3 class="fw-700 mb-8">Buka Analisis Mendalam</h3>
      <p class="text-sm opacity-80 mb-16">Dapatkan insight produk terlaris dan pelanggan VIP Anda dengan POSAS Pro.</p>
      <button class="btn btn-white btn-sm" onclick="navigateTo('pricing')">Lihat Paket Pro</button>
    </div>` : ''}

    <div class="grid-1 gap-24">
      <div class="section">
        <div class="section-header">
          <span class="section-title">Produk Terlaris</span>
          ${isPro ? '' : '<span class="badge badge-warning">PRO</span>'}
        </div>
        <div class="card p-16">
          ${isPro && topProducts.length > 0 ? `
            <div class="space-y-16">
              ${topProducts.map(p => {
                const percentage = (p.count / topProducts[0].count) * 100;
                return `
                <div class="mb-12">
                  <div class="flex justify-between text-sm mb-4">
                    <span class="fw-600">${p.name}</span>
                    <span class="text-muted">${p.count} terjual</span>
                  </div>
                  <div style="height:8px; background:var(--bg-light); border-radius:4px; overflow:hidden">
                    <div style="height:100%; width:${percentage}%; background:var(--accent); border-radius:4px"></div>
                  </div>
                </div>`;
              }).join('')}
            </div>
          ` : `
            <div class="text-center py-20 opacity-40">
              <span class="material-icons-round" style="font-size:48px">bar_chart</span>
              <p class="text-sm">${topProducts.length === 0 ? 'Belum ada data transaksi' : 'Data hanya tersedia untuk pengguna Pro'}</p>
            </div>
          `}
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <span class="section-title">Pelanggan VIP (Revenue Terbesar)</span>
          ${isPro ? '' : '<span class="badge badge-warning">PRO</span>'}
        </div>
        <div class="card" style="padding:4px 16px">
          ${isPro ? `
            ${topCustomers.map((c, i) => `
              <div class="list-item">
                <div class="flex-center fw-700 text-muted" style="width:24px; font-size:14px">#${i+1}</div>
                <div class="list-avatar ml-8" style="background:${hashColor(c.name)};color:#fff">${getInitials(c.name)}</div>
                <div class="list-content">
                  <div class="list-title">${c.name}</div>
                  <div class="list-subtitle">${c.visits} kunjungan</div>
                </div>
                <div class="list-trailing">
                  <div class="list-amount" style="color:var(--accent)">${formatRupiah(c.totalSpent)}</div>
                  <div class="list-meta">Total Belanja</div>
                </div>
              </div>
            `).join('')}
          ` : `
            <div class="text-center py-20 opacity-40">
              <span class="material-icons-round" style="font-size:48px">group</span>
              <p class="text-sm">Data hanya tersedia untuk pengguna Pro</p>
            </div>
          `}
        </div>
      </div>
    </div>
  </div>`;
}
export function renderLogs() {
  return `
  <div class="fade-in">
    <div class="section-header">
      <span class="section-title">Audit Logs</span>
      <span class="text-xs text-muted">Aktivitas Terakhir</span>
    </div>
    <div class="card" style="padding:0">
      ${logs.length > 0 ? logs.map(log => `
        <div class="list-item" style="border-bottom:1px solid var(--border-color); padding:12px 16px">
          <div class="list-avatar" style="background:var(--accent-glow);color:var(--accent)">
            <span class="material-icons-round" style="font-size:18px">
              ${log.action.includes('Delete') ? 'delete_forever' : log.action.includes('Update') ? 'edit' : 'add_circle'}
            </span>
          </div>
          <div class="list-content">
            <div class="flex justify-between items-center">
              <div class="list-title" style="font-size:14px">${log.action}</div>
              <span class="text-xs text-muted">${new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
            <div class="list-subtitle" style="font-size:12px">Oleh <b>${log.user}</b> (${log.role})</div>
            ${log.details ? `<div class="text-xs mt-4 color-muted">${log.details}</div>` : ''}
          </div>
        </div>
      `).join('') : '<div class="p-24 text-center text-muted">Belum ada riwayat aktivitas</div>'}
    </div>
  </div>`;
}

export function renderInvoiceDetail(invId) {
  const inv = invoices.find(i => i.id === invId);
  if (!inv) return 'Invoice tidak ditemukan';
  
  return `
    <div id="invoice-capture-area" class="p-24" style="background:#fff; color:#1e293b; border-radius:12px; font-family:'Inter', sans-serif">
      <div class="flex justify-between items-start mb-32">
        <div>
          <div style="font-size:32px; font-weight:800; color:var(--accent); letter-spacing:-1px">${branding.storeName}</div>
          <div style="color:#64748b; font-size:14px">${branding.storeEmoji} Official Invoice</div>
        </div>
        <div class="text-right">
          <div style="font-size:18px; font-weight:700">${inv.number}</div>
          <div style="color:#64748b; font-size:12px">Dibuat: ${inv.createdAt}</div>
        </div>
      </div>
      
      <div class="mb-32">
        <div style="color:#64748b; font-size:11px; text-transform:uppercase; font-weight:700; margin-bottom:4px">Ditagihkan Ke:</div>
        <div style="font-size:16px; font-weight:600">${inv.customer}</div>
      </div>
      
      <table style="width:100%; border-collapse:collapse; margin-bottom:32px">
        <thead>
          <tr style="border-bottom:2px solid #f1f5f9; text-align:left">
            <th style="padding:12px 0; font-size:12px; color:#64748b">DESKRIPSI</th>
            <th style="padding:12px 0; font-size:12px; color:#64748b; text-align:center">QTY</th>
            <th style="padding:12px 0; font-size:12px; color:#64748b; text-align:right">HARGA</th>
            <th style="padding:12px 0; font-size:12px; color:#64748b; text-align:right">SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${inv.items.map(item => `
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="padding:12px 0; font-weight:600">${item.name}</td>
              <td style="padding:12px 0; text-align:center">${item.qty}</td>
              <td style="padding:12px 0; text-align:right">${formatRupiah(item.price)}</td>
              <td style="padding:12px 0; text-align:right; font-weight:600">${formatRupiah(item.price * item.qty)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="flex justify-end">
        <div style="width:200px">
          <div class="flex justify-between mb-8">
            <span style="color:#64748b">Total</span>
            <span style="font-weight:800; font-size:18px">${formatRupiah(inv.total)}</span>
          </div>
          <div style="background:${inv.status === 'paid' ? '#dcfce7' : '#fee2e2'}; color:${inv.status === 'paid' ? '#166534' : '#991b1b'}; padding:8px; border-radius:6px; text-align:center; font-weight:700; font-size:12px">
            ${inv.status.toUpperCase()}
          </div>
        </div>
      </div>
      
      <div style="margin-top:48px; border-top:1px solid #f1f5f9; padding-top:16px; font-size:11px; color:#94a3b8; text-align:center">
        ${branding.receiptFooter}
      </div>
    </div>
  `;
}
