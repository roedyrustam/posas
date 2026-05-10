// ========== POSAS Mock Data Store ==========
// Simulates multi-tenant SaaS data

export const tenant = {
  id: 'tn_001',
  name: 'Toko Saya',
  owner: 'Roedy Santosa',
  plan: 'free',
  createdAt: '2026-01-15'
};

export const products = [
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

export const customers = [
  { id: 'c1', name: 'Andi Pratama', phone: '0812-3456-7890', totalSpent: 450000, visits: 12, lastVisit: '2026-05-10' },
  { id: 'c2', name: 'Siti Rahayu', phone: '0813-2345-6789', totalSpent: 320000, visits: 8, lastVisit: '2026-05-09' },
  { id: 'c3', name: 'Budi Santoso', phone: '0857-1234-5678', totalSpent: 580000, visits: 15, lastVisit: '2026-05-10' },
  { id: 'c4', name: 'Dewi Lestari', phone: '0878-9876-5432', totalSpent: 210000, visits: 5, lastVisit: '2026-05-08' },
  { id: 'c5', name: 'Rizky Maulana', phone: '0821-6543-2109', totalSpent: 670000, visits: 20, lastVisit: '2026-05-10' },
];

export const transactions = [
  { id: 't1', date: '2026-05-10 14:30', items: ['Kopi Susu x2', 'Roti Bakar'], total: 51000, customer: 'Andi Pratama', method: 'QRIS' },
  { id: 't2', date: '2026-05-10 13:15', items: ['Nasi Goreng', 'Es Teh Manis'], total: 33000, customer: 'Walk-in', method: 'Tunai' },
  { id: 't3', date: '2026-05-10 12:00', items: ['Ayam Geprek', 'Jus Alpukat'], total: 50000, customer: 'Budi Santoso', method: 'QRIS' },
  { id: 't4', date: '2026-05-10 10:45', items: ['Matcha Latte x3'], total: 72000, customer: 'Rizky Maulana', method: 'Transfer' },
  { id: 't5', date: '2026-05-09 19:20', items: ['Mie Ayam x2', 'Es Teh Manis x2'], total: 56000, customer: 'Siti Rahayu', method: 'Tunai' },
  { id: 't6', date: '2026-05-09 16:30', items: ['Brownies x4', 'Kopi Susu'], total: 66000, customer: 'Walk-in', method: 'QRIS' },
];

export const weeklyRevenue = [
  { day: 'Sen', amount: 420000 },
  { day: 'Sel', amount: 380000 },
  { day: 'Rab', amount: 510000 },
  { day: 'Kam', amount: 470000 },
  { day: 'Jum', amount: 620000 },
  { day: 'Sab', amount: 750000 },
  { day: 'Min', amount: 690000 },
];

export const stats = {
  todayRevenue: 206000,
  todayOrders: 4,
  totalProducts: products.length,
  totalCustomers: customers.length,
  monthRevenue: 12450000,
  lowStock: products.filter(p => p.stock < 20).length,
};

// Cart state
export const cart = {
  items: [],
  get total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },
  get count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },
  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
  },
  remove(productId) {
    const idx = this.items.findIndex(i => i.id === productId);
    if (idx > -1) {
      if (this.items[idx].qty > 1) this.items[idx].qty--;
      else this.items.splice(idx, 1);
    }
  },
  clear() {
    this.items = [];
  }
};

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
