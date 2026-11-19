import ExcelJS from 'exceljs';
import fs from 'fs';

async function testExcelGeneration() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "نظام إدهام ERP";
  const ws = wb.addWorksheet("كشف حساب مصرف الراجحي", {
    views: [{ rtl: true, showGridLines: true }]
  });

  ws.columns = [
    { key: 'num', width: 6 },
    { key: 'date', width: 14 },
    { key: 'bank', width: 18 },
    { key: 'type', width: 16 },
    { key: 'ref', width: 16 },
    { key: 'notes', width: 38 },
    { key: 'inflow', width: 16 },
    { key: 'outflow', width: 16 },
    { key: 'balance', width: 18 }
  ];

  ws.mergeCells('A1:I1');
  const r1 = ws.getCell('A1');
  r1.value = "شركة نظم الإمداد المتطورة — المنظومة المحاسبية المتكاملة";
  r1.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  r1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  r1.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  ws.mergeCells('A2:I2');
  const r2 = ws.getCell('A2');
  r2.value = "كشف حساب بنكي رسمي: مصرف الراجحي — الآيبان: SA2180000150608016641332 | رقم الحساب: 150000010006086641332";
  r2.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  r2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  r2.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 25;

  const buf = await wb.xlsx.writeBuffer();
  console.log("Excel buffer size:", buf.byteLength);
}

testExcelGeneration().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
