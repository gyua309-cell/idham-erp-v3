const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js/modules/quotations.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the exact block to replace
const startMarker = '  tbody.innerHTML = list.map(q => {';
const endMarker = '}\n\n// ── Client-side filter';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

console.log('Found block at:', startIdx, '-', endIdx);

const before = content.slice(0, startIdx);
const after = content.slice(endIdx);

const newBlock = `  tbody.innerHTML = list.map(q => {
    const isExpired = q.status !== 'converted' && q.status !== 'accepted'
      && q.expiryDate && q.expiryDate < todayString();
    const canConvert = q.status !== 'converted';
    return \`
      <tr class="qt-row" data-id="\${q.id}" style="cursor:pointer;">
        <td class="mono text-indigo font-bold">\${q.quoteNumber || '—'}</td>
        <td class="dim">\${isoToDisplay(q.date)}</td>
        <td><strong>\${q.customerName || '—'}</strong></td>
        <td class="dim">\${q.repName || '—'}</td>
        <td style="text-align:center;" class="mono">\${(q.items||[]).length}</td>
        <td class="mono font-bold">\${formatCurrency(q.grandTotal || 0)}</td>
        <td>\${isExpired ? statusBadge('expired') : statusBadge(q.status)}</td>
        <td class="\${isExpired ? 'text-bad' : ''}">\${isoToDisplay(q.expiryDate)}</td>
        <td class="qt-actions-cell">
          <div class="row-actions" style="display:flex;gap:2px;flex-wrap:nowrap;">
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="print" data-id="\${q.id}" title="طباعة">🖨️</button>
            \${canConvert ? '<button class="btn btn-icon sm btn-ghost qt-act" data-action="convert" data-id="' + q.id + '" style="color:var(--brand);" title="تحويل لفاتورة">🔄</button>' : ''}
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="dup"  data-id="\${q.id}" title="تكرار">📋</button>
            <button class="btn btn-icon sm btn-ghost qt-act" data-action="edit" data-id="\${q.id}" title="تعديل">✏️</button>
            <button class="btn btn-icon sm btn-ghost qt-act text-bad" data-action="del" data-id="\${q.id}" title="حذف">🗑️</button>
          </div>
        </td>
      </tr>\`;
  }).join('');

  // Delegated event listener — replaces all inline onclick handlers
  // This avoids ID-escaping bugs and event propagation issues
  if (!tbody._qtListenerAttached) {
    tbody._qtListenerAttached = true;
    tbody.addEventListener('click', function qtHandler(e) {
      const actBtn = e.target.closest('.qt-act');
      if (actBtn) {
        e.stopPropagation();
        const id     = actBtn.dataset.id;
        const action = actBtn.dataset.action;
        if      (action === 'edit')    { const q = quotations.find(x => x.id === id); if (q) openQuoteForm(q); }
        else if (action === 'del')     { const q = quotations.find(x => x.id === id); deleteQuote(id, q ? q.quoteNumber || '' : ''); }
        else if (action === 'dup')     { const q = quotations.find(x => x.id === id); if (q) duplicateQuote(id); }
        else if (action === 'convert') { convertQuoteToInvoice(id); }
        else if (action === 'print')   { printQuote(id); }
        return;
      }
      const row = e.target.closest('.qt-row');
      if (row && !e.target.closest('.qt-actions-cell')) {
        viewQuote(row.dataset.id, e);
      }
    });
  }
`;

const result = before + newBlock + after;
fs.writeFileSync(filePath, result, 'utf8');
console.log('SUCCESS! New file length:', result.length);
