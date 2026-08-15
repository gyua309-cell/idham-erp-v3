import { create } from 'zustand';
import { db, COMPANY_ID, collection, getDocs } from '../firebase';

export const useAppStore = create((set, get) => ({
  // State
  currentRoute: 'dashboard',
  user: { name: 'علي فياض', role: 'مدير النظام', email: 'admin@idham.sa' },
  theme: localStorage.getItem('idham_theme') || 'dark',

  // Cache Collections
  products: [],
  warehouses: [],
  customers: [],
  suppliers: [],
  salesInvoices: [],
  purchaseInvoices: [],
  stockTransactions: [],
  
  // Loading & Toast States
  loading: false,
  toast: null,

  // Actions
  setRoute: (route) => set({ currentRoute: route }),
  
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('idham_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    set({ theme: nextTheme });
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => {
      if (get().toast?.message === message) set({ toast: null });
    }, 4000);
  },

  // Fast In-Memory Data Loader
  fetchAllData: async (force = false) => {
    if (!force && get().products.length > 0) return; // Return cached memory data instantly

    set({ loading: true });
    try {
      const [pSnap, wSnap, cSnap, sSnap, saSnap, puSnap, txSnap] = await Promise.all([
        getDocs(collection(db, `companies/${COMPANY_ID}/products`)),
        getDocs(collection(db, `companies/${COMPANY_ID}/warehouses`)),
        getDocs(collection(db, `companies/${COMPANY_ID}/customers`)),
        getDocs(collection(db, `companies/${COMPANY_ID}/suppliers`)),
        getDocs(collection(db, `companies/${COMPANY_ID}/salesInvoices`)),
        getDocs(collection(db, `companies/${COMPANY_ID}/purchaseInvoices`)),
        getDocs(collection(db, `companies/${COMPANY_ID}/stockTransactions`))
      ]);

      set({
        products: pSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        warehouses: wSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        customers: cSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        suppliers: sSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        salesInvoices: saSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        purchaseInvoices: puSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        stockTransactions: txSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        loading: false
      });
    } catch (err) {
      console.error("Zustand store fetch failed:", err);
      set({ loading: false });
      get().showToast("خطأ في تحميل البيانات من السيرفر: " + err.message, "error");
    }
  }
}));
