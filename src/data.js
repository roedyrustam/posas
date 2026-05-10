// ========== POSAS Data Store — localStorage Persistence ==========

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
  { id: 'c1', name: 'Andi Pratama', phone: '0812-3456-7890', email: '', totalSpent: 450000, visits: 12, lastVisit: '2026-05-10' },
  { id: 'c2', name: 'Siti Rahayu', phone: '0813-2345-6789', email: '', totalSpent: 320000, visits: 8, lastVisit: '2026-05-09' },
  { id: 'c3', name: 'Budi Santoso', phone: '0857-1234-5678', email: '', totalSpent: 580000, visits: 15, lastVisit: '2026-05-10' },
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

// --- Load from localStorage (or seed defaults) ---
export const products = loadJSON(KEYS.products, DEFAULT_PRODUCTS);
export const customers = loadJSON(KEYS.customers, DEFAULT_CUSTOMERS);
export const transactions = loadJSON(KEYS.transactions, DEFAULT_TRANSACTIONS);

// --- Invoices & Bookings ---
export const invoices = loadJSON(KEYS.invoices, []);
export const bookings = loadJSON(KEYS.bookings, []);

// Seed on first run
if (!localStorage.getItem(KEYS.products)) saveJSON(KEYS.products, products);
if (!localStorage.getItem(KEYS.customers)) saveJSON(KEYS.customers, customers);
if (!localStorage.getItem(KEYS.transactions)) saveJSON(KEYS.transactions, transactions);
if (!localStorage.getItem(KEYS.invoices)) saveJSON(KEYS.invoices, invoices);
if (!localStorage.getItem(KEYS.bookings)) saveJSON(KEYS.bookings, bookings);

// --- CRUD: Products ---
export function addProduct({ name, price, stock, category, emoji }) {
  const product = {
    id: 'p' + Date.now(),
    name,
    price: Number(price),
    stock: Number(stock),
    category,
    emoji: emoji || '📦',
  };
  products.push(product);
  saveJSON(KEYS.products, products);
  return product;
}

export function updateProduct(id, updates) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  Object.assign(products[idx], updates);
  saveJSON(KEYS.products, products);
  return products[idx];
}

export function deleteProduct(id) {
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  saveJSON(KEYS.products, products);
  return true;
}

// --- CRUD: Customers ---
export function addCustomer({ name, phone, email }) {
  const customer = {
    id: 'c' + Date.now(),
    name,
    phone,
    email: email || '',
    totalSpent: 0,
    visits: 0,
    lastVisit: new Date().toISOString().slice(0, 10),
  };
  customers.push(customer);
  saveJSON(KEYS.customers, customers);
  return customer;
}

export function updateCustomer(id, updates) {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  Object.assign(customers[idx], updates);
  saveJSON(KEYS.customers, customers);
  return customers[idx];
}

export function deleteCustomer(id) {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return false;
  customers.splice(idx, 1);
  saveJSON(KEYS.customers, customers);
  return true;
}

// --- Transactions ---
export function addTransaction({ items, total, customer, method }) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const txn = {
    id: 't' + Date.now(),
    date: dateStr,
    items,
    total: Number(total),
    customer: customer || 'Walk-in',
    method: method || 'Tunai',
  };
  transactions.unshift(txn); // newest first
  saveJSON(KEYS.transactions, transactions);

  // Update customer stats if not walk-in
  if (customer && customer !== 'Walk-in') {
    const c = customers.find(cu => cu.name === customer);
    if (c) {
      c.totalSpent += txn.total;
      c.visits += 1;
      c.lastVisit = now.toISOString().slice(0, 10);
      saveJSON(KEYS.customers, customers);
    }
  }

  // Decrease stock
  // (items is an array of strings like "Kopi Susu x2" — we use cart items instead)
  return txn;
}

export function decreaseStock(cartItems) {
  cartItems.forEach(ci => {
    const p = products.find(pr => pr.id === ci.id);
    if (p) p.stock = Math.max(0, p.stock - ci.qty);
  });
  saveJSON(KEYS.products, products);
}

// --- CRUD: Invoices ---
export function addInvoice({ customer, items, total, dueDate, notes }) {
  const inv = {
    id: 'inv' + Date.now(),
    number: 'INV-' + String(invoices.length + 1).padStart(4, '0'),
    customer,
    items, // array of { name, qty, price }
    total: Number(total),
    dueDate: dueDate || '',
    notes: notes || '',
    status: 'draft', // draft, sent, paid
    createdAt: new Date().toISOString().slice(0, 10),
  };
  invoices.unshift(inv);
  saveJSON(KEYS.invoices, invoices);
  return inv;
}

export function updateInvoiceStatus(id, status) {
  const inv = invoices.find(i => i.id === id);
  if (inv) { inv.status = status; saveJSON(KEYS.invoices, invoices); }
  return inv;
}

export function deleteInvoice(id) {
  const idx = invoices.findIndex(i => i.id === id);
  if (idx > -1) { invoices.splice(idx, 1); saveJSON(KEYS.invoices, invoices); }
}

// --- CRUD: Bookings ---
export function addBooking({ customerName, service, date, time, notes }) {
  const booking = {
    id: 'bk' + Date.now(),
    customerName,
    service,
    date,
    time,
    notes: notes || '',
    status: 'confirmed', // confirmed, completed, cancelled
    createdAt: new Date().toISOString().slice(0, 10),
  };
  bookings.unshift(booking);
  saveJSON(KEYS.bookings, bookings);
  return booking;
}

export function updateBookingStatus(id, status) {
  const bk = bookings.find(b => b.id === id);
  if (bk) { bk.status = status; saveJSON(KEYS.bookings, bookings); }
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

// ========== AUTH SYSTEM ==========
const users = loadJSON(KEYS.users, []);

export function register({ name, email, password, storeName }) {
  if (users.find(u => u.email === email)) {
    return { ok: false, error: 'Email sudah terdaftar' };
  }
  const user = {
    id: 'u' + Date.now(),
    name,
    email,
    password, // NOTE: plain text for demo only — use bcrypt+backend in production
    storeName: storeName || 'Toko Saya',
    role: 'owner',
    plan: 'free',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  users.push(user);
  saveJSON(KEYS.users, users);
  // Auto-login
  const session = { userId: user.id, name: user.name, email: user.email, storeName: user.storeName, role: user.role, plan: user.plan };
  saveJSON(KEYS.session, session);
  return { ok: true, user: session };
}

export function login({ email, password }) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false, error: 'Email atau password salah' };
  const session = { userId: user.id, name: user.name, email: user.email, storeName: user.storeName, role: user.role, plan: user.plan };
  saveJSON(KEYS.session, session);
  return { ok: true, user: session };
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

export function getSession() {
  return loadJSON(KEYS.session, null);
}

export function getCurrentUser() {
  return getSession();
}
