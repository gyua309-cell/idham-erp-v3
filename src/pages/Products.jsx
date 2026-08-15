import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Search, Plus, Filter, Download, Package } from 'lucide-react';

export const Products = () => {
  const { products, showToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const categories = Array.from(new Set(products.map(p => p.categoryName || p.category || 'عام'))).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchName = (p.name || '').toLowerCase().includes(search.toLowerCase());
    const matchSku = (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || (p.categoryName || p.category) === categoryFilter;
    return (matchName || matchSku) && matchCat;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatSAR = (num) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num || 0);

  return (
    <div className="page-container">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>إدارة الأصناف والدليل المخزني</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>إجمالي الأصناف المسجلة: {products.length} صنف</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-24" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="ابحث باسم الصنف أو الكود (SKU)..."
              className="form-control"
              style={{ paddingRight: '38px' }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '200px' }}>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="form-control"
            >
              <option value="ALL">جميع التصنيفات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>قائمة الأصناف ({filteredProducts.length} صنف)</span>
          <span className="badge badge-info">صفحة {currentPage} من {totalPages}</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>كود الصنف (SKU)</th>
                <th>اسم الصنف</th>
                <th>التصنيف</th>
                <th>الوحدة</th>
                <th style={{ textAlign: 'center' }}>إجمالي الرصيد</th>
                <th style={{ textAlign: 'left' }}>متوسط التكلفة</th>
                <th style={{ textAlign: 'left' }}>سعر البيع</th>
                <th style={{ textAlign: 'left' }}>القيمة التراكمية</th>
                <th style={{ textAlign: 'center' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(p => {
                const totalQty = parseFloat(p.totalQty || 0);
                const cost = parseFloat(p.averageCost || p.costPrice || p.purchasePrice || 0);
                const price = parseFloat(p.salePrice || p.price || 0);
                const valuation = totalQty * cost;

                return (
                  <tr key={p.id}>
                    <td className="mono" style={{ fontWeight: 'bold' }}>{p.sku || '-'}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.categoryName || p.category || 'عام'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.unit || 'حبة'}</td>
                    <td style={{ textAlign: 'center' }} className="mono font-bold">{totalQty}</td>
                    <td style={{ textAlign: 'left' }} className="mono">{formatSAR(cost)}</td>
                    <td style={{ textAlign: 'left' }} className="mono">{formatSAR(price)}</td>
                    <td className="mono font-bold" style={{ textAlign: 'left', color: 'var(--success)' }}>{formatSAR(valuation)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${totalQty > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {totalQty > 0 ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="btn btn-secondary btn-sm"
          >
            السابق
          </button>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>الصفحة {currentPage} من {totalPages}</span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="btn btn-secondary btn-sm"
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
};
