const fs = require('fs');

const files = [
  'E:/ادهام للمواد الغذائية/js/modules/sales-invoices.js',
  'D:/ادهام للمنتجات الغذائية/cloud-server-edition/web-client/js/modules/sales-invoices.js',
  'D:/ادهام للمنتجات الغذائية/src/js/modules/sales-invoices.js'
];

const target = '        ` : \'\'}\n      </td>';
const replacement = '        ` : (selectedCustomer?.id && line.isFirstTimeForCustomer ? `\n          <div style="margin-top:3px; display:inline-flex; align-items:center; gap:2px; background:#f1f5f9; border:1px dashed #94a3b8; border-radius:4px; padding:1px 5px; font-size:9.5px; color:#475569; white-space:nowrap;" title="لم يسبق بيع هذا الصنف لهذا العميل من قبل">\n            <span>ℹ️ أول بيع للعميل</span>\n          </div>\n        ` : \'\')}\n      </td>';

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  if (c.includes(target)) {
    c = c.replace(target, replacement);
    fs.writeFileSync(f, c, 'utf8');
    console.log('Successfully updated:', f);
  } else {
    console.log('Target not found in:', f);
  }
});
