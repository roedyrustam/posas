import { supabase } from './supabase.js';

// --- Storage Helpers ---
const KEYS = {
  products: 'posas_products',
  customers: 'posas_customers',
  transactions: 'posas_transactions',
  cart: 'posas_cart',
  invoices: 'posas_invoices',
  bookings: 'posas_bookings',
  users: 'posas_users',
  session: 'posas_session',
  branding: 'posas_branding',
  staff: 'posas_staff',
  logs: 'posas_logs'
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Tenant (static for now) ---
export const tenant = {
  id: 'tn_001',
  name: 'Toko Saya',
  owner: 'Roedy Santosa',
  plan: 'free',
  createdAt: '2026-01-15'
};

// --- Default Seed Data ---
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'Kopi Susu', price: 18000, stock: 45, category: 'Minuman', emoji: '☕' },
  { id: 'p2', name: 'Nasi Goreng', price: 25000, stock: 30, category: 'Makanan', emoji: '🍛' },
  { id: 'p3', name: 'Es Teh Manis', price: 8000, stock: 60, category: 'Minuman', emoji: '🧊' },
  { id: 'p4', name: 'Roti Bakar', price: 15000, stock: 20, category: 'Makanan', emoji: '🍞' },
  { id: 'p5', name: 'Jus Alpukat', price: 22000, stock: 15, category: 'Minuman', emoji: '🥑' },
  { id: 'p6', name: 'Mie Ayam', price: 20000, stock: 25, category: 'Makanan', emoji: '🍜' },
  { id: 'p7', name: 'Ayam Geprek', price: 28000, stock: 18, category: 'Makanan', emoji: '🍗' },
  { id: 'p8', name: 'Matcha Latte', price: 24000, stock: 12, category: 'Minuman', emoji: '🍵' },
  { id: 'p9', name: 'Brownies', price: 12000, stock: 35, category: 'Snack', emoji: '🍫' },
  { id: 'p10', name: 'Pisang Goreng', price: 10000, stock: 40, category: 'Snack', emoji: '🍌' },
];

const DEFAULT_CUSTOMERS = [
  { id: 'c1', name: 'Andi Pratama', phone: '08123456789', totalSpent: 150000, visits: 5, lastVisit: '2026-05-01', points: 150, notes: 'Suka kopi pahit' },
  { id: 'c2', name: 'Siti Aminah', phone: '08198765432', totalSpent: 85000, visits: 3, lastVisit: '2026-05-03', points: 85, notes: '' },
  { id: 'c3', name: 'Budi Santoso', phone: '08551234567', totalSpent: 220000, visits: 8, lastVisit: '2026-05-05', points: 220, notes: 'VIP' },
  { id: 'c4', name: 'Dewi Lestari', phone: '0878-9876-5432', email: '', totalSpent: 210000, visits: 5, lastVisit: '2026-05-08' },
  { id: 'c5', name: 'Rizky Maulana', phone: '0821-6543-2109', email: '', totalSpent: 670000, visits: 20, lastVisit: '2026-05-10' },
];

const DEFAULT_TRANSACTIONS = [
  { id: 't1', date: '2026-05-10 14:30', items: ['Kopi Susu x2', 'Roti Bakar'], total: 51000, customer: 'Andi Pratama', method: 'QRIS' },
  { id: 't2', date: '2026-05-10 13:15', items: ['Nasi Goreng', 'Es Teh Manis'], total: 33000, customer: 'Walk-in', method: 'Tunai' },
  { id: 't3', date: '2026-05-10 12:00', items: ['Ayam Geprek', 'Jus Alpukat'], total: 50000, customer: 'Budi Santoso', method: 'QRIS' },
  { id: 't4', date: '2026-05-10 10:45', items: ['Matcha Latte x3'], total: 72000, customer: 'Rizky Maulana', method: 'Transfer' },
  { id: 't5', date: '2026-05-09 19:20', items: ['Mie Ayam x2', 'Es Teh Manis x2'], total: 56000, customer: 'Siti Rahayu', method: 'Tunai' },
  { id: 't6', date: '2026-05-09 16:30', items: ['Brownies x4', 'Kopi Susu'], total: 66000, customer: 'Walk-in', method: 'QRIS' },
];
const DEFAULT_STAFF = [
  { id: 's1', name: 'Roedy Santosa', email: 'roedy@posas.id', role: 'Owner', status: 'Active' },
  { id: 's2', name: 'Bambang Kasir', email: 'bambang@gmail.com', role: 'Kasir', status: 'Active' },
  { id: 's3', name: 'Maya Manager', email: 'maya@posas.id', role: 'Manajer', status: 'Active' },
];

// --- Load from localStorage (or seed defaults) ---
export let products = loadJSON(KEYS.products, DEFAULT_PRODUCTS);
export let customers = loadJSON(KEYS.customers, DEFAULT_CUSTOMERS);
export let transactions = loadJSON(KEYS.transactions, DEFAULT_TRANSACTIONS);
export let invoices = loadJSON(KEYS.invoices, []);
export let bookings = loadJSON(KEYS.bookings, []);
export let staff = loadJSON(KEYS.staff, DEFAULT_STAFF);
export let logs = loadJSON(KEYS.logs, []);

// --- Branding (Appearance & Store Info) ---
const DEFAULT_BRANDING = {
  accent: '#6366f1',
  storeName: 'Toko Saya',
  storeEmoji: '🏪',
  receiptHeader: 'Terima kasih telah berbelanja!',
  receiptFooter: 'Silakan berkunjung kembali.',
  theme: 'dark' // currently only dark is fully supported by CSS
};
export let branding = loadJSON(KEYS.branding, DEFAULT_BRANDING);

// --- Cloud Sync ---
export async function syncCloudData() {
  const session = await supabase.auth.getSession();
  const userId = session.data.session?.user?.id;
  if (!userId) return;

  try {
    const [p, c, t, i, b] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
    ]);

    if (p.data) { products.length = 0; products.push(...p.data); saveJSON(KEYS.products, products); }
    if (c.data) { customers.length = 0; customers.push(...c.data); saveJSON(KEYS.customers, customers); }
    if (t.data) { transactions.length = 0; transactions.push(...t.data); saveJSON(KEYS.transactions, transactions); }
    if (i.data) { invoices.length = 0; invoices.push(...i.data); saveJSON(KEYS.invoices, invoices); }
    if (b.data) { bookings.length = 0; bookings.push(...b.data); saveJSON(KEYS.bookings, bookings); }
    
    console.log('Cloud data synced ✅');
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

// Seed on first run (optional, for local-first feel)
if (!localStorage.getItem(KEYS.products)) saveJSON(KEYS.products, products);

// --- CRUD: Products ---
export async function addProduct({ name, price, stock, category, emoji }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const product = {
    id: crypto.randomUUID(),
    user_id: user.id,
    tenant_id: getSession().tenantId,
    name,
    price: Number(price),
    stock: Number(stock),
    category,
    emoji: emoji || '📦',
  };

  products.unshift(product);
  saveJSON(KEYS.products, products);

  await supabase.from('products').insert(product);
  return product;
}

export async function updateProduct(id, updates) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  Object.assign(products[idx], updates);
  saveJSON(KEYS.products, products);

  await supabase.from('products').update(updates).eq('id', id);
  return products[idx];
}

export async function deleteProduct(id) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  saveJSON(KEYS.products, products);
  await supabase.from('products').delete().eq('id', id);
  return true;
}

export async function bulkAddProducts(items) {
  const user = getSession();
  if (!user) return { success: false, error: 'Unauthorized' };

  const productsToInsert = items.map(p => ({
    ...p,
    user_id: user.userId,
    tenant_id: user.tenantId,
    emoji: p.emoji || '📦',
    stock: Number(p.stock) || 0,
    price: Number(p.price) || 0
  }));

  const { data, error } = await supabase
    .from('products')
    .insert(productsToInsert)
    .select();

  if (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
  
  return { success: true, count: data.length };
}

// --- CRUD: Customers ---
export async function addCustomer({ name, phone, email }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const customer = {
    id: crypto.randomUUID(),
    user_id: user.id,
    tenant_id: getSession().tenantId,
    name,
    phone,
    email: email || '',
    totalSpent: 0,
    visits: 0,
    lastVisit: new Date().toISOString().slice(0, 10),
    points: 0,
    notes: ''
  };
  customers.unshift(customer);
  saveJSON(KEYS.customers, customers);

  await supabase.from('customers').insert(customer);
  return customer;
}

export async function updateCustomer(id, updates) {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  Object.assign(customers[idx], updates);
  saveJSON(KEYS.customers, customers);

  await supabase.from('customers').update(updates).eq('id', id);
  return customers[idx];
}

export async function deleteCustomer(id) {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return false;
  customers.splice(idx, 1);
  saveJSON(KEYS.customers, customers);

  await supabase.from('customers').delete().eq('id', id);
  return true;
}

// --- Transactions ---
export async function addTransaction({ items, total, customer, method, cartItems }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const txn = {
    id: crypto.randomUUID(),
    user_id: user.id,
    created_at: now.toISOString(),
    items: JSON.stringify(items), 
    total: Number(total),
    customer_name: customer || 'Walk-in',
    method: method || 'Tunai',
    raw_items: cartItems // For deep reporting
  };

  // For local UI consistency
  const localTxn = { ...txn, date: dateStr, customer: txn.customer_name, items: items, cartItems: cartItems };
  transactions.unshift(localTxn);
  saveJSON(KEYS.transactions, transactions);

  // Sync to Cloud
  await supabase.from('transactions').insert({
    id: txn.id,
    user_id: txn.user_id,
    tenant_id: getSession().tenantId,
    items: items,
    total: txn.total,
    customer_name: txn.customer_name,
    method: txn.method
  });

  // Update customer stats
    const c = customers.find(cu => cu.name === txn.customer_name);
    if (c) {
      const updates = {
        totalSpent: c.totalSpent + txn.total,
        visits: c.visits + 1,
        lastVisit: now.toISOString().slice(0, 10),
        points: (c.points || 0) + Math.floor(txn.total / 1000)
      };
      Object.assign(c, updates);
      saveJSON(KEYS.customers, customers);
      await supabase.from('customers').update(updates).eq('id', c.id);
    }

  // Decrease stock
  if (cartItems) {
    await decreaseStock(cartItems);
  }

  return localTxn;
}

export async function decreaseStock(cartItems) {
  for (const ci of cartItems) {
    const p = products.find(pr => pr.id === ci.id);
    if (p) {
      const newStock = Math.max(0, p.stock - ci.qty);
      p.stock = newStock;
      await supabase.from('products').update({ stock: newStock }).eq('id', p.id);
    }
  }
  saveJSON(KEYS.products, products);
}

// --- CRUD: Invoices ---
export async function addInvoice({ customer, items, total, dueDate, notes }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const inv = {
    id: crypto.randomUUID(),
    user_id: user.id,
    invoice_number: 'INV-' + String(invoices.length + 1).padStart(4, '0'),
    customer_name: customer,
    items: items, // array of { name, qty, price }
    total: Number(total),
    due_date: dueDate || null,
    notes: notes || '',
    status: 'draft', // draft, sent, paid
    created_at: new Date().toISOString(),
  };

  const localInv = { ...inv, number: inv.invoice_number, customer: inv.customer_name, dueDate: inv.due_date, createdAt: inv.created_at.slice(0, 10) };
  invoices.unshift(localInv);
  saveJSON(KEYS.invoices, invoices);

  await supabase.from('invoices').insert({ ...inv, tenant_id: getSession().tenantId });
  return localInv;
}

export async function updateInvoiceStatus(id, status) {
  const inv = invoices.find(i => i.id === id);
  if (inv) { 
    inv.status = status; 
    saveJSON(KEYS.invoices, invoices); 
    await supabase.from('invoices').update({ status }).eq('id', id);
  }
  return inv;
}

export async function deleteInvoice(id) {
  const idx = invoices.findIndex(i => i.id === id);
  if (idx > -1) { 
    invoices.splice(idx, 1); 
    saveJSON(KEYS.invoices, invoices); 
    await supabase.from('invoices').delete().eq('id', id);
  }
}

// --- CRUD: Bookings ---
export async function addBooking({ customerName, service, date, time, notes }) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const booking = {
    id: crypto.randomUUID(),
    user_id: user.id,
    customer_name: customerName,
    service,
    date,
    time,
    notes: notes || '',
    status: 'confirmed', // confirmed, completed, cancelled
    created_at: new Date().toISOString(),
  };

  const localBk = { ...booking, customerName: booking.customer_name, createdAt: booking.created_at.slice(0, 10) };
  bookings.unshift(localBk);
  saveJSON(KEYS.bookings, bookings);

  await supabase.from('bookings').insert({ ...booking, tenant_id: getSession().tenantId });
  return localBk;
}

export async function updateBookingStatus(id, status) {
  const bk = bookings.find(b => b.id === id);
  if (bk) { 
    bk.status = status; 
    saveJSON(KEYS.bookings, bookings); 
    await supabase.from('bookings').update({ status }).eq('id', id);
  }
  return bk;
}

// --- Dynamic Stats ---
export function getStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayTxns = transactions.filter(t => t.date.startsWith(today));
  return {
    todayRevenue: todayTxns.reduce((s, t) => s + t.total, 0),
    todayOrders: todayTxns.length,
    totalProducts: products.length,
    totalCustomers: customers.length,
    monthRevenue: transactions.reduce((s, t) => s + t.total, 0),
    lowStock: products.filter(p => p.stock < 20).length,
  };
}

// --- Weekly Revenue (computed from transactions) ---
export function getWeeklyRevenue() {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const now = new Date();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayTxns = transactions.filter(t => t.date.startsWith(dateStr));
    const amount = dayTxns.reduce((s, t) => s + t.total, 0);
    result.push({ day: dayNames[d.getDay()], amount });
  }

  // If all zeros (no transactions this week), show seed data for demo
  if (result.every(r => r.amount === 0)) {
    return [
      { day: 'Sen', amount: 420000 },
      { day: 'Sel', amount: 380000 },
      { day: 'Rab', amount: 510000 },
      { day: 'Kam', amount: 470000 },
      { day: 'Jum', amount: 620000 },
      { day: 'Sab', amount: 750000 },
      { day: 'Min', amount: 690000 },
    ];
  }
  return result;
}

// --- Cart with localStorage ---
export const cart = {
  items: loadJSON(KEYS.cart, []),
  get total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },
  get count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },
  _save() {
    saveJSON(KEYS.cart, this.items);
  },
  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this._save();
  },
  remove(productId) {
    const idx = this.items.findIndex(i => i.id === productId);
    if (idx > -1) {
      if (this.items[idx].qty > 1) this.items[idx].qty--;
      else this.items.splice(idx, 1);
    }
    this._save();
  },
  clear() {
    this.items = [];
    this._save();
  }
};

// --- Utilities ---
export function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#22c55e','#3b82f6','#ef4444','#14b8a6'];
export function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

// --- Reset to default data (dev utility) ---
export function resetAllData() {
  saveJSON(KEYS.products, DEFAULT_PRODUCTS);
  saveJSON(KEYS.customers, DEFAULT_CUSTOMERS);
  saveJSON(KEYS.transactions, DEFAULT_TRANSACTIONS);
  saveJSON(KEYS.cart, []);
  location.reload();
}

// ========== AUTH SYSTEM (Supabase) ==========

export async function register({ name, email, password, storeName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        store_name: storeName
      }
    }
  });

  if (error) return { ok: false, error: error.message };
  
  // Sesi otomatis tersimpan oleh Supabase client
  const session = { 
    userId: user.id, 
    name: name, 
    email: user.email, 
    storeName: storeName, 
    role: 'owner', 
    plan: 'free',
    tenantId: profile ? profile.tenant_id : null
  };
  saveJSON(KEYS.session, session);
  return { ok: true, user: session };
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return { ok: false, error: error.message };

  // Ambil profile dari table profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const session = { 
    userId: data.user.id, 
    name: profile ? profile.full_name : data.user.email, 
    email: data.user.email, 
    storeName: profile ? profile.store_name : 'Toko Saya', 
    role: profile ? profile.role : 'owner', 
    plan: profile ? profile.plan : 'free',
    tenantId: profile ? profile.tenant_id : null
  };
  saveJSON(KEYS.session, session);
  return { ok: true, user: session };
}

export async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem(KEYS.session);
}

export function getSession() {
  // Gunakan local storage untuk check session cepat di init
  return loadJSON(KEYS.session, null);
}

export function getCurrentUser() {
  return getSession();
}

export function canAccess(action) {
  const user = getCurrentUser();
  if (!user) return false;
  
  const permissions = {
    'owner': ['pos', 'products', 'customers', 'finance', 'reports', 'booking', 'invoices', 'settings', 'manage_staff', 'delete_data', 'appearance', 'storeProfile', 'receiptSettings', 'team', 'loyalty'],
    'kasir': ['pos', 'customers', 'booking', 'settings', 'appearance', 'storeProfile', 'receiptSettings'],
    'manajer': ['pos', 'products', 'customers', 'booking', 'invoices', 'settings', 'reports', 'appearance', 'storeProfile', 'receiptSettings', 'loyalty']
  };
  
  const allowed = permissions[user.role.toLowerCase()] || [];
  if (!allowed.includes(action)) return false;

  // Plan-based restrictions
  const proFeatures = ['reports', 'manage_staff', 'delete_data', 'appearance', 'storeProfile', 'receiptSettings', 'team', 'loyalty'];
  if (proFeatures.includes(action) && user.plan !== 'pro') {
    return false;
  }

  return true;
}

export async function upgradeToPro() {
  const user = getSession();
  if (!user) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ plan: 'pro' })
    .eq('id', user.userId);

  if (error) {
    console.error(error);
    return false;
  }

  // Update local session
  const session = JSON.parse(localStorage.getItem('posas_session'));
  session.plan = 'pro';
  localStorage.setItem('posas_session', JSON.stringify(session));
  
  return true;
}

export async function updateBranding(updates) {
  Object.assign(branding, updates);
  saveJSON(KEYS.branding, branding);
  
  // Optional: Sync to Supabase if we have a table for it
  // For now, keep it local-first as part of the white-label UX
  return branding;
}

export async function fetchTeam() {
  const user = getSession();
  if (!user || !user.tenantId) return [];
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', user.tenantId);
    
  if (error) { console.error(error); return []; }
  return data;
}

// --- Export Utility ---
export function exportToCSV(filename, data) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') ? `"${str}"` : str;
    }).join(',')
  );
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}export function getLowStockProducts() {
  return products.filter(p => (p.stock || 0) <= 10);
}

export async function redeemPoints(customerId, pointsToRedeem) {
  const customer = customers.find(c => c.id === customerId);
  if (!customer || customer.points < pointsToRedeem) return { success: false, message: 'Poin tidak mencukupi' };
  
  customer.points -= pointsToRedeem;
  const discount = (pointsToRedeem / 100) * 10000; // 100 pts = 10k disc
  
  saveJSON(KEYS.customers, customers);
  return { success: true, discount, newPoints: customer.points };
}

export function getTopProducts(limit = 5) {
  const counts = {};
  transactions.forEach(t => {
    if (t.cartItems) {
      t.cartItems.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.qty;
      });
    } else {
      // Fallback for old transactions
      t.items.forEach(label => {
        const name = label.split(' x')[0];
        counts[name] = (counts[name] || 0) + 1;
      });
    }
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getTopCustomers(limit = 5) {
  return [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export function generateSalesCSV() {
  const headers = ['ID', 'Pelanggan', 'Tanggal', 'Metode', 'Item', 'Total'];
  const rows = transactions.map(t => [
    t.id,
    t.customer,
    t.date,
    t.method,
    `"${t.items.join(';')}"`,
    t.total
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

// --- Staff Management ---
export async function fetchTeam() {
  // Simulate network delay
  return new Promise(resolve => setTimeout(() => resolve(staff), 500));
}

export async function addStaff(data) {
  const newStaff = {
    id: 's' + Date.now(),
    status: 'Active',
    ...data
  };
  staff.push(newStaff);
  saveJSON(KEYS.staff, staff);
  return newStaff;
}

export async function removeStaff(id) {
  const idx = staff.findIndex(s => s.id === id);
  if (idx > -1) {
    staff.splice(idx, 1);
    saveJSON(KEYS.staff, staff);
    return true;
  }
  return false;
}

// --- Audit Logs ---
export function addLog(action, details) {
  const user = getSession();
  const log = {
    id: 'l' + Date.now(),
    user: user ? user.name : 'System',
    role: user ? user.role : 'system',
    action,
    details: details || '',
    timestamp: new Date().toISOString()
  };
  logs.unshift(log);
  if (logs.length > 100) logs.pop(); // Keep last 100 logs
  saveJSON(KEYS.logs, logs);
  return log;
}
