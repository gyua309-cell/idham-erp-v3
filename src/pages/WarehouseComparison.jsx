import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Columns3, Search, Download, RefreshCw, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export const WarehouseComparison = () => {
  const { products, warehouses, showToast, fetchAllData } = useAppStore();
  const [search, setSearch] = useState('');
  const [hideZero, setHideZero] = useState(true);

  // Sort warehouses: Main warehouse first, Mustafa car second, others after
  const activeWarehouses = [...warehouses].sort((a, b) => {
    if (a.id === "W5uANJjMgfFh2p3xU4bT") return -1;
    if (b.id === "W5uANJjMgfFh2p3xU4bT") return 1;
    if (a.id === "Zyltw7uwvd0aKejdeqQq") return -1;
    if (b.id === "Zyltw7uwvd0aKejdeqQq") return 1;
    return 0;
  });

  const comparisonData = products.map(p => {
    const pId = p.id;
    const whQuantities = {};
    let totalQty = parseFloat(p.totalQty || 0);

    // Calculate per warehouse
    activeWarehouses.forEach(wh => {
      // Find matching stock record or calculate
      const stockDoc = (p.warehouseStock && p.warehouseStock[wh.id]) || 0;
      whQuantities[wh.id] = parseFloat(stockDoc || 0);
    });

    const unitCost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0);
    const totalValuation = Math.round((totalQty * unitCost) * 100) / 100;

    return {
      id: pId,
      sku: p.sku || "-",
      name: p.name || "صنف بدون اسم",
      categoryName: p.categoryName || p.category || "عام",
      unit: p.unit || "حبة",
      whQuantities,
      totalQty,
      unitCost,
      totalValuation
    };
  });

  const filteredData = comparisonData.filter(item => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchSku = item.sku.toLowerCase().includes(search.toLowerCase());
    if (search && !matchName && !matchSku) return false;
    if (hideZero && item.totalQty <= 0) return false;
    return true;
  });

  const formatSAR = (num) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num || 0);

  const exportExcel = () => {
    try {
      const rows = filteredData.map(item => {
        const rowObj = {
          "كود الصنف (SKU)": item.sku,
          "اسم الصنف": item.name,
          "التصنيف": item.categoryName,
          "الوحدة": item.unit,
        };

        activeWarehouses.forEach(w => {
          rowObj[`رصيد ${w.name}`] = item.whQuantities[w.id] || 0;
        });

        rowObj["إجمالي رصيد الكيان"] = item.totalQty;
        rowObj["متوسط التكلفة"] = item.unitCost;
        rowObj["القيمة التراكمية"] = item.totalValuation;

        return rowObj;
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "مقارنة أرصدة المستودعات");
      XLSX.writeFile(wb, `تقرير_مقارنة_أرصدة_المستودعات.xlsx`);
      showToast("تم تصدير ملف الإكسل بنجاح ✅", "success");
    } catch (err) {
      showToast("خطأ أثناء التصدير: " + err.message, "error");
    }
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>تقرير مقارنة أرصدة المستودعات والسيارات (React Engine)</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>جدول حقيقي ديناميكي يربط المستودع الرئيسي وسيارات المناديب بالذاكرة السريعة</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportExcel}>
            <Download size={16} /> <span>تصدير إكسل</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => fetchAllData(true)}>
            <RefreshCw size={16} /> <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card mb-24" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 ابحث باسم الصنف أو الكود (SKU)..."
              className="form-control"
              style={{ paddingRight: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="hideZeroCheck"
              checked={hideZero}
              onChange={(e) => setHideZero(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="hideZeroCheck" style={{ fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
              إخفاء الأصناف ذات الرصيد الصفري
            </label>
          </div>
        </div>
      </div>

      {/* Comparison Data Table */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>مقارنة الأرصدة الحالية لكل صنف</h2>
          <span className="badge badge-info">{filteredData.length} صنف متوفر</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>كود الصنف (SKU)</th>
                <th>اسم الصنف</th>
                <th>التصنيف</th>
                <th>الوحدة</th>
                {activeWarehouses.map(w => (
                  <th key={w.id} style={{ textAlign: 'center', background: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-primary)' }}>
                    {w.name}
                  </th>
                ))}
                <th style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>إجمالي الرصيد</th>
                <th style={{ textAlign: 'left' }}>متوسط التكلفة</th>
                <th style={{ textAlign: 'left' }}>القيمة التراكمية</th>
                <th style={{ textAlign: 'center' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td className="mono" style={{ fontWeight: 'bold' }}>{item.sku}</td>
                  <td style={{ fontWeight: 'bold' }}>{item.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.categoryName}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.unit}</td>
                  {activeWarehouses.map(w => (
                    <td key={w.id} style={{ textAlign: 'center' }} className="mono font-bold">
                      {item.whQuantities[w.id] || 0}
                    </td>
                  ))}
                  <td className="mono font-bold" style={{ textAlign: 'center', color: 'var(--success)' }}>
                    {item.totalQty}
                  </td>
                  <td style={{ textAlign: 'left' }} className="mono">{formatSAR(item.unitCost)}</td>
                  <td style={{ textAlign: 'left' }} className="mono font-bold">{formatSAR(item.totalValuation)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${item.totalQty > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {item.totalQty > 0 ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
