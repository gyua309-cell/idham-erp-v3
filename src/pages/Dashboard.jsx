import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { DollarSign, ShoppingBag, Users, Boxes, TrendingUp, Sparkles, ArrowUpRight } from 'lucide-react';

export const Dashboard = () => {
  const { products, salesInvoices, purchaseInvoices, customers, setRoute } = useAppStore();

  const totalSales = salesInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const totalStockQty = products.reduce((sum, p) => sum + parseFloat(p.totalQty || 0), 0);
  const totalValuation = products.reduce((sum, p) => sum + (parseFloat(p.totalQty || 0) * parseFloat(p.averageCost || p.costPrice || 0)), 0);

  const formatSAR = (num) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num);

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>لوحة التحكم وإحصائيات المؤسسة</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>مخصصة ومحدثة بالذاكرة السريعة (Zustand Instant Cache)</p>
        </div>
        <div className="badge badge-info" style={{ padding: '6px 14px', fontSize: '13px' }}>
          <Sparkles size={14} style={{ marginLeft: '4px' }} /> ذاكرة فائقة السرعة
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-24">
        {/* Card 1: Sales */}
        <div className="card" style={{ padding: '20px', borderRight: '4px solid var(--accent-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>إجمالي المبيعات المقيدة</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '8px' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>{formatSAR(totalSales)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{salesInvoices.length} فاتورة مبيعات</div>
        </div>

        {/* Card 2: Purchases */}
        <div className="card" style={{ padding: '20px', borderRight: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>إجمالي المشتريات</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '8px', borderRadius: '8px' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>{formatSAR(totalPurchases)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>{purchaseInvoices.length} فاتورة توريد</div>
        </div>

        {/* Card 3: Inventory Valuation */}
        <div className="card" style={{ padding: '20px', borderRight: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>قيمة المخزون المالي</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '8px', borderRadius: '8px' }}>
              <Boxes size={20} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--success)' }}>{formatSAR(totalValuation)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>إجمالي الكمية: {totalStockQty.toLocaleString()} وحدة</div>
        </div>

        {/* Card 4: Customers */}
        <div className="card" style={{ padding: '20px', borderRight: '4px solid var(--info)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>العملاء المسجلين</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)', padding: '8px', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="mono" style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--text-main)' }}>{customers.length} عُملاء</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>نشطون بالنظام</div>
        </div>
      </div>

      {/* Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>أحدث فواتير المبيعات</h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>آخر الحركات المسجلة عبر النظام والمناديب</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setRoute('sales-invoices')}>
              <span>عرض الكل</span> <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>طريقة الدفع</th>
                  <th>المبلغ الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {salesInvoices.slice(0, 6).map(inv => (
                  <tr key={inv.id}>
                    <td className="mono" style={{ fontWeight: 'bold' }}>{inv.number || inv.invoiceNumber || inv.id}</td>
                    <td>{inv.customerName || 'عميل نقدي'}</td>
                    <td className="mono">{inv.date || '-'}</td>
                    <td>
                      <span className={`badge ${inv.paymentMethod === 'cash' ? 'badge-success' : 'badge-info'}`}>
                        {inv.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}
                      </span>
                    </td>
                    <td className="mono font-bold">{formatSAR(inv.total || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>تنبيهات المخزون المتوفر</h2>
            <span className="badge badge-warning">{products.filter(p => (p.totalQty || 0) <= 5).length} أصناف</span>
          </div>
          <div style={{ padding: '12px' }}>
            {products.slice(0, 6).map(p => (
              <div key={p.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: '1px solid var(--border)',
                fontSize: '13px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }} className="mono">SKU: {p.sku || '-'}</div>
                </div>
                <div className="mono font-bold" style={{ color: (p.totalQty || 0) <= 0 ? 'var(--danger)' : 'var(--warning)' }}>
                  {p.totalQty || 0} {p.unit || 'حبة'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
