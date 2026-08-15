/**
 * Force-delete phantom inventory adjustment records
 * These records have NO stock movements and NO journal entries,
 * so we delete the documents directly without any reversal.
 */

const API_KEY = "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8";
const PROJECT = "idham-foodstuffs-sa";
const COMPANY = "idham-main";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

async function deleteDoc(path) {
  const url = `${BASE}/${path}?key=${API_KEY}`;
  const resp = await fetch(url, { method: 'DELETE' });
  if (!resp.ok && resp.status !== 404) {
    const body = await resp.text();
    throw new Error(`DELETE failed (${resp.status}): ${body}`);
  }
  return resp.status;
}

async function runQuery(collectionPath, field, value) {
  const parts = collectionPath.split('/');
  const colId = parts.pop();
  const parentPath = parts.join('/');
  
  const url = `${BASE}/${parentPath}:runQuery?key=${API_KEY}`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: colId }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: "EQUAL",
          value: { stringValue: value }
        }
      },
      limit: 50
    }
  };
  
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await resp.json();
  if (!Array.isArray(data)) return [];
  return data.filter(d => d.document).map(d => d.document.name.split('/').pop());
}

async function main() {
  console.log('🗑️  حذف مستندات التسوية الوهمية\n');

  // Find all donation adjustments
  const adjIds = await runQuery(
    `companies/${COMPANY}/inventoryAdjustments`,
    'type', 'donation'
  );

  console.log(`وُجد ${adjIds.length} تسوية من نوع تبرعات:\n`);

  for (const id of adjIds) {
    // Check if there are stock movements for this adjustment
    const movIds = await runQuery(
      `companies/${COMPANY}/stockMovements`,
      'sourceId', id
    );
    const jeIds = await runQuery(
      `companies/${COMPANY}/journalEntries`,
      'sourceId', id
    );

    console.log(`[${id}]`);
    console.log(`  حركات مخزون: ${movIds.length}`);
    console.log(`  قيود محاسبية: ${jeIds.length}`);

    if (movIds.length > 0) {
      console.log(`  ⚠️  هذه التسوية أثرت على المخزون فعلاً — يجب عكسها من الواجهة وليس بالحذف المباشر`);
      continue;
    }

    // Safe to delete: no stock movements, no real financial impact
    // Delete any orphan JEs first (just in case)
    for (const jeId of jeIds) {
      const s = await deleteDoc(`companies/${COMPANY}/journalEntries/${jeId}`);
      console.log(`  ✅ حُذف القيد ${jeId} (status: ${s})`);
    }

    // Delete the adjustment document
    const s = await deleteDoc(`companies/${COMPANY}/inventoryAdjustments/${id}`);
    console.log(`  ✅ حُذف مستند التسوية (status: ${s})\n`);
  }

  console.log('\n✅ انتهى. المخزون لم يتأثر.');
}

main().catch(console.error);
