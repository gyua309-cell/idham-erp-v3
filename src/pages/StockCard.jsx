import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FileText, Search, Filter } from 'lucide-react';

export const StockCard = () => {
  const { products, warehouses, stockTransactions } = useAppStore();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('ALL');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Filter transactions for product
  const productTxs = stockTransactions.filter(t => t.productId === selectedProductId);

  // Warehouse filter
  const filteredTxs = productTxs.filter(t => {
    if (selectedWarehouseId !== 'ALL' && t.warehouseId !== selectedWarehouseId) return false;
    return true;
  }).sort((a, b) => {
    const getDateStr = (t) => {
      if (t.date) return t.date;
      let secs = t.createdAt?.seconds || t.createdAt?._seconds;
      if (secs) return new Date(secs * 1000).toISOString().split("T")[0];
      return "2026-07-20";
    };

    const dateA = getDateStr(a);
    const dateB = getDateStr(b);
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const typePriority = {
      "purchase_in": 1,
      "transfer_in": 1,
      "sale_cancel": 2,
      "sale_out": 3,
      "transfer_out": 4,
      "purchase_return": 4
    };
    const prioA = typePriority[a.type] || 5;
    const prioB = typePriority[b.type] || 5;
    if (prioA !== prioB) return prioA - prioB;

    const secA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
    const secB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
    return secA - secB;
  });

  const getFormatDate = (t) => {
    if (t.date) return t.date;
    if (t.createdAt?.seconds) {
      return new Date(t.createdAt.seconds * 1000).toISOString().split('T')[0];
    }
    return '2026-07-20';
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>تقرير كرت الصنف التفصيلي (Stock Card Ledger)</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>سجل حركات الصنف التراكمي في كل مستودع باليوم والساعة</p>
      </div>

      {/* Selector Card */}
      <div className="card mb-24" style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>اختر الصنف</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="form-control"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} — (SKU: {p.sku || '-'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>اختر المستودع</label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="form-control"
            >
              <option value="ALL">جميع المستودعات</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Summary Header */}
      {selectedProduct && (
        <div className="grid-4 mb-24">
          <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--accent-primary)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>اسم الصنف</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{selectedProduct.name}</div>
          </div>

          <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--info)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>كود الصنف (SKU)</div>
            <div className="mono" style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{selectedProduct.sku || '-'}</div>
          </div>

          <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--success)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>إجمالي رصيد الصنف</div>
            <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)', marginTop: '4px' }}>{selectedProduct.totalQty || 0} {selectedProduct.unit || 'حبة'}</div>
          </div>

          <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--warning)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>عدد الحركات المسجلة</div>
            <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '4px' }}>{filteredTxs.length} حركة</div>
          </div>
        </div>
      )}

      {/* Ledger Table Card */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>سجل الحركات التفصيلي للصنف</h2>
          <span className="badge badge-info">{filteredTxs.length} حركات في السجل</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المستودع</th>
                <th>نوع الحركة</th>
                <th style={{ textAlign: 'center' }}>الكمية (+/-)</th>
                <th style={{ textAlign: 'center' }}>الرصيد بعد الحركة</th>
                <th>الملاحظات والمستند</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    لا توجد حركات مسجلة لهذا الصنف بالمستودع المحدد.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx, idx) => {
                  const qtyChange = parseFloat(tx.qtyChange || 0);
                  const isPositive = qtyChange > 0;
                  const wh = warehouses.find(w => w.id === tx.warehouseId);

                  return (
                    <tr key={tx.id || idx}>
                      <td className="mono">{getFormatDate(tx)}</td>
                      <td style={{ fontWeight: 'bold' }}>{wh ? wh.name : 'المستودع الرئيسي'}</td>
                      <td>
                        <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>
                          {tx.type || 'حركة مخزنية'}
                        </span>
                      </td>
                      <td className="mono font-bold" style={{ textAlign: 'center', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                        {isPositive ? `+${qtyChange}` : qtyChange}
                      </td>
                      <td style={{ textAlign: 'center' }} className="mono font-bold">{tx.qtyAfter ?? '-'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{tx.notes || tx.sourceId || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
