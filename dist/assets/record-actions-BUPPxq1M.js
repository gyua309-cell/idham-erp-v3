function m({title:l,icon:s="📋",badgeText:d,badgeColor:r="info",sections:p=[],actions:c=[],id:o="record-preview-overlay"}){document.getElementById(o)?.remove();const i=p.map(e=>`
    <div style="margin-bottom:20px;">
      ${e.heading?`<div style="font-size:11px;font-weight:700;color:var(--text-2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border-soft);">${e.heading}</div>`:""}
      <div style="display:grid;gap:8px;">
        ${e.rows.map(t=>t?`
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:var(--text-2);min-width:130px;flex-shrink:0;">${t.label}</span>
            <span style="${t.mono?"font-family:monospace;":""}font-size:13px;color:var(--text-1);font-weight:${t.bold?"700":"500"};">${t.badge?`<span class="badge ${t.badge}">${t.value??"—"}</span>`:t.value!==void 0&&t.value!==null&&t.value!==""?t.value:'<span style="color:var(--text-2);">—</span>'}</span>
          </div>
        `:"").join("")}
      </div>
    </div>
  `).join(""),n=c.map(e=>`
    <button class="btn" style="${e.style||"background:var(--bg-2);color:var(--text-1);"}" onclick="${e.fn}">
      ${e.icon} ${e.label}
    </button>
  `).join(""),a=document.createElement("div");a.className="modal-overlay active",a.id=o,a.innerHTML=`
    <div class="modal" style="max-width:560px;width:95%;max-height:90vh;display:flex;flex-direction:column;">
      <div class="modal-header" style="background:linear-gradient(135deg,var(--brand),var(--brand-light));padding:20px 24px;">
        <div style="display:flex;align-items:center;gap:12px;flex:1;">
          <span style="font-size:28px;">${s}</span>
          <div>
            <div class="modal-title" style="color:#fff;font-size:17px;">${l}</div>
            ${d?`<span class="badge ${r}" style="margin-top:4px;">${d}</span>`:""}
          </div>
        </div>
        <button class="modal-close" style="color:#fff;opacity:0.8;" onclick="document.getElementById('${o}').remove()">×</button>
      </div>
      <div class="modal-body" style="flex:1;overflow-y:auto;padding:20px 24px;">
        ${i}
      </div>
      <div class="modal-footer" style="gap:8px;flex-wrap:wrap;">
        <button class="btn btn-secondary" onclick="document.getElementById('${o}').remove()">إغلاق</button>
        ${n}
      </div>
    </div>
  `,a.addEventListener("click",e=>{e.target===a&&a.remove()}),document.body.appendChild(a)}function v({title:l,icon:s="📋",sections:d=[],companyName:r="إدهام للمواد الغذائية"}){const p=d.map(i=>`
    <div class="section">
      ${i.heading?`<div class="sec-title">${i.heading}</div>`:""}
      <table>
        ${i.rows.filter(Boolean).map(n=>`
          <tr>
            <td class="lbl">${n.label}</td>
            <td class="val" ${n.mono?'style="font-family:monospace;"':""}>${n.value??"—"}</td>
          </tr>
        `).join("")}
      </table>
    </div>
  `).join(""),c=new Date().toLocaleString("ar-SA"),o=window.open("","_blank","width=700,height=900");o.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${l} — ${r}</title>
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
          <div class="header-title">${s} ${l}</div>
          <div class="header-sub">تاريخ الطباعة: ${c}</div>
        </div>
        <div class="company">
          <strong>إدهام للمواد الغذائية</strong><br>
          نظام إدارة الموارد (ERP)
        </div>
      </div>
      ${p}
      <div class="footer">إدهام للمواد الغذائية — جميع الحقوق محفوظة © ${new Date().getFullYear()}</div>
      <script>setTimeout(() => { window.print(); window.close(); }, 600);<\/script>
    </body>
    </html>
  `),o.document.close()}export{v as p,m as s};
