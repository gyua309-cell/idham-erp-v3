const fs = require('fs');
const xlsx = require('xlsx');

function inspectFile(filePath) {
  console.log('=== FILE:', filePath);
  const wb = xlsx.readFile(filePath);
  console.log('Sheet names:', wb.SheetNames);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Total rows:', rows.length);
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    console.log('Row ' + i + ':', JSON.stringify(rows[i]));
  }
}

inspectFile('C:/Users/it/Downloads/عرض_سعر_وادي_النخيل.xlsx');
console.log('----------------------------------------------------');
inspectFile('C:/Users/it/Downloads/عرض_سعر_شركة_النعمان.xlsx');
