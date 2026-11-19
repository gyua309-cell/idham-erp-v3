const fs = require('fs');
const path = require('path');

const targetFiles = [
  'E:/ادهام للمواد الغذائية/js/modules/sales-invoices.js',
  'D:/ادهام للمنتجات الغذائية/cloud-server-edition/web-client/js/modules/sales-invoices.js',
  'D:/ادهام للمنتجات الغذائية/src/js/modules/sales-invoices.js'
];

const engineCode = `
// ============================================================
// 🏷️ LAST SELLING PRICE TO CUSTOMER ENGINE
// ============================================================
const _customerInvoicesCache = {};

async function loadCustomerRecentInvoices(customerId) {
  if (!customerId) return [];
  if (_customerInvoicesCache[customerId]) {
    return _customerInvoicesCache[customerId];
  }
  try {
    const q = query(
      COLS.salesInvoices(),
      where("customerId", "==", customerId),
      orderBy("date", "desc"),
      limit(40)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    _customerInvoicesCache[customerId] = list;
    return list;
  } catch (err) {
    try {
      const qFallback = query(
        COLS.salesInvoices(),
        where("customerId", "==", customerId),
        limit(50)
      );
      const snap = await getDocs(qFallback);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      _customerInvoicesCache[customerId] = list;
      return list;
    } catch (e2) {
      console.warn("Could not fetch customer invoices for price history:", e2);
      return [];
    }
  }
}

function findLastPriceForProduct(recentInvoices, productId, currentUnit = null) {
  if (!recentInvoices || !recentInvoices.length || !productId) return null;
  
  // 1. First priority: match productId AND same unit
  for (const inv of recentInvoices) {
    if (inv.status === "cancelled" || inv.status === "draft") continue;
    const items = inv.lines || inv.items || [];
    const exact = items.find(it => (it.productId === productId || it.id === productId) && currentUnit && (it.selectedUnit === currentUnit || it.unit === currentUnit));
    if (exact && exact.unitPrice !== undefined) {
      return {
        price: parseFloat(exact.unitPrice) || 0,
        invoiceNumber: inv.number || inv.invoiceNumber || inv.id,
        date: inv.date || '',
        unit: exact.selectedUnit || exact.unit || currentUnit,
        qty: exact.qty || 1
      };
    }
  }
  
  // 2. Second priority: match productId (any unit)
  for (const inv of recentInvoices) {
    if (inv.status === "cancelled" || inv.status === "draft") continue;
    const items = inv.lines || inv.items || [];
    const match = items.find(it => (it.productId === productId || it.id === productId));
    if (match && match.unitPrice !== undefined) {
      return {
        price: parseFloat(match.unitPrice) || 0,
        invoiceNumber: inv.number || inv.invoiceNumber || inv.id,
        date: inv.date || '',
        unit: match.selectedUnit || match.unit || '',
        qty: match.qty || 1
      };
    }
  }
  return null;
}

async function attachLastPriceToLine(lineIdx, customerId, productId, currentUnit) {
  if (!productId) return;
  const line = invoiceLines[lineIdx];
  if (!line) return;

  if (customerId) {
    const recentInvoices = await loadCustomerRecentInvoices(customerId);
    const info = findLastPriceForProduct(recentInvoices, productId, currentUnit);
    if (line && (line.productId === productId)) {
      if (info) {
        line.lastCustomerPrice = info.price;
        line.lastCustomerInvoiceNumber = info.invoiceNumber;
        line.lastCustomerInvoiceDate = info.date;
        line.lastCustomerUnit = info.unit;
        line.isFirstTimeForCustomer = false;
      } else {
        line.lastCustomerPrice = null;
        line.isFirstTimeForCustomer = true;
      }
      renderInvoiceLines();
    }
  }
}

async function refreshLastPricesForCustomer(customerId) {
  if (!customerId || invoiceLines.length === 0) return;
  const recentInvoices = await loadCustomerRecentInvoices(customerId);
  for (let i = 0; i < invoiceLines.length; i++) {
    const line = invoiceLines[i];
    if (line && line.productId) {
      const info = findLastPriceForProduct(recentInvoices, line.productId, line.selectedUnit || line.unit);
      if (info) {
        line.lastCustomerPrice = info.price;
        line.lastCustomerInvoiceNumber = info.invoiceNumber;
        line.lastCustomerInvoiceDate = info.date;
        line.lastCustomerUnit = info.unit;
        line.isFirstTimeForCustomer = false;
      } else {
        line.lastCustomerPrice = null;
        line.isFirstTimeForCustomer = true;
      }
    }
  }
  renderInvoiceLines();
}

window.applyLastCustomerPrice = (index) => {
  const line = invoiceLines[index];
  if (!line || line.lastCustomerPrice === undefined || line.lastCustomerPrice === null) return;
  const p = parseFloat(line.lastCustomerPrice) || 0;
  
  if (selectedCustomer?.hasBrokerCommission && selectedCustomer?.brokerRate > 0) {
    const rate = parseFloat(selectedCustomer.brokerRate) || 1.0;
    line.basePrice = p;
    line.unitPrice = parseFloat((p * (1 + rate / 100)).toFixed(2));
    line.brokerCommissionPerUnit = parseFloat((line.unitPrice - line.basePrice).toFixed(2));
    line.brokerCommissionTotal = parseFloat((line.brokerCommissionPerUnit * (parseFloat(line.qty) || 0)).toFixed(2));
  } else {
    line.unitPrice = p;
    line.basePrice = p;
  }
  
  renderInvoiceLines();
  updateInvoiceTotals();
  
  if (window.showToast) {
    window.showToast('✅ تم تطبيق آخر سعر بيع للعميل (' + formatCurrency(p) + ') على صنف: ' + line.productName, 'success', 2500);
  }
};
`;

// Also update the price TD to show clear badge when it's the first time for customer!
const oldTdPattern = `        \${(line.lastCustomerPrice !== undefined && line.lastCustomerPrice !== null) ? \`
          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:3px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:1px 5px; font-size:10px; color:#1e40af; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.03);"
               title="آخر بيع لهذا العميل: فاتورة #\${line.lastCustomerInvoiceNumber || ''} بتاريخ \${line.lastCustomerInvoiceDate || ''}">
            <span>🏷️ آخر بيع: <strong>\${line.lastCustomerPrice}</strong>\${line.lastCustomerUnit && line.lastCustomerUnit !== line.selectedUnit ? \` (\${translateUnit(line.lastCustomerUnit)})\` : ''}</span>
            \${Number(line.lastCustomerPrice) !== Number(line.unitPrice) ? \`
              <button type="button" onclick="window.applyLastCustomerPrice(\${i})" 
                      style="border:none; background:#2563eb; color:#fff; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:3px; cursor:pointer; line-height:1.2;"
                      title="تطبيق آخر سعر بيع (\${line.lastCustomerPrice} ر.س)">
                تطبيق
              </button>
            \` : '<span style="color:#059669; font-weight:800; font-size:9px;">(مطابق)</span>'}
          </div>
        \` : ''}`;

const newTdPattern = `        \${(line.lastCustomerPrice !== undefined && line.lastCustomerPrice !== null) ? \`
          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:3px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:4px; padding:1px 5px; font-size:10px; color:#1e40af; white-space:nowrap; box-shadow:0 1px 2px rgba(0,0,0,0.03);"
               title="آخر بيع لهذا العميل: فاتورة #\${line.lastCustomerInvoiceNumber || ''} بتاريخ \${line.lastCustomerInvoiceDate || ''}">
            <span>🏷️ آخر بيع: <strong>\${line.lastCustomerPrice}</strong>\${line.lastCustomerUnit && line.lastCustomerUnit !== line.selectedUnit ? \` (\${translateUnit(line.lastCustomerUnit)})\` : ''}</span>
            \${Number(line.lastCustomerPrice) !== Number(line.unitPrice) ? \`
              <button type="button" onclick="window.applyLastCustomerPrice(\${i})" 
                      style="border:none; background:#2563eb; color:#fff; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:3px; cursor:pointer; line-height:1.2;"
                      title="تطبيق آخر سعر بيع (\${line.lastCustomerPrice} ر.س)">
                تطبيق
              </button>
            \` : '<span style="color:#059669; font-weight:800; font-size:9px;">(مطابق)</span>'}
          </div>
        \` : (selectedCustomer?.id && line.isFirstTimeForCustomer ? \`
          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:2px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:4px; padding:1px 4px; font-size:9.5px; color:#64748b; white-space:nowrap;"
               title="لم يسبق بيع هذا الصنف لهذا العميل من قبل">
            <span>ℹ️ أول بيع للعميل</span>
          </div>
        \` : '')}`;

for (const f of targetFiles) {
  if (!fs.existsSync(f)) {
    console.log('Skipping ' + f + ' (not found)');
    continue;
  }
  let c = fs.readFileSync(f, 'utf8');
  
  // 1. Inject engine functions if missing
  if (!c.includes('loadCustomerRecentInvoices')) {
    const target = 'window.selectCustomer = (id, name, creditLimit, balance) => {';
    if (c.includes(target)) {
      c = c.replace(target, engineCode + '\n' + target);
      console.log('Injected engineCode in: ' + f);
    } else {
      console.warn('Could not find window.selectCustomer target in: ' + f);
    }
  } else {
    console.log('Engine functions already exist in: ' + f);
  }

  // 2. Update price TD badge
  if (c.includes(oldTdPattern)) {
    c = c.replace(oldTdPattern, newTdPattern);
    console.log('Updated price TD badge in: ' + f);
  }

  fs.writeFileSync(f, c, 'utf8');
  console.log('Updated file: ' + f);
}
