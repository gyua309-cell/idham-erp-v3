// ============================================================
// IDHAM ERP — Universal Record Actions
// Preview Modal + Individual PDF Print for any entity
// ============================================================

/**
 * Show a beautiful preview modal for any record
 * @param {object} options
 * @param {string} options.title      - Modal title
 * @param {string} options.icon       - Emoji icon
 * @param {string} options.badgeText  - Badge text (optional)
 * @param {string} options.badgeColor - Badge color class: good/warn/bad/info
 * @param {Array}  options.sections   - Array of { heading, rows: [{label, value, mono, badge}] }
 * @param {Array}  options.actions    - Array of { label, icon, fn, style }
 * @param {string} options.id         - Unique overlay id
 */
export function showRecordPreview({ title, icon = '📋', badgeText, badgeColor = 'info', sections = [], actions = [], id = 'record-preview-overlay' }) {
  // Remove existing
  document.getElementById(id)?.remove();

  const sectionsHtml = sections.map(sec => `
    <div style="margin-bottom:20px;">
      ${sec.heading ? `<div style="font-size:11px;font-weight:700;color:var(--text-2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border-soft);">${sec.heading}</div>` : ''}
      <div style="display:grid;gap:8px;">
        ${sec.rows.map(r => r ? `
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:var(--text-2);min-width:130px;flex-shrink:0;">${r.label}</span>
            <span style="${r.mono ? 'font-family:monospace;' : ''}font-size:13px;color:var(--text-1);font-weight:${r.bold ? '700' : '500'};">${
              r.badge
                ? `<span class="badge ${r.badge}">${r.value ?? '—'}</span>`
                : (r.value !== undefined && r.value !== null && r.value !== '') ? r.value : '<span style="color:var(--text-2);">—</span>'
            }</span>
          </div>
        ` : '').join('')}
      </div>
    </div>
  `).join('');

  const actionsHtml = actions.map(a => `
    <button class="btn" style="${a.style || 'background:var(--bg-2);color:var(--text-1);'}" onclick="${a.fn}">
      ${a.icon} ${a.label}
    </button>
  `).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = id;
  overlay.innerHTML = `
    <div class="modal" style="max-width:560px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
      <div class="modal-header" style="background:linear-gradient(135deg,var(--brand),var(--brand-light));padding:20px 24px;">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <span style="font-size:28px;">${icon}</span>
          <div>
            <div class="modal-title" style="color:#fff;font-size:17px;">${title}</div>
            ${badgeText ? `<span class="badge ${badgeColor}" style="margin-top:4px;">${badgeText}</span>` : ''}
          </div>
        </div>
        <button class="modal-close" style="color:#fff;opacity:0.8;" onclick="document.getElementById('${id}').remove()">×</button>
      </div>
      <div class="modal-body" style="flex:1;overflow-y:auto;padding:20px 24px;">
        ${sectionsHtml}
      </div>
      <div class="modal-footer" style="gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="document.getElementById('${id}').remove()">إغلاق</button>
        ${actionsHtml}
      </div>
    </div>
  `;

  // Close on backdrop click
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

/**
 * Print a record as a styled document
 * @param {object} options - same fields as showRecordPreview
 */
export function printRecord({ title, icon = '📋', sections = [], companyName = 'إدهام للمواد الغذائية' }) {
  const sectionsHtml = sections.map(sec => `
    <div class="section">
      ${sec.heading ? `<div class="sec-title">${sec.heading}</div>` : ''}
      <table>
        ${sec.rows.filter(Boolean).map(r => `
          <tr>
            <td class="lbl">${r.label}</td>
            <td class="val" ${r.mono ? 'style="font-family:monospace;"' : ''}>${r.value ?? '—'}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `).join('');

  const now = new Date().toLocaleString('ar-SA');
  const win = window.open('', '_blank', 'width=700,height=900');
  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title} — ${companyName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Cairo', sans-serif; background: #fff; color: #1e293b; padding: 32px; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 3px solid #1E3A8A; margin-bottom: 24px; }
        .header-title { font-size: 22px; font-weight: 700; color: #1E3A8A; }
        .header-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
        .company { text-align: left; font-size: 12px; color: #64748b; line-height: 1.6; }
        .section { margin-bottom: 20px; page-break-inside: avoid; }
        .sec-title { font-size: 11px; font-weight: 700; color: #1E3A8A; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; }
        tr:nth-child(even) td { background: #f8fafc; }
        td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 12.5px; }
        td.lbl { width: 35%; font-weight: 600; color: #475569; background: #f1f5f9 !important; }
        td.val { color: #1e293b; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        @media print { body { padding: 16px; } button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="header-title">${icon} ${title}</div>
          <div class="header-sub">تاريخ الطباعة: ${now}</div>
        </div>
        <div class="company">
          <strong>إدهام للمواد الغذائية</strong><br>
          نظام إدارة الموارد (ERP)
        </div>
      </div>
      ${sectionsHtml}
      <div class="footer">إدهام للمواد الغذائية — جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
      <script>setTimeout(() => { window.print(); window.close(); }, 600);<\/script>
    </body>
    </html>
  `);
  win.document.close();
}

/**
 * Export a single record as PDF via print dialog
 * (same as printRecord but with PDF-oriented hint)
 */
export const exportRecordPDF = printRecord;
