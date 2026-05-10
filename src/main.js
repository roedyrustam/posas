// ========== POSAS Main App ==========
import './style.css';
import { products, cart, formatRupiah, addProduct, addCustomer, addTransaction, decreaseStock } from './data.js';
import {
  renderDashboard, renderPOS, renderProducts,
  renderCustomers, renderFinance, renderBooking,
  renderInvoices, renderReports, renderSettings
} from './pages.js';

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

// ===== Navigation =====
function navigateTo(page) {
  if (!pages[page]) return;
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
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      // Persist transaction
      const itemLabels = cart.items.map(i => i.qty > 1 ? `${i.name} x${i.qty}` : i.name);
      addTransaction({
        items: itemLabels,
        total: cart.total,
        customer: 'Walk-in',
        method: selectedMethod,
      });
      // Decrease stock
      decreaseStock(cart.items);
      cart.clear();
      closeModal();
      showToast('Pembayaran berhasil! 🎉');
      navigateTo('pos');
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
        if (saveBtn) saveBtn.addEventListener('click', () => {
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
          if (Number(price) <= 0) {
            errEl.textContent = 'Harga harus lebih dari 0.';
            errEl.style.display = 'block';
            return;
          }

          addProduct({ name, price, stock, category, emoji });
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
        if (saveBtn) saveBtn.addEventListener('click', () => {
          const name = document.getElementById('inp-customer-name').value.trim();
          const phone = document.getElementById('inp-customer-phone').value.trim();
          const email = document.getElementById('inp-customer-email').value.trim();
          const errEl = document.getElementById('customer-form-error');

          if (!name || !phone) {
            errEl.textContent = 'Nama dan No. Telepon wajib diisi.';
            errEl.style.display = 'block';
            return;
          }

          addCustomer({ name, phone, email });
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
}

// ===== Init =====
function init() {
  // Splash → App transition
  setTimeout(() => {
    splash.classList.add('hidden');
    shell.classList.remove('hidden');
    navigateTo('dashboard');
  }, 2200);

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
