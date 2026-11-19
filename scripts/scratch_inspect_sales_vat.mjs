import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'AIzaSyBFMGVZvuWBaxwrjGUJV3GQf7hoyVGB6wY',
  projectId: 'idham-b3a7e'
});
const db = getFirestore(app);

async function main() {
  const invSnap = await getDocs(collection(db, 'companies/idham-main/salesInvoices'));
  const retSnap = await getDocs(collection(db, 'companies/idham-main/salesReturns'));
  const custSnap = await getDocs(collection(db, 'companies/idham-main/customers'));
  
  const custMap = {};
  custSnap.forEach(d => {
    custMap[d.id] = { id: d.id, ...d.data() };
  });

  let totalWithVat = 0;
  let totalSubtotal = 0;
  let totalVat = 0;
  
  const monthly = {};
  for (let m = 1; m <= 12; m++) {
    monthly[m] = { invGross: 0, invSubtotal: 0, invVat: 0, retGross: 0, retSubtotal: 0, retVat: 0, invCount: 0, retCount: 0 };
  }

  invSnap.forEach(d => {
    const data = d.data();
    if (data.status === 'cancelled') return;
    const dt = data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '');
    if (!dt.startsWith('2026')) return;
    const m = parseInt(dt.slice(5, 7), 10);
    const g = parseFloat(data.totalWithVat ?? data.total ?? data.grandTotal ?? 0);
    const sub = parseFloat(data.subtotal ?? (g - (data.taxTotal || data.vatAmount || 0)));
    const vat = parseFloat(data.taxTotal ?? data.vatAmount ?? (g - sub));
    
    monthly[m].invGross += g;
    monthly[m].invSubtotal += sub;
    monthly[m].invVat += vat;
    monthly[m].invCount++;
    totalWithVat += g;
    totalSubtotal += sub;
    totalVat += vat;
  });

  retSnap.forEach(d => {
    const data = d.data();
    if (data.status === 'cancelled' || data.status === 'void') return;
    const dt = data.date || data.returnDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString().split('T')[0] : '');
    if (!dt.startsWith('2026')) return;
    const m = parseInt(dt.slice(5, 7), 10);
    const g = parseFloat(data.totalWithVat ?? data.totalAmount ?? data.grandTotal ?? data.total ?? 0);
    const sub = parseFloat(data.subtotal ?? (g - (data.taxTotal || data.vatAmount || 0)));
    const vat = parseFloat(data.taxTotal ?? data.vatAmount ?? (g - sub));
    
    monthly[m].retGross += g;
    monthly[m].retSubtotal += sub;
    monthly[m].retVat += vat;
    monthly[m].retCount++;
  });

  console.log('=== 2026 SALES & RETURNS MONTHLY SUMMARY ===');
  for (let m = 1; m <= 12; m++) {
    const d = monthly[m];
    if (d.invCount > 0 || d.retCount > 0) {
      console.log(`Month ${m}: Invoices Count=${d.invCount}, Gross(With VAT)=${d.invGross.toFixed(2)}, Subtotal(No VAT)=${d.invSubtotal.toFixed(2)}, VAT=${d.invVat.toFixed(2)} | Returns Count=${d.retCount}, RetGross=${d.retGross.toFixed(2)}, RetSubtotal=${d.retSubtotal.toFixed(2)}`);
      console.log(`   -> Net Sales With VAT: ${(d.invGross - d.retGross).toFixed(2)} | Net Sales Before VAT: ${(d.invSubtotal - d.retSubtotal).toFixed(2)}`);
    }
  }
  console.log('TOTAL 2026:');
  console.log(`Invoices Gross(With VAT): ${totalWithVat.toFixed(2)}, Subtotal(No VAT): ${totalSubtotal.toFixed(2)}, VAT: ${totalVat.toFixed(2)}`);
  
  // Sample check on 5 invoices to see exact fields
  console.log('\n=== SAMPLE 5 INVOICES ===');
  let count = 0;
  invSnap.forEach(d => {
    if (count < 5) {
      const data = d.data();
      console.log(`ID: ${d.id}, Date: ${data.date}, Subtotal: ${data.subtotal}, Tax: ${data.taxTotal || data.vatAmount}, TotalWithVat: ${data.totalWithVat}, Total: ${data.total}, Paid: ${data.paidAmount}`);
      count++;
    }
  });
}

main().catch(console.error);
