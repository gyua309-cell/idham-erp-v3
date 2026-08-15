import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Users, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export const ConsolidatedBalances = () => {
  const { customers, suppliers, salesInvoices, purchaseInvoices, showToast } = useAppStore();
  const [search, setSearch] = useState('');
  const [partyType, setPartyType] = useState('ALL');

  const customerList = customers.map(c => ({
    id: c.id,
    name: c.name || c.displayName || 'عميل',
    code: c.code || c.number || 'CUS-' + c.id.slice(0, 4),
    type: 'عميل',
    phone: c.phone || c.mobile || '-',
    balance: parseFloat(c.balance || c.currentBalance || 0)
  }));

  const supplierList = suppliers.map(s => ({
    id: s.id,
    name: s.name || s.displayName || 'مورد',
    code: s.code || s.number || 'SUP-' + s.id.slice(0, 4),
    type: 'مورد',
    phone: s.phone || s.mobile || '-',
    balance: parseFloat(s.balance || s.currentBalance || 0)
  }));

  const combined = [...customerList, ...supplierList].filter(item => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCode = item.code.toLowerCase().includes(search.toLowerCase());
    const matchType = partyType === 'ALL' || item.type === partyType;
    return (matchName || matchCode) && matchType;
  });

  const totalDebtors = combined.filter(i => i.balance > 0).reduce((s, i) => s + i.balance, 0);
  const totalCreditors = combined.filter(i => i.balance < 0).reduce((s, i) => s + Math.abs(i.balance), 0);

  const formatSAR = (num) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(num || 0);

  const exportExcel = () => {
    try {
      const rows = combined.map(i => ({
        "الكود": i.code,
        "الاسم": i.name,
        "النوع": i.type,
        "الهاتف": i.phone,
        "الرصيد النهائي (ر.س)": i.balance,
        "الحالة المالية": i.balance > 0 ? "مدين" : i.balance < 0 ? "دائن" : "متزن"
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "أرصدة العملاء والموردين");
      XLSX.writeFile(wb, "تقرير_أرصدة_العملاء_والموردين.xlsx");
      showToast("تم التصدير بنجاح ✅", "success");
    } catch (e) {
      showToast("خطأ أثناء التصدير: " + e.message, "error");
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>تقرير أرصدة العملاء والموردين المجمع</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>تقرير مالي شامل ومجمع يعرض الرصيد النهائي لكل عميل ومورد</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportExcel}>
          <Download size={16} /> <span>تصدير إكسل</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid-4 mb-24">
        <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>إجمالي الذمم المدينة (لنا)</div>
          <div className="mono font-bold" style={{ fontSize: '20px', color: 'var(--accent-primary)', marginTop: '4px' }}>{formatSAR(totalDebtors)}</div>
        </div>

        <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>إجمالي الذمم الدائنة (علينا)</div>
          <div className="mono font-bold" style={{ fontSize: '20px', color: 'var(--warning)', marginTop: '4px' }}>{formatSAR(totalCreditors)}</div>
        </div>

        <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--success)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>صافي الرصيد العام</div>
          <div className="mono font-bold" style={{ fontSize: '20px', color: 'var(--success)', marginTop: '4px' }}>{formatSAR(totalDebtors - totalCreditors)}</div>
        </div>

        <div className="card" style={{ padding: '16px', borderRight: '4px solid var(--info)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>إجمالي السجلات</div>
          <div className="mono font-bold" style={{ fontSize: '20px', color: 'var(--text-main)', marginTop: '4px' }}>{combined.length} سجل</div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card mb-24" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم العميل أو المورد أو الكود..."
              className="form-control"
              style={{ paddingRight: '38px' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select value={partyType} onChange={(e) => setPartyType(e.target.value)} className="form-control">
              <option value="ALL">جميع الأطراف (عميل/مورد)</option>
              <option value="عميل">العملاء فقط</option>
              <option value="مورد">الموردين فقط</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>جدول الأرصدة المجمع</h2>
          <span className="badge badge-info">{combined.length} سجلات</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>كود الحساب</th>
                <th>اسم العميل / المورد</th>
                <th>النوع</th>
                <th>الهاتف</th>
                <th style={{ textAlign: 'left' }}>الرصيد المالي النهائي</th>
                <th style={{ textAlign: 'center' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {combined.map(i => (
                <tr key={i.id}>
                  <td className="mono" style={{ fontWeight: 'bold' }}>{i.code}</td>
                  <td style={{ fontWeight: 'bold' }}>{i.name}</td>
                  <td>
                    <span className={`badge ${i.type === 'عميل' ? 'badge-info' : 'badge-warning'}`}>
                      {i.type}
                    </span>
                  </td>
                  <td className="mono" style={{ color: 'var(--text-muted)' }}>{i.phone}</td>
                  <td style={{ textAlign: 'left' }} className="mono font-bold">
                    {formatSAR(i.balance)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${i.balance > 0 ? 'badge-danger' : i.balance < 0 ? 'badge-success' : 'badge-info'}`}>
                      {i.balance > 0 ? 'مدين (لنا)' : i.balance < 0 ? 'دائن (علينا)' : 'متزن (0.00)'}
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
