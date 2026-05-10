// ========== POSAS Main App ==========
import './style.css';
import Chart from 'chart.js/auto';
import { products, customers, cart, formatRupiah, addProduct, addCustomer, addTransaction, decreaseStock, addInvoice, updateInvoiceStatus, addBooking, updateBookingStatus, deleteProduct, deleteCustomer, register, login, logout, getSession, getCurrentUser, exportToCSV, transactions, canAccess, fetchTeam, upgradeToPro } from './data.js';
import {
  renderDashboard, renderPOS, renderProducts,
  renderCustomers, renderFinance, renderBooking,
  renderInvoices, renderReports, renderSettings, renderTeam, renderPricing
} from './pages.js';
import { getWeeklyRevenue } from './data.js';

// Page registry
const pages = {
  dashboard:  { title: 'Dashboard', render: renderDashboard },
  pos:        { title: 'Kasir',     render: renderPOS },
  products:   { title: 'Produk',    render: renderProducts },
  customers:  { title: 'Pelanggan', render: renderCustomers },
  finance:    { title: 'Keuangan',  render: renderFinance },
  booking:    { title: 'Booking',   render: renderBooking },
  invoices:   { title: 'Invoice',   render: renderInvoices },
  reports:    { title: 'Laporan',   render: renderReports },
  settings:   { title: 'Pengaturan', render: renderSettings },
  team:       { title: 'Manajemen Tim', render: renderTeam },
  pricing:    { title: 'Paket Berlangganan', render: renderPricing },
};

let currentPage = 'dashboard';

// DOM refs
const $ = id => document.getElementById(id);
const splash = $('splash-screen');
const shell = $('app-shell');
const container = $('page-container');
const pageTitle = $('page-title');
const bottomNav = $('bottom-nav');
const drawer = $('side-drawer');
const drawerOverlay = $('drawer-overlay');
const toastContainer = $('toast-container');
const modalOverlay = $('modal-overlay');
const modalContainer = $('modal-container');
const authScreen = $('auth-screen');

// ===== Navigation =====
function navigateTo(page) {
  if (!pages[page]) return;
  if (!canAccess(page) && page !== 'dashboard') {
    showToast('Akses ditolak: Anda tidak memiliki izin untuk halaman ini ✋', 'danger');
    return;
  }
  currentPage = page;

  // Render page
  container.innerHTML = pages[page].render();
  pageTitle.textContent = pages[page].title;

  // Update bottom nav
  bottomNav.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  // Update drawer
  drawer.querySelectorAll('.drawer-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  // Close drawer
  closeDrawer();

  // Scroll to top
  container.scrollTo(0, 0);
  window.scrollTo(0, 0);

  // Bind page-specific events
  bindPageEvents(page);
}

// ===== Drawer =====
function openDrawer() {
  drawer.classList.add('open');
  drawerOverlay.classList.remove('hidden');
  requestAnimationFrame(() => drawerOverlay.classList.add('show'));
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('show');
  setTimeout(() => drawerOverlay.classList.add('hidden'), 300);
}

// ===== Toast =====
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'check_circle' : 'error';
  toast.innerHTML = `<span class="material-icons-round" style="font-size:20px;color:var(--${type === 'success' ? 'success' : 'danger'})">${icon}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(-10px)'; toast.style.transition = 'all 0.3s ease'; }, 2500);
  setTimeout(() => toast.remove(), 3000);
}

// ===== Modal =====
function showModal(content) {
  modalContainer.innerHTML = `<div class="modal"><div class="modal-handle"></div>${content}</div>`;
  modalOverlay.classList.remove('hidden');
  modalContainer.classList.remove('hidden');
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalContainer.classList.add('hidden');
}

// ===== POS Cart Logic =====
function updateCartUI() {
  const summary = document.getElementById('cart-summary');
  if (!summary) return;
  summary.style.display = cart.count > 0 ? 'flex' : 'none';
  summary.innerHTML = `
    <div>
      <div class="cart-count"><strong>${cart.count}</strong> item</div>
      <div class="cart-total">${formatRupiah(cart.total)}</div>
    </div>
    <button class="btn btn-primary" id="btn-checkout">
      <span class="material-icons-round" style="font-size:18px">shopping_cart_checkout</span>
      Bayar
    </button>
  `;
  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);
}

function handleCheckout() {
  if (cart.count === 0) return;
  const items = cart.items.map(i => `
    <div class="flex justify-between items-center" style="padding:8px 0;border-bottom:1px solid var(--border)">
      <div>
        <span style="font-size:13px;font-weight:600">${i.emoji} ${i.name}</span>
        <span class="text-muted text-sm"> x${i.qty}</span>
      </div>
      <span class="fw-600">${formatRupiah(i.price * i.qty)}</span>
    </div>
  `).join('');

  showModal(`
    <div class="modal-title">Ringkasan Pembayaran</div>
    ${items}
    <div class="flex justify-between items-center mt-16" style="padding-top:12px">
      <span class="fw-700" style="font-size:16px">Total</span>
      <span class="fw-700" style="font-size:20px;color:var(--accent-light)">${formatRupiah(cart.total)}</span>
    </div>
    <div class="mt-16" style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">Metode Pembayaran</div>
    <div class="grid-2 gap-8 mb-16">
      <button class="btn btn-secondary pay-method active" data-method="qris">🔲 QRIS</button>
      <button class="btn btn-secondary pay-method" data-method="cash">💵 Tunai</button>
    </div>
    <button class="btn btn-primary btn-block" id="btn-confirm-pay" style="padding:16px">
      <span class="material-icons-round" style="font-size:20px">check_circle</span>
      Konfirmasi Bayar
    </button>
  `);

  // Payment method selection
  let selectedMethod = 'QRIS';
  setTimeout(() => {
    document.querySelectorAll('.pay-method').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMethod = btn.dataset.method === 'cash' ? 'Tunai' : 'QRIS';
      });
    });
    const confirmBtn = document.getElementById('btn-confirm-pay');
    if (confirmBtn) confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Memproses...';
      
      // Persist transaction
      const itemLabels = cart.items.map(i => i.qty > 1 ? `${i.name} x${i.qty}` : i.name);
      const txn = {
        items: itemLabels,
        total: cart.total,
        customer: 'Walk-in',
        method: selectedMethod,
        cartItems: [...cart.items],
        date: new Date().toLocaleString('id-ID')
      };
      await addTransaction(txn);
      
      cart.clear();
      closeModal();
      showReceiptModal(txn);
    });
  }, 100);
}

// ===== Page-specific event binding =====
function bindPageEvents(page) {
  if (page === 'pos') {
    // Product tap to add
    document.querySelectorAll('.pos-product').forEach(el => {
      el.addEventListener('click', () => {
        const p = products.find(pr => pr.id === el.dataset.id);
        if (p) {
          cart.add(p);
          updateCartUI();
          // Visual feedback
          el.style.borderColor = 'var(--accent)';
          el.style.boxShadow = '0 0 12px var(--accent-glow)';
          setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 300);
          showToast(`${p.emoji} ${p.name} ditambahkan`);
        }
      });
    });

    // Checkout button
    const checkoutBtn = document.getElementById('btn-checkout');
    if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

    // Category filter
    document.querySelectorAll('.pos-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pos-filter').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        const cat = btn.dataset.cat;
        document.querySelectorAll('.pos-product').forEach(el => {
          const p = products.find(pr => pr.id === el.dataset.id);
          el.style.display = (cat === 'all' || p.category === cat) ? '' : 'none';
        });
      });
    });

    // Search
    const search = document.getElementById('pos-search');
    if (search) search.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.pos-product').forEach(el => {
        const p = products.find(pr => pr.id === el.dataset.id);
        el.style.display = p.name.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  if (page === 'products') {
    const fab = document.getElementById('btn-add-product');
    if (fab) fab.addEventListener('click', () => {
      showModal(`
        <div class="modal-title">Tambah Produk</div>
        <div class="input-group">
          <label class="input-label">Nama Produk *</label>
          <input class="input" id="inp-product-name" placeholder="Contoh: Kopi Susu" />
        </div>
        <div class="input-group">
          <label class="input-label">Harga (Rp) *</label>
          <input class="input" id="inp-product-price" type="number" min="0" placeholder="Contoh: 18000" />
        </div>
        <div class="input-group">
          <label class="input-label">Stok Awal *</label>
          <input class="input" id="inp-product-stock" type="number" min="0" placeholder="Contoh: 50" />
        </div>
        <div class="input-group">
          <label class="input-label">Kategori *</label>
          <input class="input" id="inp-product-category" placeholder="Contoh: Minuman" />
        </div>
        <div class="input-group">
          <label class="input-label">Emoji (opsional)</label>
          <input class="input" id="inp-product-emoji" placeholder="Contoh: ☕" maxlength="4" />
        </div>
        <div id="product-form-error" style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none"></div>
        <button class="btn btn-primary btn-block mt-8" id="btn-save-product">
          <span class="material-icons-round" style="font-size:18px">save</span>
          Simpan Produk
        </button>
      `);

      setTimeout(() => {
        const saveBtn = document.getElementById('btn-save-product');
        if (saveBtn) saveBtn.addEventListener('click', async () => {
          const name = document.getElementById('inp-product-name').value.trim();
          const price = document.getElementById('inp-product-price').value;
          const stock = document.getElementById('inp-product-stock').value;
          const category = document.getElementById('inp-product-category').value.trim();
          const emoji = document.getElementById('inp-product-emoji').value.trim();
          const errEl = document.getElementById('product-form-error');

          // Validation
          if (!name || !price || !stock || !category) {
            errEl.textContent = 'Semua field bertanda * wajib diisi.';
            errEl.style.display = 'block';
            return;
          }
          
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Menyimpan...';

          await addProduct({ name, price, stock, category, emoji });
          closeModal();
          showToast(`${emoji || '📦'} ${name} berhasil ditambahkan`);
          navigateTo('products');
        });
      }, 50);
    });
  }

  if (page === 'customers') {
    const fab = document.getElementById('btn-add-customer');
    if (fab) fab.addEventListener('click', () => {
      showModal(`
        <div class="modal-title">Tambah Pelanggan</div>
        <div class="input-group">
          <label class="input-label">Nama Lengkap *</label>
          <input class="input" id="inp-customer-name" placeholder="Contoh: Andi Pratama" />
        </div>
        <div class="input-group">
          <label class="input-label">No. Telepon *</label>
          <input class="input" id="inp-customer-phone" type="tel" placeholder="Contoh: 0812-3456-7890" />
        </div>
        <div class="input-group">
          <label class="input-label">Email (opsional)</label>
          <input class="input" id="inp-customer-email" type="email" placeholder="Contoh: andi@email.com" />
        </div>
        <div id="customer-form-error" style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none"></div>
        <button class="btn btn-primary btn-block mt-8" id="btn-save-customer">
          <span class="material-icons-round" style="font-size:18px">person_add</span>
          Simpan Pelanggan
        </button>
      `);

      setTimeout(() => {
        const saveBtn = document.getElementById('btn-save-customer');
        if (saveBtn) saveBtn.addEventListener('click', async () => {
          const name = document.getElementById('inp-customer-name').value.trim();
          const phone = document.getElementById('inp-customer-phone').value.trim();
          const email = document.getElementById('inp-customer-email').value.trim();
          const errEl = document.getElementById('customer-form-error');

          if (!name || !phone) {
            errEl.textContent = 'Nama dan No. Telepon wajib diisi.';
            errEl.style.display = 'block';
            return;
          }

          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Menyimpan...';

          await addCustomer({ name, phone, email });
          closeModal();
          showToast(`👤 ${name} berhasil ditambahkan`);
          navigateTo('customers');
        });
      }, 50);
    });
  }

  // Section links - navigate
  document.querySelectorAll('.section-link[data-page]').forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
  });

  // === Booking events ===
  if (page === 'booking') {
    const fab = document.getElementById('btn-add-booking');
    if (fab) fab.addEventListener('click', () => {
      showModal(`
        <div class="modal-title">Tambah Booking</div>
        <div class="input-group">
          <label class="input-label">Nama Pelanggan *</label>
          <input class="input" id="inp-bk-name" placeholder="Contoh: Andi Pratama" />
        </div>
        <div class="input-group">
          <label class="input-label">Layanan *</label>
          <input class="input" id="inp-bk-service" placeholder="Contoh: Potong Rambut" />
        </div>
        <div class="input-group">
          <label class="input-label">Tanggal *</label>
          <input class="input" id="inp-bk-date" type="date" />
        </div>
        <div class="input-group">
          <label class="input-label">Jam *</label>
          <input class="input" id="inp-bk-time" type="time" />
        </div>
        <div class="input-group">
          <label class="input-label">Catatan (opsional)</label>
          <input class="input" id="inp-bk-notes" placeholder="Catatan tambahan" />
        </div>
        <div id="bk-form-error" style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none"></div>
        <button class="btn btn-primary btn-block mt-8" id="btn-save-booking">
          <span class="material-icons-round" style="font-size:18px">event</span> Simpan Booking
        </button>
      `);
      setTimeout(() => {
        const saveBtn = document.getElementById('btn-save-booking');
        if (saveBtn) saveBtn.addEventListener('click', async () => {
          const customerName = document.getElementById('inp-bk-name').value.trim();
          const service = document.getElementById('inp-bk-service').value.trim();
          const date = document.getElementById('inp-bk-date').value;
          const time = document.getElementById('inp-bk-time').value;
          const notes = document.getElementById('inp-bk-notes').value.trim();
          const errEl = document.getElementById('bk-form-error');
          if (!customerName || !service || !date || !time) {
            errEl.textContent = 'Semua field bertanda * wajib diisi.';
            errEl.style.display = 'block';
            return;
          }

          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Menyimpan...';

          await addBooking({ customerName, service, date, time, notes });
          closeModal();
          showToast(`📅 Booking untuk ${customerName} berhasil`);
          navigateTo('booking');
        });
      }, 50);
    });
    document.querySelectorAll('.btn-complete-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        await updateBookingStatus(btn.dataset.id, 'completed');
        showToast('Booking ditandai selesai ✅');
        navigateTo('booking');
      });
    });
  }

  // === Invoice events ===
  if (page === 'invoices') {
    const fab = document.getElementById('btn-create-invoice');
    if (fab) fab.addEventListener('click', () => {
      const custOptions = customers.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      showModal(`
        <div class="modal-title">Buat Invoice</div>
        <div class="input-group">
          <label class="input-label">Pelanggan *</label>
          <select class="input" id="inp-inv-customer"><option value="">Pilih pelanggan</option>${custOptions}</select>
        </div>
        <div class="input-group">
          <label class="input-label">Deskripsi Item *</label>
          <input class="input" id="inp-inv-desc" placeholder="Contoh: Jasa Design Logo" />
        </div>
        <div class="input-group">
          <label class="input-label">Total (Rp) *</label>
          <input class="input" id="inp-inv-total" type="number" min="0" placeholder="Contoh: 500000" />
        </div>
        <div class="input-group">
          <label class="input-label">Jatuh Tempo</label>
          <input class="input" id="inp-inv-due" type="date" />
        </div>
        <div id="inv-form-error" style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none"></div>
        <button class="btn btn-primary btn-block mt-8" id="btn-save-invoice">
          <span class="material-icons-round" style="font-size:18px">receipt_long</span> Buat Invoice
        </button>
      `);
      setTimeout(() => {
        const saveBtn = document.getElementById('btn-save-invoice');
        if (saveBtn) saveBtn.addEventListener('click', async () => {
          const customer = document.getElementById('inp-inv-customer').value;
          const desc = document.getElementById('inp-inv-desc').value.trim();
          const total = document.getElementById('inp-inv-total').value;
          const dueDate = document.getElementById('inp-inv-due').value;
          const errEl = document.getElementById('inv-form-error');
          if (!customer || !desc || !total) {
            errEl.textContent = 'Pelanggan, Deskripsi, dan Total wajib diisi.';
            errEl.style.display = 'block';
            return;
          }

          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Membuat...';

          await addInvoice({ customer, items: [{ name: desc, qty: 1, price: Number(total) }], total, dueDate });
          closeModal();
          showToast(`🧾 Invoice untuk ${customer} berhasil dibuat`);
          navigateTo('invoices');
        });
      }, 50);
    });
    document.querySelectorAll('.btn-inv-status').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        await updateInvoiceStatus(btn.dataset.id, btn.dataset.status);
        showToast(btn.dataset.status === 'paid' ? '✅ Invoice lunas!' : '📤 Invoice terkirim!');
        navigateTo('invoices');
      });
    });
  }

  if (page === 'reports') {
    const exportBtn = document.getElementById('btn-export-csv');
    if (exportBtn) exportBtn.addEventListener('click', () => {
      exportToCSV('transaksi_posas.csv', transactions);
      showToast('Data berhasil diekspor 📂');
    });
  }

  if (page === 'settings') {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    // Bind section links in settings (manually since they are inside the rendered content)
    document.querySelectorAll('.section-link[data-page]').forEach(link => {
      link.addEventListener('click', () => navigateTo(link.dataset.page));
    });
  }

  if (page === 'team') {
    (async () => {
      const team = await fetchTeam();
      const list = document.getElementById('team-list');
      if (!list) return;
      
      list.innerHTML = team.map(m => `
        <div class="card flex items-center justify-between p-16">
          <div class="flex items-center gap-12">
            <div class="avatar-btn" style="width:40px;height:40px"><span class="avatar-text">${m.full_name.charAt(0).toUpperCase()}</span></div>
            <div>
              <div class="fw-600">${m.full_name}</div>
              <div class="text-xs text-muted">${m.role.toUpperCase()}</div>
            </div>
          </div>
          ${m.id !== getCurrentUser().userId ? `
            <button class="icon-btn text-muted"><span class="material-icons-round">edit</span></button>
          ` : '<span class="badge badge-success" style="font-size:10px">ANDA</span>'}
        </div>
      `).join('');
    })();

    const inviteBtn = document.getElementById('btn-invite-staff');
    if (inviteBtn) inviteBtn.addEventListener('click', () => {
      showToast('Fitur kirim undangan staf akan segera hadir! 📧', 'info');
    });
  }

  if (page === 'pricing') {
    const upgradeBtn = document.getElementById('btn-upgrade-pro');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', async () => {
        upgradeBtn.disabled = true;
        upgradeBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Memproses...';
        
        const success = await upgradeToPro();
        if (success) {
          showModal(`
            <div class="text-center p-20">
              <div class="stat-icon green mx-auto mb-20" style="width:64px;height:64px">
                <span class="material-icons-round" style="font-size:32px">diamond</span>
              </div>
              <h2 class="fw-700 mb-8">Selamat! 🎉</h2>
              <p class="text-muted mb-24">Akun Anda sekarang telah diupgrade ke **Paket Pro**. Semua fitur premium telah terbuka!</p>
              <button class="btn btn-primary btn-block" onclick="location.reload()">Mulai Sekarang</button>
            </div>
          `);
        } else {
          showToast('Gagal memproses upgrade. Coba lagi nanti.', 'error');
          upgradeBtn.disabled = false;
          upgradeBtn.innerText = 'Upgrade ke Pro';
        }
      });
    }
  }

  // Initialize charts for Dashboard and Reports
  if (page === 'dashboard' || page === 'reports') {
    setTimeout(() => initCharts(page), 50);
  }
}

// ===== Charts Initialization =====
function initCharts(page) {
  const chartConfig = {
    dashboard: { id: 'salesChartDashboard', type: 'line' },
    reports: { id: 'mainSalesChart', type: 'bar' }
  };

  const config = chartConfig[page];
  if (!config) return;

  const canvas = document.getElementById(config.id);
  if (!canvas) return;

  const weeklyData = getWeeklyRevenue();
  const labels = weeklyData.map(d => d.day);
  const amounts = weeklyData.map(d => d.amount);

  new Chart(canvas, {
    type: config.type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: amounts,
        backgroundColor: page === 'dashboard' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.8)',
        borderColor: '#6366f1',
        borderWidth: 2,
        tension: 0.4,
        fill: page === 'dashboard',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ===== Receipt Modal =====
function showReceiptModal(txn) {
  const user = getCurrentUser() || { storeName: 'POSAS Store' };
  const itemsHtml = txn.cartItems ? txn.cartItems.map(i => `
    <div class="receipt-item">
      <span>${i.name} x${i.qty}</span>
      <span>${formatRupiah(i.price * i.qty)}</span>
    </div>
  `).join('') : txn.items.map(it => `<div class="receipt-item"><span>${it}</span></div>`).join('');

  showModal('Transaksi Berhasil', `
    <div class="receipt">
      <div class="receipt-header">
        <div class="receipt-store">${user.storeName}</div>
        <div class="receipt-info">${txn.date}</div>
        <div class="receipt-info">TRX-${Math.floor(Math.random()*10000)}</div>
      </div>
      <div class="receipt-items">
        ${itemsHtml}
      </div>
      <div class="receipt-total">
        <span>TOTAL</span>
        <span>${formatRupiah(txn.total)}</span>
      </div>
      <div class="receipt-footer">
        <div class="receipt-qr">QR RECEIPT</div>
        <p>Terima kasih atas kunjungan Anda!</p>
        <p>Powered by POSAS</p>
      </div>
    </div>
    <div class="flex gap-12 mt-16">
      <button class="btn btn-secondary flex-1" onclick="closeModal(); navigateTo('pos')">Tutup</button>
      <button class="btn btn-primary flex-1" id="btn-print-receipt">
        <span class="material-icons-round" style="font-size:18px">print</span> Cetak
      </button>
    </div>
  `);
  
  setTimeout(() => {
    const printBtn = document.getElementById('btn-print-receipt');
    if (printBtn) printBtn.addEventListener('click', () => {
      window.print();
    });
  }, 50);
}

// ===== Auth UI =====
function renderLoginPage() {
  return `
  <div class="auth-logo">
    <div class="splash-icon"><span class="material-icons-round">rocket_launch</span></div>
    <h1>POSAS</h1>
    <p>Platform Operasi Serbaguna untuk Semua</p>
  </div>
  <div class="auth-card fade-in">
    <h2>Masuk ke Akun</h2>
    <div class="auth-error" id="auth-error">
      <span class="material-icons-round" style="font-size:16px">error</span>
      <span id="auth-error-text"></span>
    </div>
    <div class="input-group">
      <label class="input-label">Email</label>
      <input class="input" id="auth-email" type="email" placeholder="nama@email.com" />
    </div>
    <div class="input-group">
      <label class="input-label">Password</label>
      <input class="input" id="auth-password" type="password" placeholder="Masukkan password" />
    </div>
    <button class="btn btn-primary btn-block" id="btn-login" style="padding:14px;margin-top:4px">
      <span class="material-icons-round" style="font-size:18px">login</span> Masuk
    </button>
  </div>
  <div class="auth-footer">
    Belum punya akun? <button class="auth-link" id="btn-goto-register">Daftar Gratis</button>
  </div>`;
}

function renderRegisterPage() {
  return `
  <div class="auth-logo">
    <div class="splash-icon"><span class="material-icons-round">rocket_launch</span></div>
    <h1>POSAS</h1>
    <p>Mulai kelola bisnis Anda sekarang</p>
  </div>
  <div class="auth-card fade-in">
    <h2>Buat Akun Baru</h2>
    <div class="auth-error" id="auth-error">
      <span class="material-icons-round" style="font-size:16px">error</span>
      <span id="auth-error-text"></span>
    </div>
    <div class="input-group">
      <label class="input-label">Nama Lengkap *</label>
      <input class="input" id="auth-name" placeholder="Contoh: Roedy Santosa" />
    </div>
    <div class="input-group">
      <label class="input-label">Nama Toko *</label>
      <input class="input" id="auth-store" placeholder="Contoh: Warung Kopi Saya" />
    </div>
    <div class="input-group">
      <label class="input-label">Email *</label>
      <input class="input" id="auth-email" type="email" placeholder="nama@email.com" />
    </div>
    <div class="input-group">
      <label class="input-label">Password *</label>
      <input class="input" id="auth-password" type="password" placeholder="Minimal 6 karakter" />
    </div>
    <button class="btn btn-primary btn-block" id="btn-register" style="padding:14px;margin-top:4px">
      <span class="material-icons-round" style="font-size:18px">person_add</span> Daftar Gratis
    </button>
  </div>
  <div class="auth-footer">
    Sudah punya akun? <button class="auth-link" id="btn-goto-login">Masuk</button>
  </div>`;
}

function showAuthScreen(type) {
  splash.classList.add('hidden');
  shell.classList.add('hidden');
  authScreen.classList.remove('hidden');
  authScreen.innerHTML = type === 'register' ? renderRegisterPage() : renderLoginPage();
  bindAuthEvents(type);
}

function bindAuthEvents(type) {
  if (type === 'login') {
    $('btn-login').addEventListener('click', async () => {
      const email = $('auth-email').value.trim();
      const password = $('auth-password').value;
      if (!email || !password) return showAuthError('Email dan password wajib diisi.');
      
      $('btn-login').disabled = true;
      $('btn-login').innerHTML = '<span class="material-icons-round spin" style="font-size:18px">sync</span> Memproses...';
      
      const result = await login({ email, password });
      
      if (!result.ok) {
        $('btn-login').disabled = false;
        $('btn-login').innerHTML = '<span class="material-icons-round" style="font-size:18px">login</span> Masuk';
        return showAuthError(result.error);
      }
      enterApp(result.user);
    });
    $('btn-goto-register').addEventListener('click', () => showAuthScreen('register'));
    // Enter key
    $('auth-password').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-login').click(); });
  } else {
    $('btn-register').addEventListener('click', async () => {
      const name = $('auth-name').value.trim();
      const storeName = $('auth-store').value.trim();
      const email = $('auth-email').value.trim();
      const password = $('auth-password').value;
      
      if (!name || !storeName || !email || !password) return showAuthError('Semua field wajib diisi.');
      if (password.length < 6) return showAuthError('Password minimal 6 karakter.');
      
      $('btn-register').disabled = true;
      $('btn-register').innerHTML = '<span class="material-icons-round spin" style="font-size:18px">sync</span> Mendaftar...';
      
      const result = await register({ name, email, password, storeName });
      
      if (!result.ok) {
        $('btn-register').disabled = false;
        $('btn-register').innerHTML = '<span class="material-icons-round" style="font-size:18px">person_add</span> Daftar Gratis';
        return showAuthError(result.error);
      }
      enterApp(result.user);
    });
    $('btn-goto-login').addEventListener('click', () => showAuthScreen('login'));
    $('auth-password').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-register').click(); });
  }
}

function showAuthError(msg) {
  const el = $('auth-error');
  const txt = $('auth-error-text');
  if (el && txt) { txt.textContent = msg; el.classList.add('show'); }
}

function enterApp(user) {
  authScreen.classList.add('hidden');
  shell.classList.remove('hidden');
  
  // Update UI with user info
  if (user) {
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.querySelectorAll('.avatar-text').forEach(el => el.textContent = initials);
    const tenantEl = $('tenant-name');
    if (tenantEl) tenantEl.textContent = user.storeName || 'Toko Saya';
    
    // Update drawer info
    const drawerName = document.querySelector('.drawer-user-name');
    const drawerRole = document.querySelector('.drawer-user-role');
    if (drawerName) drawerName.textContent = user.name;
    if (drawerRole) {
      const roleMap = { 'owner': 'Pemilik Toko', 'kasir': 'Kasir', 'manajer': 'Manajer' };
      drawerRole.textContent = roleMap[user.role.toLowerCase()] || user.role;
    }

    // RBAC: Hide restricted nav items
    document.querySelectorAll('.nav-item, .drawer-item').forEach(el => {
      const page = el.dataset.page;
      if (page && page !== 'dashboard' && !canAccess(page)) {
        el.style.display = 'none';
      } else {
        el.style.display = 'flex';
      }
    });
  }
  navigateTo('dashboard');
}

async function handleLogout() {
  await logout();
  showAuthScreen('login');
}

// ===== Init =====
import { syncCloudData } from './data.js';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
  });
}

async function init() {
  const session = getSession();

  if (!session) {
    // No session → show login (skip splash)
    splash.classList.add('hidden');
    showAuthScreen('login');
  } else {
    // Has session → sync data then enter app
    try {
      await syncCloudData();
    } catch (e) {
      console.warn('Initial sync failed, using cache');
    }
    
    splash.classList.add('hidden');
    enterApp(session);
  }

  // Bottom nav
  bottomNav.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Drawer items
  drawer.querySelectorAll('.drawer-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Menu toggle
  $('btn-menu').addEventListener('click', openDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  // Modal close
  modalOverlay.addEventListener('click', closeModal);

  // Notifications
  $('btn-notifications').addEventListener('click', () => showToast('Tidak ada notifikasi baru'));

  // Profile
  $('btn-profile').addEventListener('click', () => navigateTo('settings'));
}

document.addEventListener('DOMContentLoaded', init);
