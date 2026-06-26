// ========== POSAS Main App ==========
import './style.css';
import Chart from 'chart.js/auto';
import * as htmlToImage from 'html-to-image';
import { createPaymentInvoice, checkPaymentStatus } from './payment.js';
import { products, customers, cart, formatRupiah, addProduct, addCustomer, addTransaction, decreaseStock, addInvoice, updateInvoiceStatus, addBooking, updateBookingStatus, deleteProduct, deleteCustomer, register, login, logout, getSession, getCurrentUser, exportToCSV, transactions, canAccess, fetchTeam, addStaff, removeStaff, redeemPoints, upgradeToPro, bulkAddProducts, branding, updateBranding, logs, addLog, getNotifications, dismissNotification, getCustomerTier, outlets, activeOutlet, setActiveOutlet, addOutlet, updateOutlet, deleteOutlet, toggleTenantPlan, fetchWorkspaces, createWorkspace, switchWorkspace, deleteWorkspaceAccount, deleteUserAccount, syncOfflineTransactions } from './data.js';
import {
  renderDashboard, renderPOS, renderProducts,
  renderCustomers, renderFinance, renderBooking,
  renderInvoices, renderReports, renderSettings, renderTeam, renderPricing,
  renderAppearance, renderStoreProfile, renderReceiptSettings, renderLogs, renderInvoiceDetail,
  renderManageOutlets, renderAdminPortal
} from './pages.js';
import { getWeeklyRevenue } from './data.js';
import { checkRateLimit, incrementUsage } from './data.js';

let selectedPOSCustomer = null;

function showUpgradeModal(reason) {
  showModal(`
    <div class="text-center p-16">
      <span class="material-icons-round text-warning mb-12" style="font-size:48px">workspace_premium</span>
      <h3 class="fw-800 mb-8">Upgrade ke Pro</h3>
      <p class="text-sm text-muted mb-24">${reason || 'Fitur ini eksklusif untuk pengguna Pro.'}</p>
      
      <div class="card p-16 mb-24" style="background:#f8fafc">
        <div class="fw-700 mb-8">Pindai QRIS untuk Bayar</div>
        <!-- Simulasi QR Code -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=POSAS_UPGRADE_PRO" alt="QRIS" style="width:200px; height:200px; margin:0 auto; border-radius:12px; border:2px solid var(--border)">
        <div class="text-xs text-muted mt-8">Invoice: INV-${Date.now()}</div>
      </div>

      <button class="btn btn-primary btn-block mb-12" id="btn-confirm-payment">
        <span class="material-icons-round" style="font-size:18px">check_circle</span>
        Saya Sudah Bayar
      </button>
      <button class="btn btn-secondary btn-block" onclick="closeModal()">Nanti Saja</button>
    </div>
  `);

  setTimeout(() => {
    const confirmBtn = document.getElementById('btn-confirm-payment');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Memverifikasi...';
        
        // Simulasi proses verifikasi ke Payment Gateway (2 detik)
        setTimeout(async () => {
          await upgradeToPro();
          closeModal();
          showToast('Selamat! Akun Anda telah menjadi Pro 🚀', 'success');
          // Reload page to apply changes
          setTimeout(() => window.location.reload(), 1500);
        }, 2000);
      });
    }
  }, 100);
}

function showCustomerDetailModal(customer) {
  const user = getCurrentUser() || { plan: 'free' };
  const isPro = user.plan === 'pro';
  const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const tier = getCustomerTier(customer.points || 0);

  showModal(`
    <div class="p-4">
      <div class="flex items-center gap-16 mb-24">
        <div class="avatar-btn" style="width:64px;height:64px;font-size:24px;background:${hashColor(customer.name)}">
          <span class="avatar-text" style="color:white">${initials}</span>
        </div>
        <div>
          <h2 class="fw-700" style="font-size:20px">${customer.name}</h2>
          <p class="text-muted text-sm">${customer.phone}</p>
          <span class="badge ${tier.badge} mt-4"><span class="material-icons-round" style="font-size:12px;margin-right:2px">${tier.icon}</span>${tier.name}</span>
        </div>
      </div>

      <div class="grid-2 mb-24">
        <div class="card p-12 text-center">
          <div class="text-muted text-xs uppercase mb-4">Total Belanja</div>
          <div class="fw-700">${formatRupiah(customer.totalSpent)}</div>
        </div>
        <div class="card p-12 text-center">
          <div class="text-muted text-xs uppercase mb-4">Poin Loyalitas</div>
          <div class="fw-700 flex items-center justify-center gap-4" style="color:${tier.color}">
            <span class="material-icons-round" style="font-size:18px">${tier.icon}</span>
            ${customer.points || 0}
          </div>
        </div>
      </div>

      <div class="section mb-24">
        <div class="section-header">
          <span class="section-title">Catatan Pelanggan</span>
          ${isPro ? '' : '<span class="badge badge-warning">PRO</span>'}
        </div>
        <div class="input-group">
          <textarea class="input" id="inp-cust-notes" rows="3" placeholder="Tambahkan catatan tentang preferensi pelanggan..." ${isPro ? '' : 'disabled'}>${customer.notes || ''}</textarea>
          ${!isPro ? '<p class="text-xs text-muted mt-8">Upgrade ke Pro untuk menyimpan catatan pelanggan.</p>' : ''}
        </div>
      </div>

      ${isPro ? `
      <button class="btn btn-primary btn-block" id="btn-update-notes">
        Simpan Catatan
      </button>` : `
      <button class="btn btn-primary btn-block" onclick="closeModal(); navigateTo('pricing')">
        Upgrade Sekarang
      </button>`}
    </div>
  `);

  if (isPro) {
    setTimeout(() => {
      document.getElementById('btn-update-notes').addEventListener('click', async () => {
        const notes = document.getElementById('inp-cust-notes').value.trim();
        customer.notes = notes;
        // In a real app, we'd call an updateCustomer function
        saveJSON(KEYS.customers, customers); 
        showToast('Catatan pelanggan berhasil disimpan ✅');
        closeModal();
        navigateTo('customers');
      });
    }, 50);
  }
}

// Page registry
const pages = {
  dashboard:  { title: 'Dashboard', render: renderDashboard },
  pos:        { title: 'Kasir',     render: renderPOS },
  products:   { title: 'Produk',    render: renderProducts },
  customers:  { title: 'Pelanggan', render: renderCustomers },
  finance:    { title: 'Keuangan',  render: renderFinance },
  booking:    { title: 'Booking',   render: renderBooking },
  invoices:   { title: 'Invoice',   render: renderInvoices },
  reports:    { title: 'Laporan',   render: renderReports, pro: true },
  logs:       { title: 'Aktivitas', render: renderLogs, pro: true },
  settings:   { title: 'Pengaturan', render: renderSettings },
  team:       { title: 'Manajemen Tim', render: renderTeam },
  pricing:    { title: 'POSAS Pro', render: renderPricing },
  appearance: { title: 'Tampilan', render: renderAppearance, pro: true },
  storeProfile: { title: 'Profil Toko', render: renderStoreProfile },
  receiptSettings: { title: 'Struk & Nota', render: renderReceiptSettings },
  manage_outlets: { title: 'Kelola Cabang', render: renderManageOutlets },
  admin_portal: { title: 'Portal Platform Admin', render: renderAdminPortal },
  // SaaS Billing and Team UI Settings mapping (resolves /settings/billing, BillingSettings, /settings/team, TeamSettings)
  'settings/billing': { title: 'Billing & Langganan', render: () => renderSettings('billing'), pro: true },
  'settings/team': { title: 'Pengaturan Tim', render: () => renderSettings('team'), pro: true }
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

// ===== Branding & Theme =====
function applyBranding() {
  if (!branding) return;
  
  // Apply accent color to CSS variables
  document.documentElement.style.setProperty('--accent', branding.accent);
  
  // Apply theme class (HIG Harmony & Consistency)
  const theme = branding.theme || 'dark';
  document.documentElement.classList.toggle('dark-theme', theme === 'dark');
  
  // Update theme-color meta tag
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
  }

  // Update store name in header and drawer if needed
  const outlet = outlets.find(o => o.id === activeOutlet);
  const displayName = branding.storeName + (outlet ? ` - ${outlet.name}` : '');
  
  const tenantName = $('tenant-name');
  if (tenantName) tenantName.textContent = displayName;
  
  const drawerStore = document.querySelector('.drawer-brand-name');
  if (drawerStore) drawerStore.textContent = displayName;
  
  const drawerLogo = document.querySelector('.drawer-logo');
  if (drawerLogo && branding.storeEmoji) {
    drawerLogo.innerHTML = `<span style="font-size:24px">${branding.storeEmoji}</span>`;
  }

  // Show/Hide Super Admin drawer button dynamically
  const user = getCurrentUser();
  const drawerAdmin = $('drawer-admin-portal');
  if (drawerAdmin) {
    const isPlatformAdmin = user && (user.role === 'superadmin' || user.email === 'admin@posas.com' || user.email === 'admin@posas.id');
    drawerAdmin.classList.toggle('hidden', !isPlatformAdmin);
  }
}

// ===== Navigation =====
function navigateTo(page) {
  if (!pages[page]) return;
  
  const user = getCurrentUser();
  
  // Rate limiting check to protect endpoints (limiter)
  const limitCheck = checkRateLimit(user ? user.userId : 'anonymous', 60, 60000);
  if (!limitCheck.allowed) {
    showToast(`Terlalu banyak permintaan. Silakan tunggu ${limitCheck.retryAfter} detik.`, 'error');
    return;
  }

  const proFeatures = ['reports', 'manage_staff', 'delete_data', 'appearance', 'storeProfile', 'receiptSettings'];
  
  if (!canAccess(page)) {
    if (proFeatures.includes(page) && user && user.plan !== 'pro') {
      showUpgradeModal(pages[page].title);
    } else {
      showToast('Akses ditolak: Anda tidak memiliki izin untuk halaman ini ✋', 'error');
    }
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

// ===== Notifications =====
function renderNotificationDropdown() {
  const notifs = getNotifications();
  const list = $('notification-list');
  const badge = $('notification-badge');
  
  if (notifs.length > 0) {
    badge.style.display = 'block';
    list.innerHTML = notifs.map(n => `
      <div class="p-12 flex items-start gap-12" style="border-bottom:1px solid var(--border)">
        <div class="stat-icon" style="background:var(--bg-elevated);color:var(--${n.type});width:32px;height:32px;padding:0">
          <span class="material-icons-round" style="font-size:16px">${n.icon}</span>
        </div>
        <div class="flex-1">
          <div class="text-sm fw-600">${n.title}</div>
          <div class="text-xs text-muted mb-4">${n.message}</div>
        </div>
        ${!n.id.startsWith('sys-') ? `
        <button class="icon-btn btn-dismiss-notif" data-id="${n.id}" style="width:24px;height:24px" aria-label="Hapus">
          <span class="material-icons-round text-muted" style="font-size:14px">close</span>
        </button>` : ''}
      </div>
    `).join('');
  } else {
    badge.style.display = 'none';
    list.innerHTML = `
      <div class="p-24 text-center opacity-50">
        <span class="material-icons-round mb-8" style="font-size:32px">notifications_none</span>
        <div class="text-sm">Belum ada notifikasi</div>
      </div>
    `;
  }

  // Dismiss events
  list.querySelectorAll('.btn-dismiss-notif').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissNotification(btn.dataset.id);
      renderNotificationDropdown();
    });
  });
}

function initNotifications() {
  const btn = $('btn-notifications');
  const dropdown = $('notification-dropdown');
  const readAll = $('btn-read-all-notif');

  if (btn && dropdown) {
    btn.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
      if (!dropdown.classList.contains('hidden')) {
        renderNotificationDropdown();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  if (readAll) {
    readAll.addEventListener('click', () => {
      // In a real app, clear all non-sys notifications
      getNotifications().forEach(n => {
        if (!n.id.startsWith('sys-')) dismissNotification(n.id);
      });
      renderNotificationDropdown();
    });
  }

  renderNotificationDropdown();
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
      <span class="fw-700" style="font-size:20px;color:var(--accent-light)" id="checkout-total-val">${formatRupiah(cart.total)}</span>
    </div>

    ${selectedPOSCustomer ? `
    <div class="card p-12 mt-16" style="background:rgba(99,102,241,0.05); border-radius:12px">
      <div class="flex justify-between items-center mb-8">
        <span class="text-xs text-muted">Loyalty Poin: <strong>${selectedPOSCustomer.points || 0}</strong></span>
        ${(selectedPOSCustomer.points || 0) >= 100 ? `
          <button class="btn btn-xs btn-outline" id="btn-redeem-points">Tukar 100 Poin</button>
        ` : '<span class="text-xs opacity-50">Min. 100 poin</span>'}
      </div>
      <div id="redemption-status" class="text-xs text-success hidden">✅ Diskon Rp 10.000 diterapkan</div>
    </div>` : ''}
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
  let selectedMethod = 'qris';
  setTimeout(() => {
    document.querySelectorAll('.pay-method').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active', 'btn-primary'));
        btn.classList.add('active', 'btn-primary');
        selectedMethod = btn.dataset.method;
      });
    });

    const confirmBtn = document.getElementById('btn-confirm-pay');
    if (confirmBtn) confirmBtn.addEventListener('click', async () => {
      if (selectedMethod === 'qris') {
        await handleQRISPayment(finalTotal);
      } else {
        await completeTransaction('Cash', finalTotal);
      }
    });

    // Redemption logic
    let finalTotal = cart.total;
    const redeemBtn = document.getElementById('btn-redeem-points');
    if (redeemBtn) redeemBtn.addEventListener('click', async () => {
      if (!canAccess('loyalty')) return showUpgradeModal('Loyalty Points');
      
      const res = await redeemPoints(selectedPOSCustomer.id, 100);
      if (res.success) {
        finalTotal -= res.discount;
        document.getElementById('checkout-total-val').textContent = formatRupiah(finalTotal);
        document.getElementById('redemption-status').classList.remove('hidden');
        redeemBtn.remove();
        showToast('Poin berhasil ditukarkan! 🎁');
      }
    });
  }, 100);
}

async function handleQRISPayment(amount) {
  const externalId = 'posas-' + Date.now();
  showModal(`
    <div class="text-center p-20">
      <span class="material-icons-round spin mb-16" style="font-size:48px;color:var(--accent)">sync</span>
      <h3>Menyiapkan QRIS...</h3>
      <p class="text-muted">Menghubungkan ke payment gateway</p>
    </div>
  `);

  const invoice = await createPaymentInvoice({
    external_id: externalId,
    amount: amount,
    description: `Pembayaran di POSAS Store (${externalId})`
  });

  showModal(`
    <div class="text-center p-20">
      <div class="mb-16" style="background:white;padding:16px;border-radius:12px;display:inline-block">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(invoice.available_qr_codes[0].barcode_data)}" width="200" height="200" />
      </div>
      <h3 class="mb-4">${formatRupiah(amount)}</h3>
      <p class="text-muted text-sm mb-20">Silakan scan QRIS di atas menggunakan aplikasi m-Banking atau E-Wallet Anda.</p>
      
      <div class="card p-12 mb-20 text-left" style="background:var(--bg-elevated);border-left:4px solid var(--warning)">
        <div class="text-xs text-muted">ID TRANSAKSI</div>
        <div class="fw-700">${externalId}</div>
      </div>

      <button class="btn btn-primary btn-block mb-12" id="btn-check-payment">
        <span class="material-icons-round" style="font-size:18px">check_circle</span> Saya Sudah Bayar
      </button>
      <button class="btn btn-ghost btn-block" onclick="closeModal()">Batalkan</button>
    </div>
  `);

  document.getElementById('btn-check-payment').addEventListener('click', async () => {
    const btn = document.getElementById('btn-check-payment');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-icons-round spin">sync</span> Mengecek...';

    const status = await checkPaymentStatus(invoice.id);
    if (status === 'PAID') {
      showToast('✅ Pembayaran Berhasil Diterima!');
      await completeTransaction('QRIS');
    } else {
      showToast('❌ Pembayaran belum terdeteksi. Silakan coba lagi.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<span class="material-icons-round" style="font-size:18px">check_circle</span> Saya Sudah Bayar';
    }
  });
}

async function completeTransaction(paymentMethod, overriddenTotal) {
  const itemLabels = cart.items.map(i => i.qty > 1 ? `${i.name} x${i.qty}` : i.name);
  const total = overriddenTotal || cart.total;
  const txn = await addTransaction({
    items: itemLabels,
    total: total,
    customer: selectedPOSCustomer ? selectedPOSCustomer.name : 'Walk-in',
    paymentMethod,
    cartItems: [...cart.items]
  });

  // Add points to customer (1 point per 1000)
  if (selectedPOSCustomer) {
    const earnedPoints = Math.floor(total / 1000);
    selectedPOSCustomer.points = (selectedPOSCustomer.points || 0) + earnedPoints;
    // update data.js state too (this is a bit hacky, but works for demo)
    const cIdx = customers.findIndex(c => c.id === selectedPOSCustomer.id);
    if (cIdx > -1) customers[cIdx].points = selectedPOSCustomer.points;
  }

  // Decrease stock
  for (const item of cart.items) {
    await decreaseStock(item.id, item.qty);
  }

  cart.clear(); // Clear cart
  selectedPOSCustomer = null; // Reset customer
  closeModal();
  showReceiptModal(txn);
  addLog('Transaksi Baru', `Penjualan senilai ${formatRupiah(total)} kepada ${txn.customer}`);
}

// ===== Page-specific event binding =====
function bindPageEvents(page) {
  
  if (page === 'admin_portal') {
    const btnBack = document.getElementById('btn-back-to-app');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        navigateTo('dashboard');
      });
    }

    document.querySelectorAll('.btn-toggle-tenant-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const res = toggleTenantPlan(id);
        if (res.success) {
          showToast(`Paket tenant berhasil diubah ke ${res.plan.toUpperCase()}! 👑`);
          navigateTo('admin_portal'); // Re-render to refresh statistics and buttons
        } else {
          showToast(res.error || 'Gagal mengubah paket tenant.', 'error');
        }
      });
    });
  }

  if (page === 'pricing') {
    const btnUpgrade = document.getElementById('btn-upgrade-pro');
    if (btnUpgrade) {
      btnUpgrade.addEventListener('click', () => {
        showUpgradeModal('Paket Pro - Rp 99.000/bulan');
      });
    }
  }

  if (page === 'settings') {
    const selOutlet = document.getElementById('sel-active-outlet');
    if (selOutlet) {
      selOutlet.addEventListener('change', (e) => {
        const id = e.target.value;
        setActiveOutlet(id);
        cart.clear(); // Clear checkout cart when switching outlet
        showToast('Cabang aktif diubah (Keranjang direset)');
        applyBranding(); // Updates header text
      });
    }

    const btnManage = document.getElementById('btn-go-manage-outlets');
    if (btnManage) {
      btnManage.addEventListener('click', () => navigateTo('manage_outlets'));
    }

    const btnManageLocked = document.getElementById('btn-go-manage-outlets-locked');
    if (btnManageLocked) {
      btnManageLocked.addEventListener('click', () => showUpgradeModal('Kelola Semua Cabang'));
    }

    // --- WORKSPACE & PDP COMPLIANCE BINDINGS ---
    const selWorkspace = document.getElementById('sel-active-workspace');
    if (selWorkspace) {
      fetchWorkspaces().then(list => {
        const currentUser = getSession();
        selWorkspace.innerHTML = list.map(w => `
          <option value="${w.id}" ${currentUser.tenantId === w.id ? 'selected' : ''}>
            ${w.name} (${w.role.toUpperCase()})
          </option>
        `).join('');
      });

      selWorkspace.addEventListener('change', async (e) => {
        const id = e.target.value;
        const res = await switchWorkspace(id);
        if (res.success) {
          showToast(`Workspace berhasil diubah ke ${res.user.storeName}! 🏪`);
          navigateTo('settings');
          applyBranding();
        } else {
          showToast(res.error || 'Gagal mengubah workspace.', 'error');
        }
      });
    }

    const btnCreateWS = document.getElementById('btn-create-workspace');
    if (btnCreateWS) {
      btnCreateWS.addEventListener('click', () => {
        showModal(`
          <div class="modal-title">Workspace / Toko Baru</div>
          <div class="input-group">
            <label class="input-label">Nama Toko *</label>
            <input class="input" id="inp-ws-name" placeholder="Contoh: Toko Cabang Dua" />
          </div>
          <div class="input-group">
            <label class="input-label">Slug URL (Unik) *</label>
            <input class="input" id="inp-ws-slug" placeholder="Contoh: toko-cabang-dua" />
          </div>
          <div class="flex gap-12 mt-24">
            <button class="btn btn-ghost flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary flex-1" id="btn-confirm-create-ws">Buat Workspace</button>
          </div>
        `);

        document.getElementById('btn-confirm-create-ws').addEventListener('click', async () => {
          const name = document.getElementById('inp-ws-name').value.trim();
          const slug = document.getElementById('inp-ws-slug').value.trim();

          if (!name || !slug) return showToast('Harap isi semua field wajib', 'error');

          const res = await createWorkspace({ name, slug });
          if (res.success) {
            showToast('Workspace baru berhasil dibuat! 🎉');
            closeModal();
            await switchWorkspace(res.workspace.id);
            navigateTo('settings');
            applyBranding();
          } else {
            showToast(res.error || 'Gagal membuat workspace.', 'error');
          }
        });
      });
    }

    const btnDeleteWS = document.getElementById('btn-delete-workspace');
    if (btnDeleteWS) {
      btnDeleteWS.addEventListener('click', async () => {
        const currentUser = getSession();
        const confirm = window.confirm(`Hapus workspace "${currentUser.storeName}"?\nTindakan ini permanen dan akan menghapus seluruh data produk, transaksi, dan data lainnya di toko ini!`);
        if (confirm) {
          const doubleConfirm = window.confirm(`Apakah Anda benar-benar yakin ingin menghapus workspace "${currentUser.storeName}"? Ketik "HAPUS" untuk konfirmasi.`);
          const text = window.prompt(`Masukkan tulisan "HAPUS" untuk mengonfirmasi penghapusan workspace.`);
          if (text === 'HAPUS') {
            const res = await deleteWorkspaceAccount(currentUser.tenantId);
            if (res.success) {
              showToast('Workspace berhasil dihapus 🗑️');
              const list = await fetchWorkspaces();
              if (list.length > 0) {
                await switchWorkspace(list[0].id);
                navigateTo('settings');
              } else {
                await logout();
                window.location.reload();
              }
            } else {
              showToast(res.error || 'Gagal menghapus workspace.', 'error');
            }
          } else {
            showToast('Penghapusan dibatalkan.', 'info');
          }
        }
      });
    }

    const btnDeleteUser = document.getElementById('btn-delete-user-account');
    if (btnDeleteUser) {
      btnDeleteUser.addEventListener('click', async () => {
        const confirm = window.confirm('UU PDP: Hapus Akun & Data Permanen?\nTindakan ini akan menghapus akun Anda beserta SELURUH workspace yang Anda miliki secara cascade dari database kami. Tindakan ini tidak dapat dibatalkan.');
        if (confirm) {
          const text = window.prompt('Ketik "HAPUS AKUN SAYA" untuk mengonfirmasi penghapusan akun Anda secara permanen.');
          if (text === 'HAPUS AKUN SAYA') {
            const res = await deleteUserAccount();
            if (res.success) {
              showToast('Akun Anda berhasil dihapus secara permanen. Terima kasih.');
              setTimeout(() => window.location.reload(), 2000);
            } else {
              showToast(res.error || 'Gagal menghapus akun.', 'error');
            }
          } else {
            showToast('Penghapusan akun dibatalkan.', 'info');
          }
        }
      });
    }
  }

  if (page === 'manage_outlets') {
    const user = getCurrentUser() || { plan: 'free' };
    const isPro = user.plan === 'pro';

    const btnAdd = document.getElementById('btn-add-outlet');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        if (!isPro) {
          showUpgradeModal('Tambah Cabang Baru');
          return;
        }
        showModal(`
          <div class="modal-title">Tambah Cabang Baru</div>
          <div class="input-group">
            <label class="input-label">Nama Cabang *</label>
            <input class="input" id="inp-outlet-name" placeholder="Contoh: Cabang Barat" />
          </div>
          <div class="input-group">
            <label class="input-label">Alamat</label>
            <input class="input" id="inp-outlet-address" placeholder="Contoh: Jl. Diponegoro No. 12" />
          </div>
          <div class="input-group">
            <label class="input-label">Telepon</label>
            <input class="input" id="inp-outlet-phone" placeholder="Contoh: 0812345678" />
          </div>
          <button class="btn btn-primary btn-block mt-16" id="btn-save-new-outlet">Simpan Cabang</button>
        `);

        setTimeout(() => {
          document.getElementById('btn-save-new-outlet').addEventListener('click', async () => {
            const name = document.getElementById('inp-outlet-name').value.trim();
            const address = document.getElementById('inp-outlet-address').value.trim();
            const phone = document.getElementById('inp-outlet-phone').value.trim();

            if (!name) {
              showToast('⚠ Nama cabang wajib diisi');
              return;
            }

            const res = await addOutlet({ name, address, phone });
            if (res.error) {
              showToast('⚠ Gagal menambah cabang: ' + res.error);
            } else {
              showToast('🏢 Cabang baru berhasil ditambahkan');
              closeModal();
              navigateTo('manage_outlets');
            }
          });
        }, 50);
      });
    }

    document.querySelectorAll('.btn-edit-outlet').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isPro) {
          showUpgradeModal('Ubah Detail Cabang');
          return;
        }
        const id = btn.dataset.id;
        const outlet = outlets.find(o => o.id === id);
        if (!outlet) return;

        showModal(`
          <div class="modal-title">Ubah Detail Cabang</div>
          <div class="input-group">
            <label class="input-label">Nama Cabang *</label>
            <input class="input" id="inp-outlet-name" value="${outlet.name}" placeholder="Contoh: Cabang Barat" />
          </div>
          <div class="input-group">
            <label class="input-label">Alamat</label>
            <input class="input" id="inp-outlet-address" value="${outlet.address || ''}" placeholder="Contoh: Jl. Diponegoro No. 12" />
          </div>
          <div class="input-group">
            <label class="input-label">Telepon</label>
            <input class="input" id="inp-outlet-phone" value="${outlet.phone || ''}" placeholder="Contoh: 0812345678" />
          </div>
          <button class="btn btn-primary btn-block mt-16" id="btn-save-edit-outlet">Simpan Perubahan</button>
        `);

        setTimeout(() => {
          document.getElementById('btn-save-edit-outlet').addEventListener('click', async () => {
            const name = document.getElementById('inp-outlet-name').value.trim();
            const address = document.getElementById('inp-outlet-address').value.trim();
            const phone = document.getElementById('inp-outlet-phone').value.trim();

            if (!name) {
              showToast('⚠ Nama cabang wajib diisi');
              return;
            }

            const res = await updateOutlet(id, { name, address, phone });
            if (res.error) {
              showToast('⚠ Gagal mengubah cabang: ' + res.error);
            } else {
              showToast('🏢 Detail cabang berhasil diperbarui');
              closeModal();
              navigateTo('manage_outlets');
            }
          });
        }, 50);
      });
    });

    document.querySelectorAll('.btn-delete-outlet').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isPro) {
          showUpgradeModal('Hapus Cabang');
          return;
        }
        const id = btn.dataset.id;
        const outlet = outlets.find(o => o.id === id);
        if (!outlet) return;

        showModal(`
          <div class="modal-title text-center" style="color:var(--danger)">Hapus Cabang?</div>
          <p class="text-sm text-muted text-center mb-24">Apakah Anda yakin ingin menghapus cabang <b>${outlet.name}</b>? Tindakan ini tidak dapat dibatalkan.</p>
          <div class="flex gap-12">
            <button class="btn btn-secondary flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary flex-1" id="btn-confirm-delete-outlet" style="background:var(--danger)">Hapus</button>
          </div>
        `);

        setTimeout(() => {
          document.getElementById('btn-confirm-delete-outlet').addEventListener('click', async () => {
            const res = await deleteOutlet(id);
            if (res.error) {
              showToast('⚠ Gagal menghapus cabang: ' + res.error);
            } else {
              showToast('🏢 Cabang berhasil dihapus');
              closeModal();
              navigateTo('manage_outlets');
            }
          });
        }, 50);
      });
    });
  }

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

    // Customer Selector
    const customerSelectBtn = document.getElementById('pos-select-customer');
    if (customerSelectBtn) customerSelectBtn.addEventListener('click', () => {
      const customerListHtml = customers.map(c => `
        <div class="list-item pos-cust-item" data-id="${c.id}" style="cursor:pointer">
          <div class="list-avatar" style="background:${hashColor(c.name)};color:#fff">${getInitials(c.name)}</div>
          <div class="list-content">
            <div class="list-title">${c.name}</div>
            <div class="list-subtitle">${c.phone} · ${c.points || 0} pts</div>
          </div>
          ${selectedPOSCustomer && selectedPOSCustomer.id === c.id ? '<span class="material-icons-round text-accent">check_circle</span>' : ''}
        </div>
      `).join('');

      showModal(`
        <div class="p-16">
          <h3 class="fw-700 mb-16">Pilih Pelanggan</h3>
          <div class="card mb-12 p-12 pos-cust-item" data-id="walkin" style="cursor:pointer; border-color:var(--accent)">
            <div class="flex items-center gap-12">
              <span class="material-icons-round text-muted">person_off</span>
              <div class="fw-600">Walk-in Customer</div>
            </div>
          </div>
          <div class="grid-1 gap-4" style="max-height:300px; overflow-y:auto">
            ${customerListHtml}
          </div>
        </div>
      `);

      document.querySelectorAll('.pos-cust-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          if (id === 'walkin') {
            selectedPOSCustomer = null;
            document.getElementById('pos-customer-name').textContent = 'Walk-in Customer';
          } else {
            selectedPOSCustomer = customers.find(c => c.id === id);
            document.getElementById('pos-customer-name').textContent = selectedPOSCustomer.name;
          }
          closeModal();
          showToast('Pelanggan terpilih');
        });
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

          const res = await addProduct({ name, price, stock, category, emoji });
          if (res && res.error === 'LIMIT_REACHED') {
            closeModal();
            showUpgradeModal('Batas Maksimal Produk (50)');
            return;
          }
          
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

    document.querySelectorAll('.customer-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const customer = customers.find(c => c.id === id);
        if (customer) showCustomerDetailModal(customer);
      });
    });
  }

  // Section links - navigate
  document.querySelectorAll('.section-link[data-page]').forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.page));
  });

  if (page === 'reports') {
    const exportBtn = document.getElementById('btn-export-sales');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const csv = generateSalesCSV();
        downloadCSV(csv, `sales-report-${new Date().toISOString().slice(0,10)}.csv`);
        showToast('Laporan penjualan berhasil diekspor 📂');
      });
    }
  }

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

  // === Product events ===
  if (page === 'products') {
    const importBtn = document.getElementById('btn-import-products');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = async (event) => {
            const content = event.target.result;
            const lines = content.split('\n').map(l => l.trim()).filter(l => l);
            if (lines.length < 2) {
              showToast('File CSV kosong atau tidak valid.', 'error');
              return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const items = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
              const obj = {};
              headers.forEach((h, i) => { obj[h] = values[i]; });
              return obj;
            });

            if (!headers.includes('name') || !headers.includes('price')) {
              showToast('CSV harus memiliki kolom "name" dan "price".', 'error');
              return;
            }

            showModal(`
              <div class="text-center p-20">
                <span class="material-icons-round spin mb-16" style="font-size:48px;color:var(--accent)">sync</span>
                <h3>Mengimpor ${items.length} produk...</h3>
                <p class="text-muted">Jangan tutup halaman ini.</p>
              </div>
            `);

            const result = await bulkAddProducts(items);
            if (result.success) {
              showModal(`
                <div class="text-center p-20">
                  <span class="material-icons-round text-success mb-16" style="font-size:48px">check_circle</span>
                  <h3>Berhasil! 🎉</h3>
                  <p class="text-muted">${result.count} produk telah ditambahkan.</p>
                  <button class="btn btn-primary btn-block mt-20" onclick="location.reload()">Selesai</button>
                </div>
              `);
            } else {
              showToast('Gagal mengimpor: ' + result.error, 'error');
              hideModal();
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }

    const addBtn = document.getElementById('btn-add-product');
    if (addBtn) addBtn.addEventListener('click', () => {
      showModal(`
        <div class="modal-title">Tambah Produk Baru</div>
        <div class="input-group">
          <label class="input-label">Nama Produk *</label>
          <input class="input" id="inp-p-name" placeholder="Contoh: Kopi Susu Gula Aren" />
        </div>
        <div class="input-group">
          <label class="input-label">Harga (Rp) *</label>
          <input class="input" id="inp-p-price" type="number" placeholder="Contoh: 15000" />
        </div>
        <div class="input-group">
          <label class="input-label">Stok Awal *</label>
          <input class="input" id="inp-p-stock" type="number" placeholder="Contoh: 100" />
        </div>
        <div class="input-group">
          <label class="input-label">Kategori</label>
          <select class="input" id="inp-p-cat">
            <option value="Umum">Umum</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Snack">Snack</option>
          </select>
        </div>
        <div id="p-form-error" style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none"></div>
        <button class="btn btn-primary btn-block mt-8" id="btn-save-product">
          <span class="material-icons-round" style="font-size:18px">save</span> Simpan Produk
        </button>
      `);
      
      setTimeout(() => {
        const saveBtn = document.getElementById('btn-save-product');
        if (saveBtn) saveBtn.addEventListener('click', async () => {
          const name = document.getElementById('inp-p-name').value.trim();
          const price = document.getElementById('inp-p-price').value;
          const stock = document.getElementById('inp-p-stock').value;
          const category = document.getElementById('inp-p-cat').value;
          const errEl = document.getElementById('p-form-error');

          if (!name || !price || !stock) {
            errEl.textContent = 'Nama, Harga, dan Stok wajib diisi.';
            errEl.style.display = 'block';
            return;
          }

          saveBtn.disabled = true;
          saveBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Menyimpan...';

          await addProduct({ name, price, stock, category });
          addLog('Tambah Produk', `Produk baru: ${name} (Stok: ${stock})`);
          closeModal();
          showToast(`✅ Produk ${name} berhasil ditambahkan`);
          navigateTo('products');
        });
      }, 50);
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
    document.querySelectorAll('.btn-inv-status').forEach(el => {
      el.addEventListener('click', async () => {
        const id = el.dataset.id;
        const status = el.dataset.status;
        await updateInvoiceStatus(id, status);
        addLog('Update Invoice', `Status invoice ${id} diubah ke ${status}`);
        navigateTo('invoices');
        showToast(status === 'paid' ? '✅ Invoice lunas!' : '📤 Invoice terkirim!');
      });
    });

    document.querySelectorAll('.btn-view-invoice').forEach(el => {
      el.addEventListener('click', () => {
        showInvoiceModal(el.dataset.id);
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

  // === Branding Events ===
  if (page === 'appearance') {
    // Color picker
    document.querySelectorAll('.color-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.color-picker-item').forEach(i => {
          i.classList.remove('active');
          i.innerHTML = '';
        });
        item.classList.add('active');
        item.innerHTML = '<span class="material-icons-round" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:white">check</span>';
      });
    });

    // Theme picker (HIG Harmony)
    let selectedTheme = branding.theme || 'dark';
    document.querySelectorAll('.theme-picker-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.theme-picker-item').forEach(i => {
          i.classList.remove('active');
          i.style.borderColor = 'var(--border)';
        });
        item.classList.add('active');
        item.style.borderColor = 'var(--accent)';
        selectedTheme = item.dataset.theme;
      });
    });

    const saveBtn = document.getElementById('btn-save-appearance');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
      const activeColor = document.querySelector('.color-picker-item.active');
      const accent = activeColor ? activeColor.dataset.color : branding.accent;
      
      await updateBranding({ accent, theme: selectedTheme });
      applyBranding();
      showToast('Tampilan berhasil diperbarui 🎨');
      navigateTo('settings');
    });
  }

  if (page === 'storeProfile') {
    const saveBtn = document.getElementById('btn-save-store-profile');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
      const storeName = document.getElementById('inp-store-name').value.trim();
      const storeEmoji = document.getElementById('inp-store-emoji').value.trim();
      if (!storeName) return showToast('Nama toko tidak boleh kosong', 'error');
      
      await updateBranding({ storeName, storeEmoji });
      applyBranding();
      showToast('Profil toko berhasil diperbarui ✅');
      navigateTo('settings');
    });
  }

  if (page === 'receiptSettings') {
    const headerInp = document.getElementById('inp-receipt-header');
    const footerInp = document.getElementById('inp-receipt-footer');
    
    headerInp.addEventListener('input', () => { $('preview-header-text').textContent = headerInp.value; });
    footerInp.addEventListener('input', () => { $('preview-footer-text').textContent = footerInp.value; });

    const saveBtn = document.getElementById('btn-save-receipt');
    if (saveBtn) saveBtn.addEventListener('click', async () => {
      const receiptHeader = headerInp.value.trim();
      const receiptFooter = footerInp.value.trim();
      await updateBranding({ receiptHeader, receiptFooter });
      showToast('Template struk berhasil disimpan 🧾');
      navigateTo('settings');
    });
  }
  if (page === 'team') {
    const inviteBtn = document.getElementById('btn-invite-staff');
    if (inviteBtn) inviteBtn.addEventListener('click', () => {
      if (!canAccess('team')) return showUpgradeModal('Manajemen Tim');
      
      showModal(`
        <div class="p-20">
          <h3 class="fw-700 mb-16">Tambah Staf Baru</h3>
          <div class="input-group">
            <label class="input-label">Nama Lengkap</label>
            <input class="input" id="inp-staff-name" placeholder="Nama staf" />
          </div>
          <div class="input-group">
            <label class="input-label">Email / Username</label>
            <input class="input" id="inp-staff-email" placeholder="email@toko.com" />
          </div>
          <div class="input-group">
            <label class="input-label">Hak Akses</label>
            <select class="input" id="inp-staff-role">
              <option value="Kasir">Kasir (Terbatas)</option>
              <option value="Manajer">Manajer (Penuh)</option>
            </select>
          </div>
          <div class="flex gap-12 mt-24">
            <button class="btn btn-ghost flex-1" onclick="closeModal()">Batal</button>
            <button class="btn btn-primary flex-1" id="btn-confirm-add-staff">Simpan</button>
          </div>
        </div>
      `);

      document.getElementById('btn-confirm-add-staff').addEventListener('click', async () => {
        const name = document.getElementById('inp-staff-name').value.trim();
        const email = document.getElementById('inp-staff-email').value.trim();
        const role = document.getElementById('inp-staff-role').value;

        if (!name || !email) return showToast('Harap isi semua field', 'error');

        await addStaff({ name, email, role });
        showToast(`Staf ${name} berhasil ditambahkan! ✅`);
        closeModal();
        navigateTo('team');
      });
    });

    document.querySelectorAll('.btn-remove-staff').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const confirm = window.confirm('Hapus staf ini?');
        if (confirm) {
          await removeStaff(id);
          showToast('Staf telah dihapus');
          navigateTo('team');
        }
      });
    });
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

  const isDark = document.documentElement.classList.contains('dark-theme');
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)';
  const accentColor = branding.accent || '#6366f1';

  new Chart(canvas, {
    type: config.type,
    data: {
      labels: labels,
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: amounts,
        backgroundColor: page === 'dashboard' ? `${accentColor}22` : accentColor,
        borderColor: accentColor,
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
        x: { 
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Inter', weight: '600' } }
        }
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

  showModal(`
    <div id="receipt-capture-area" style="background:var(--bg-primary);padding:16px;border-radius:16px">
      <div class="receipt">
        <div class="receipt-header">
          <div class="receipt-store" style="color:${branding.accent}">${branding.storeName}</div>
          <div class="receipt-info">${branding.receiptHeader}</div>
          <div class="receipt-info">${txn.date}</div>
          <div class="receipt-info">TRX-${txn.id.slice(0,8).toUpperCase()}</div>
        </div>
        <div class="receipt-items">
          ${itemsHtml}
        </div>
        <div class="receipt-total">
          <span>TOTAL</span>
          <span>${formatRupiah(txn.total)}</span>
        </div>
        <div class="receipt-footer">
          <div class="receipt-qr" style="background:#f3f4f6;padding:10px;border-radius:8px;margin-bottom:12px;font-weight:700;color:#374151;letter-spacing:2px;border-color:${branding.accent}33">${branding.storeEmoji} POSAS VERIFIED</div>
          <p>${branding.receiptFooter}</p>
          <p style="font-size:10px;color:var(--text-muted)">Disimpan secara aman oleh POSAS SaaS</p>
        </div>
      </div>
    </div>
    <div class="grid-2 mt-16">
      <button class="btn btn-secondary" id="btn-download-receipt">
        <span class="material-icons-round" style="font-size:18px">download</span> Gambar
      </button>
      <button class="btn btn-primary" id="btn-wa-receipt" style="background:#25D366;border-color:#25D366">
        <span class="material-icons-round" style="font-size:18px">chat</span> WhatsApp
      </button>
    </div>
    <button class="btn btn-ghost btn-block mt-8" onclick="closeModal(); navigateTo('pos')">Selesai</button>
  `);
  
  setTimeout(() => {
    // Download logic
    document.getElementById('btn-download-receipt').addEventListener('click', async () => {
      const btn = document.getElementById('btn-download-receipt');
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-round spin">sync</span>';
      
      const node = document.getElementById('receipt-capture-area');
      try {
        const dataUrl = await htmlToImage.toPng(node, { backgroundColor: '#ffffff', quality: 1 });
        const link = document.createElement('a');
        link.download = `Struk-${txn.id.slice(0,8)}.png`;
        link.href = dataUrl;
        link.click();
        showToast('Struk berhasil diunduh 🖼️');
      } catch (err) {
        showToast('Gagal mengunduh gambar', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons-round" style="font-size:18px">download</span> Gambar';
      }
    });

    // WhatsApp logic
    document.getElementById('btn-wa-receipt').addEventListener('click', () => {
      const itemsList = txn.cartItems ? txn.cartItems.map(i => `- ${i.name} (x${i.qty}): ${formatRupiah(i.price * i.qty)}`).join('%0A') : '';
      const text = `*STRUK DIGITAL ${user.storeName}*%0A%0A` +
                   `Tanggal: ${txn.date}%0A` +
                   `ID: TRX-${txn.id.slice(0,8).toUpperCase()}%0A` +
                   `----------------------------%0A` +
                   `${itemsList}%0A` +
                   `----------------------------%0A` +
                   `*TOTAL: ${formatRupiah(txn.total)}*%0A%0A` +
                   `Terima kasih telah berbelanja!`;
      
      window.open(`https://wa.me/?text=${text}`, '_blank');
    });
  }, 100);
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
    <div class="flex items-center gap-8 mb-16" style="margin-top:12px; margin-bottom:16px;">
      <input type="checkbox" id="auth-consent" style="cursor:pointer;" />
      <label for="auth-consent" class="text-xs text-muted" style="cursor:pointer; line-height: 1.4;">
        Saya menyetujui <a href="#" style="color:var(--accent-light);">Ketentuan Layanan</a> & <a href="#" style="color:var(--accent-light);">Kebijakan Privasi</a> POSAS (Kepatuhan UU PDP No. 27/2022).
      </label>
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
      const consent = $('auth-consent').checked;
      
      if (!name || !storeName || !email || !password) return showAuthError('Semua field wajib diisi.');
      if (password.length < 6) return showAuthError('Password minimal 6 karakter.');
      if (!consent) return showAuthError('Anda harus menyetujui Kebijakan Privasi.');
      
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
  applyBranding();
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
    applyBranding();
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
  initNotifications();

  // Profile
  $('btn-profile').addEventListener('click', () => navigateTo('settings'));
}

async function showInvoiceModal(invId) {
  const inv = invoices.find(i => i.id === invId);
  if (!inv) return;

  showModal(`
    <div id="invoice-modal-content">
      ${renderInvoiceDetail(invId)}
    </div>
    <div class="grid-2 p-16 pt-0">
      <button class="btn btn-secondary" id="btn-download-invoice">
        <span class="material-icons-round" style="font-size:18px">download</span> Unduh Gambar
      </button>
      <button class="btn btn-primary" id="btn-wa-invoice" style="background:#25D366;border-color:#25D366">
        <span class="material-icons-round" style="font-size:18px">chat</span> WhatsApp
      </button>
    </div>
  `);

  setTimeout(() => {
    document.getElementById('btn-download-invoice').addEventListener('click', async () => {
      const btn = document.getElementById('btn-download-invoice');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-round spin">sync</span>';
      
      const node = document.getElementById('invoice-capture-area');
      try {
        const dataUrl = await htmlToImage.toPng(node, { backgroundColor: '#ffffff', quality: 1 });
        const link = document.createElement('a');
        link.download = `Invoice-${inv.number}.png`;
        link.href = dataUrl;
        link.click();
        addLog('Download Invoice', `Invoice ${inv.number} diunduh sebagai gambar`);
        showToast('Invoice berhasil diunduh');
      } catch (err) {
        console.error(err);
        showToast('Gagal mengunduh invoice', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });

    document.getElementById('btn-wa-invoice').addEventListener('click', () => {
      const msg = `Halo, berikut adalah invoice ${inv.number} Anda senilai ${formatRupiah(inv.total)}. Silakan cek di sini: [Link]`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      addLog('Share Invoice', `Invoice ${inv.number} dibagikan via WhatsApp`);
    });
  }, 100);
}

// Monitor online status to trigger automatic sync of offline transactions
window.addEventListener('online', async () => {
  showToast('Koneksi internet kembali! Mensinkronisasikan data... 📡', 'success');
  const res = await syncOfflineTransactions();
  if (res.success && res.count > 0) {
    showToast(`${res.count} transaksi offline berhasil disinkronkan ke cloud! ✅`, 'success');
    navigateTo(window.currentPage || 'dashboard');
  }
});

window.addEventListener('offline', () => {
  showToast('Anda sedang offline. Transaksi baru akan disimpan secara lokal. 📥', 'warning');
});

document.addEventListener('DOMContentLoaded', init);
