const fs = require('fs');

let content = fs.readFileSync('js/modules/sales-invoices.js', 'utf8');
const hadCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// 1. In addProductLine:
const target1 = `  const initialPrice = defaultToAlt ? basePricePerUnit : (parsedFactor > 1 ? parseFloat((basePricePerUnit / parsedFactor).toFixed(4)) : basePricePerUnit);
  const selectedUnit = defaultToAlt ? altUnit : unit;`;

const replacement1 = `  const initialPrice = defaultToAlt ? basePricePerUnit : (parsedFactor > 1 ? parseFloat((basePricePerUnit / parsedFactor).toFixed(4)) : basePricePerUnit);
  const selectedUnit = defaultToAlt ? altUnit : unit;

  // Auto-calculate broker markup (+1%) if customer has broker commission
  let lineUnitPrice = initialPrice;
  let lineBasePrice = initialPrice;
  let lineCommPerUnit = 0;
  if (selectedCustomer?.hasBrokerCommission && selectedCustomer?.brokerRate > 0) {
    const rate = parseFloat(selectedCustomer.brokerRate) || 1.0;
    lineUnitPrice = parseFloat((initialPrice * (1 + rate / 100)).toFixed(2));
    lineBasePrice = initialPrice;
    lineCommPerUnit = parseFloat((lineUnitPrice - lineBasePrice).toFixed(2));
  }`;

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('1. addProductLine markup check added!');
} else {
  console.error('target1 not found');
}

// 2. In renderInvoiceLines: unit price cell
const target2 = `      <td style="padding:6px 10px;width:110px;">
        <input type="number" class="input mono" style="width:100px;height:30px;font-size:12px;"
          value="\${line.unitPrice}" min="0" step="0.01"
          onchange="updateLine(\${i},'unitPrice',this.value)" />
      </td>`;

const replacement2 = `      <td style="padding:6px 10px;width:\${selectedCustomer?.hasBrokerCommission ? '135px' : '110px'};">
        <input type="number" class="input mono" style="width:105px;height:30px;font-size:12px;font-weight:bold;"
          value="\${(selectedCustomer?.hasBrokerCommission && line.basePrice !== undefined) ? line.basePrice : line.unitPrice}" min="0" step="0.01"
          title="\${selectedCustomer?.hasBrokerCommission ? 'أدخل سعر الاتفاق الأساسي وسيضاف عليه الـ 1% تلقائياً' : 'سعر الوحدة'}"
          onchange="updateLine(\${i},'unitPrice',this.value)" />
        \${selectedCustomer?.hasBrokerCommission ? \`
          <div style="font-size:9.5px; color:#0284c7; font-weight:800; margin-top:2px; white-space:nowrap;">
            سعر الفاتورة: <strong>\${line.unitPrice}</strong> <span style="font-size:8.5px; color:#059669;">(+\${selectedCustomer.brokerRate}%)</span>
          </div>
        \` : ''}
      </td>`;

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log('2. renderInvoiceLines unit price cell updated!');
} else {
  console.error('target2 not found');
}

// 3. In updateLine:
const target3 = `window.updateLine = (idx, field, val) => {
  invoiceLines[idx][field] = parseFloat(val) || 0;
  renderInvoiceLines();
  updateInvoiceTotals();
};`;

const replacement3 = `window.updateLine = (idx, field, val) => {
  const line = invoiceLines[idx];
  if (!line) return;
  const numVal = parseFloat(val) || 0;

  if (field === 'unitPrice' && selectedCustomer?.hasBrokerCommission && selectedCustomer?.brokerRate > 0) {
    const rate = parseFloat(selectedCustomer.brokerRate) || 1.0;
    const baseP = numVal;
    const finalP = parseFloat((baseP * (1 + rate / 100)).toFixed(2));
    line.basePrice = baseP;
    line.unitPrice = finalP;
    line.brokerCommissionPerUnit = parseFloat((finalP - baseP).toFixed(2));
    line.brokerCommissionTotal = parseFloat((line.brokerCommissionPerUnit * (parseFloat(line.qty) || 0)).toFixed(2));
  } else {
    line[field] = numVal;
    if (field === 'qty' && selectedCustomer?.hasBrokerCommission && line.brokerCommissionPerUnit) {
      line.brokerCommissionTotal = parseFloat((line.brokerCommissionPerUnit * numVal).toFixed(2));
    }
  }

  renderInvoiceLines();
  updateInvoiceTotals();
};`;

if (content.includes(target3)) {
  content = content.replace(target3, replacement3);
  console.log('3. updateLine updated!');
} else {
  console.error('target3 not found');
}

// 4. In invoiceData:
const target4 = `      autoDiscountRate: window._autoDiscountRate || 0,
      stockStatus:   "pending_deduction",
    };`;

const replacement4 = `      autoDiscountRate: window._autoDiscountRate || 0,
      stockStatus:   "pending_deduction",
      hasBrokerCommission:   !!selectedCustomer?.hasBrokerCommission,
      brokerName:            selectedCustomer?.brokerName || "",
      brokerRate:            parseFloat(selectedCustomer?.brokerRate) || 0,
      brokerTrigger:         selectedCustomer?.brokerTrigger || "on_payment",
      brokerAccountCode:     selectedCustomer?.brokerAccountCode || "2-1-4-2",
      brokerExpenseCode:     selectedCustomer?.brokerExpenseCode || "5-4-10",
      brokerCommissionTotal: selectedCustomer?.hasBrokerCommission 
        ? Math.round(invoiceLines.reduce((s, l) => s + (parseFloat(l.brokerCommissionTotal) || (l.unitPrice ? (l.unitPrice - (l.basePrice || (l.unitPrice / 1.01))) * (parseFloat(l.qty) || 0) : 0)), 0) * 100) / 100 || Math.round(subtotal * (parseFloat(selectedCustomer.brokerRate || 1) / 100) * 100) / 100
        : 0,
      brokerCommissionStatus: selectedCustomer?.hasBrokerCommission ? (payment === "cash" ? "earned" : "pending_payment") : "none",
      brokerCommissionEarned: selectedCustomer?.hasBrokerCommission && payment === "cash" 
        ? Math.round(subtotal * (parseFloat(selectedCustomer.brokerRate || 1) / 100) * 100) / 100 
        : 0,
    };`;

if (content.includes(target4)) {
  content = content.replace(target4, replacement4);
  console.log('4. invoiceData updated!');
} else {
  console.error('target4 not found');
}

if (hadCrlf) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync('js/modules/sales-invoices.js', content, 'utf8');
console.log('Done!');
