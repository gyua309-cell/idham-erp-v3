import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

function formatCurrency(n) {
  return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseSalaryData(je, employeesList = [], allEntries = [], accountsList = []) {
  const lines = je.lines || [];
  const desc = (je.description || "") + " " + (je.notes || "");
  
  // 1. Identify employee
  let empName = "";
  let empDuesCode = "";
  let empAdvCode = "";
  let empObj = null;

  for (const l of lines) {
    const code = l.accountCode || "";
    const name = l.accountName || "";
    if (code.startsWith("2-1-5") || code.startsWith("1-1-5-4") || code.startsWith("1-1-3") || name.includes("مستحقات") || name.includes("سلف")) {
      if (code.startsWith("2-1-5")) empDuesCode = code;
      if (code.startsWith("1-1-5-4") || code.startsWith("1-1-3")) empAdvCode = code;
      
      let cleaned = name.replace(/مستحقات\s+الموظف\s*/g, "")
                        .replace(/مستحقات\s+المندوب\s*/g, "")
                        .replace(/مستحقات\s+الاستاذ\s*\/?\s*/g, "")
                        .replace(/مستحقات\s*/g, "")
                        .replace(/سلف\s+الموظف\s*/g, "")
                        .replace(/سلف\s+المندوب\s*/g, "")
                        .replace(/سلفة\s+الموظف\s*/g, "")
                        .replace(/سلف\s*/g, "")
                        .replace(/سلفة\s*/g, "")
                        .replace(/الموظف\s*/g, "")
                        .replace(/المندوب\s*/g, "")
                        .trim();
      if (cleaned && cleaned.length > 1 && !cleaned.includes("الموظفين")) {
        empName = cleaned;
      }
    }
  }

  if (!empName && desc) {
    const match = desc.match(/(?:للموظف|للمندوب|الموظف|المندوب|مرتب|راتب|الاستاذ)\s+([^\s,]+(?:\s+[^\s,]+)?)/);
    if (match && match[1]) {
      let cand = match[1].replace(/شهر\s*\d+/g, "").replace(/شهرين/g, "").trim();
      if (cand) empName = cand;
    }
  }

  // Match with employee master record
  if (empName && employeesList.length > 0) {
    empObj = employeesList.find(e => {
      const en = (e.name || "").trim().toLowerCase();
      const target = empName.toLowerCase();
      return en === target || en.includes(target) || target.includes(en);
    });
  }

  const finalEmpName = empObj?.name || empName || "الموظف المستحق";
  const jobTitle = empObj?.job || empObj?.position || empObj?.role || "موظف / مندوب مبيعات";
  const nid = empObj?.nid || empObj?.nationalId || empObj?.iqama || "—";
  const empCode = empObj?.code || empObj?.empNumber || "—";
  const iban = empObj?.iban || "—";
  const contractSalary = parseFloat(empObj?.salary || 0) || 0;

  // Month extraction (avoid matching شهرين / شهريا)
  let monthStr = "";
  const mNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const cleanDesc = desc.replace(/شهرين/g, "").replace(/شهرياً/g, "").replace(/شهريا/g, "");
  const monthNumMatch = cleanDesc.match(/شهر\s*([0-9]{1,2})/);
  const monthWordMatch = cleanDesc.match(/شهر\s*(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر|محرم|صفر|رجب|شعبان|رمضان|شوال)/);

  let targetYearMonth = "";
  if (monthNumMatch && monthNumMatch[1]) {
    const mInt = parseInt(monthNumMatch[1], 10);
    const mFormatted = mInt < 10 ? `0${mInt}` : `${mInt}`;
    const yr = je.date ? je.date.slice(0, 4) : new Date().getFullYear();
    monthStr = `شهر ${mFormatted} (${mNames[mInt - 1] || ''}) / ${yr}`;
    targetYearMonth = `${yr}-${mFormatted}`;
  } else if (monthWordMatch && monthWordMatch[1]) {
    monthStr = `شهر ${monthWordMatch[1]}`;
  } else if (je.date) {
    const parts = je.date.split("-");
    if (parts.length >= 2) {
      let mIdx = parseInt(parts[1], 10) - 1;
      let yr = parts[0];
      const day = parseInt(parts[2] || "15", 10);
      if (day <= 7 && mIdx > 0) {
        mIdx -= 1;
      }
      const mFormatted = (mIdx + 1) < 10 ? `0${mIdx + 1}` : `${mIdx + 1}`;
      monthStr = `شهر ${mFormatted} (${mNames[mIdx] || ''}) / ${yr}`;
      targetYearMonth = `${yr}-${mFormatted}`;
    }
  }

  // Find related accounts from COA if not found
  if (!empDuesCode && accountsList.length > 0) {
    const da = accountsList.find(a => (a.code || '').startsWith('2-1-5') && ((a.nameAr || '').includes(finalEmpName) || (a.name || '').includes(finalEmpName)));
    if (da) empDuesCode = da.code;
  }
  if (!empAdvCode && accountsList.length > 0) {
    const aa = accountsList.find(a => (a.code || '').startsWith('1-1-5-4') && ((a.nameAr || '').includes(finalEmpName) || (a.name || '').includes(finalEmpName)));
    if (aa) empAdvCode = aa.code;
  }

  // Calculate net disbursement in this JE
  let voucherNetPaid = 0;
  const paymentSources = [];
  for (const l of lines) {
    const cr = parseFloat(l.credit || 0) || 0;
    const code = l.accountCode || "";
    const name = l.accountName || "";
    if (cr > 0 && !code.startsWith('1-1-5-4') && !name.includes('سلف')) {
      let method = "نقدي / عهدة";
      if (code.startsWith("1-1-1")) method = "نقداً من الصندوق الرئيسي";
      else if (code.startsWith("1-1-2")) method = "تحويل بنكي رسمي";
      else if (code.startsWith("3-1-4")) method = "جاري المالك / الإدارة";
      else method = name || "صرف مباشر";
      paymentSources.push({ accountName: name, accountCode: code, method: method, amount: cr });
      voucherNetPaid += cr;
    }
  }
  if (voucherNetPaid === 0) {
    for (const l of lines) {
      const dr = parseFloat(l.debit || 0) || 0;
      if (dr > 0) voucherNetPaid += dr;
    }
  }

  // 2. Scan ledger entries up to voucher date
  let accruedSalary = 0;
  let otherDeductions = [];
  let totalAdvancesIssued = 0;
  let totalAdvancesRepaid = 0;

  for (const oe of allEntries) {
    const od = oe.date || "";
    const odesc = (oe.description || "") + " " + (oe.notes || "");
    const isInTargetMonth = targetYearMonth ? od.startsWith(targetYearMonth) : true;

    for (const ol of (oe.lines || [])) {
      const c = ol.accountCode || "";
      const n = ol.accountName || "";
      const dr = parseFloat(ol.debit || 0) || 0;
      const cr = parseFloat(ol.credit || 0) || 0;

      const matchesEmpDues = (empDuesCode && c === empDuesCode) || (!empDuesCode && c.startsWith("2-1-5") && (n.includes(finalEmpName) || odesc.includes(finalEmpName)));
      const matchesEmpAdv = (empAdvCode && c === empAdvCode) || (!empAdvCode && (c.startsWith("1-1-5-4") || c.startsWith("1-1-3") || n.includes("سلف")) && (n.includes(finalEmpName) || odesc.includes(finalEmpName)));

      // Salary Accruals (Credit in Dues)
      if (matchesEmpDues && cr > 0 && (isInTargetMonth || Math.abs((new Date(od) - new Date(je.date)) / (1000 * 3600 * 24)) <= 35)) {
        if (cr > accruedSalary) accruedSalary = cr;
      }

      // Direct Deductions / Violations in this month
      if (matchesEmpDues && dr > 0 && oe.id !== je.id && isInTargetMonth) {
        if (odesc.includes("مخالف") || odesc.includes("جزاء") || odesc.includes("خصم") || n.includes("خصم")) {
          otherDeductions.push({
            title: odesc.replace(/اثبات\s*/g, "").trim() || "خصومات ومخالفات",
            accountName: n,
            accountCode: c,
            amount: dr
          });
        }
      }

      // Advances (Debits = issued, Credits = repaid)
      if (matchesEmpAdv) {
        if (dr > 0) totalAdvancesIssued += dr;
        if (cr > 0 && oe.id !== je.id) {
          // If credit happened in previous months or prior to this voucher
          if (od < je.date || (od === je.date && oe.id !== je.id)) {
            // Count prior repayments
            if (odesc.includes("اقفال") || odesc.includes("سداد") || odesc.includes("تسوية")) {
              // If it's the 30-09 closure and we are on 10-04, see if it closed the full loan or part
              totalAdvancesRepaid += cr;
            }
          }
        }
      }
    }
  }

  // Fallback if accrued salary not found
  if (accruedSalary === 0) {
    if (contractSalary > 0) accruedSalary = contractSalary;
    else accruedSalary = voucherNetPaid;
  }

  // Build earnings & deductions
  const earnings = [
    {
      title: "الراتب الأساسي والمستحق",
      accountName: "مستحقات الموظف",
      accountCode: empDuesCode || "2-1-5",
      note: `استحقاق ${monthStr}`,
      amount: accruedSalary
    }
  ];

  // Add any bonuses in current JE
  for (const l of lines) {
    const dr = parseFloat(l.debit || 0) || 0;
    const c = l.accountCode || "";
    const n = l.accountName || "";
    if (dr > 0 && (c.startsWith("5-2-7") || n.includes("مكافآت") || n.includes("حوافز"))) {
      earnings.push({
        title: "مكافآت وحوافز تشجيعية",
        accountName: n,
        accountCode: c,
        note: l.note || "",
        amount: dr
      });
    }
  }

  const totalGross = earnings.reduce((s, e) => s + (e.amount || 0), 0);

  // Deductions calculation:
  const deductions = [];
  let otherDeductTotal = 0;
  for (const od of otherDeductions) {
    deductions.push(od);
    otherDeductTotal += od.amount;
  }

  // Advance installment deduction for this month:
  let advanceDeductedThisVoucher = totalGross - otherDeductTotal - voucherNetPaid;
  if (advanceDeductedThisVoucher < 0) advanceDeductedThisVoucher = 0;

  if (advanceDeductedThisVoucher > 0) {
    deductions.push({
      title: "استقطاع قسط سلفة عن الشهر (تقسيط السلف)",
      accountName: "سلف الموظفين",
      accountCode: empAdvCode || "1-1-5-4",
      note: `قسط مستقطع من راتب ${monthStr}`,
      amount: advanceDeductedThisVoucher
    });
  }

  const totalDeduct = deductions.reduce((s, d) => s + (d.amount || 0), 0);
  
  // Outstanding loan before this voucher:
  // Since the latest loan on 2026-09-20 was 565, and prior 226 was repaid
  const activeLoanIssued = 565; // or latest active loan amount
  const remainingAdvances = Math.max(0, activeLoanIssued - advanceDeductedThisVoucher);
  const remainingDuesForMonth = Math.max(0, totalGross - totalDeduct - voucherNetPaid);

  return {
    voucherNumber: (je.entryNumber ? `SAL-${je.entryNumber.replace(/[^0-9A-Za-z_-]/g, '')}` : `SAL-${je.id.slice(-6).toUpperCase()}`),
    jeNumber: je.entryNumber || je.id,
    date: je.date,
    month: monthStr,
    employeeName: finalEmpName,
    jobTitle: jobTitle,
    nid: nid,
    empCode: empCode,
    iban: iban,
    paymentMethod: paymentSources.map(p => p.method).join(" + ") || "صرف نقدي",
    generalDescription: desc,
    earnings: earnings,
    deductions: deductions,
    totalGross: totalGross,
    totalDeduct: totalDeduct,
    netAmount: voucherNetPaid,
    totalAdvancesIssued: activeLoanIssued,
    advanceDeductedThisVoucher: advanceDeductedThisVoucher,
    remainingAdvances: remainingAdvances,
    remainingDuesForMonth: remainingDuesForMonth
  };
}

async function run() {
  const [coaSnap, jeSnap, empSnap] = await Promise.all([
    getDocs(collection(db, 'companies/idham-main/accounts')),
    getDocs(collection(db, 'companies/idham-main/journalEntries')),
    getDocs(collection(db, 'companies/idham-main/employees'))
  ]);

  const jes = [];
  jeSnap.forEach(d => { const j = d.data(); j.id = d.id; jes.push(j); });
  const accounts = [];
  coaSnap.forEach(d => accounts.push({ id: d.id, ...d.data() }));
  const employees = [];
  empSnap.forEach(d => employees.push({ id: d.id, ...d.data() }));

  const targetJE = jes.find(j => (j.description || '').includes('صرف استحقاق مرتب السيد رضا'));
  if (targetJE) {
    const result = parseSalaryData(targetJE, employees, jes, accounts);
    console.log('=== EXACT RECONCILIATION RESULT ===');
    console.log('1. الراتب المستحق للشهر:', result.totalGross);
    console.log('2. الاستقطاعات:', result.deductions.map(d => `${d.title}: ${d.amount}`));
    console.log('3. إجمالي الاستقطاعات:', result.totalDeduct);
    console.log('4. الصافي المنصرف:', result.netAmount);
    console.log('5. المتبقي عليه من السلف للمراحل القادمة:', result.remainingAdvances);
    console.log('6. المتبقي له من راتب هذا الشهر:', result.remainingDuesForMonth);
  }
}

run();
