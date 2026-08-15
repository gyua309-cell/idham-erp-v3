import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Columns3, 
  Wallet,
  Building2
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRoute, setRoute } = useAppStore();

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'products', label: 'إدارة الأصناف والمخزون', icon: Package },
    { id: 'stock-card', label: 'كرت الصنف التفصيلي', icon: FileText },
    { id: 'warehouse-comparison', label: 'مقارنة المستودعات والسيارات', icon: Columns3 },
    { id: 'consolidated-balances', label: 'أرصدة العملاء والموردين', icon: Wallet },
    { id: 'sales-invoices', label: 'فواتير المبيعات', icon: ShoppingBag },
    { id: 'purchase-invoices', label: 'فواتير المشتريات', icon: Building2 },
    { id: 'customers', label: 'دليل العملاء', icon: Users },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          إ
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-main)' }}>إدهام للمواد الغذائية</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>نظام ERP المطور v2.0</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-dim)', padding: '8px 12px' }}>القائمة الرئيسية</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setRoute(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 'bold' : 'normal',
                cursor: 'pointer',
                textAlign: 'right',
                width: '100%',
                fontSize: '14px',
                fontFamily: 'var(--font-main)',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-dim)' }}>
        <div>السيرفر: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>متصل 🟢</span></div>
        <div>الذاكرة: <span style={{ color: 'var(--text-muted)' }}>Zustand Active</span></div>
      </div>
    </aside>
  );
};
