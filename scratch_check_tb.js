import fs from "fs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

async function main() {
  const configPath = "C:\\Users\\it\\.config\\configstore\\firebase-tools.json";
  if (!fs.existsSync(configPath)) {
    console.error("Config not found at", configPath);
    return;
  }

  const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const tokens = data.tokens;
  if (!tokens || !tokens.refresh_token) {
    console.error("No refresh token found in firebase-tools.json");
    return;
  }

  // Exchange refresh token for access token using correct client_secret
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
      client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token,
    }),
  });

  const tokenJson = await res.json();

  if (!tokenJson.access_token) {
    console.error("Token exchange failed:", tokenJson);
    return;
  }

  const app = admin.initializeApp({
    projectId: "idham-foodstuffs-sa",
    credential: {
      getAccessToken: () => ({
        access_token: tokenJson.access_token,
        expires_in: tokenJson.expires_in || 3600
      })
    }
  });

  const db = getFirestore(app);
  
  // List active companies
  const companiesSnap = await db.collection("companies").listDocuments();
  console.log("Active company IDs in Firestore:");
  const companyIds = companiesSnap.map(doc => doc.id);
  console.log(companyIds);

  for (const companyId of companyIds) {
    console.log(`\n=========================================`);
    console.log(`Analyzing Company: ${companyId}`);
    console.log(`=========================================`);
    
    const accountsSnap = await db.collection(`companies/${companyId}/chartOfAccounts`).get();
    const entriesSnap = await db.collection(`companies/${companyId}/journalEntries`).get();
    
    const accounts = accountsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const entries = entriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    console.log("Total accounts:", accounts.length);
    console.log("Total journal entries:", entries.length);
    
    const accById = {};
    const accByCode = {};
    accounts.forEach(a => { accById[a.id] = a; accByCode[a.code] = a; });
    
    let totalDr = 0, totalCr = 0;
    let unresolvedLines = [];
    let unbalancedEntries = [];
    
    entries.forEach(e => {
      let eDr = 0, eCr = 0;
      (e.lines || []).forEach(l => {
        const a = accById[l.accountId] || accByCode[l.accountCode];
        const dr = l.debit || 0;
        const cr = l.credit || 0;
        totalDr += dr;
        totalCr += cr;
        eDr += dr;
        eCr += cr;
        if (!a) {
          unresolvedLines.push({ entryId: e.id, entryNo: e.entryNumber, date: e.date, line: l });
        }
      });
      if (Math.abs(eDr - eCr) > 0.01) {
        unbalancedEntries.push({ id: e.id, entryNo: e.entryNumber, date: e.date, dr: eDr, cr: eCr, diff: eDr - eCr, desc: e.description });
      }
    });
    
    console.log("Global Sum of Debits across ALL entries:", totalDr);
    console.log("Global Sum of Credits across ALL entries:", totalCr);
    console.log("Global Difference (Dr - Cr):", totalDr - totalCr);
    console.log("Unresolved lines count (lines referencing missing accounts):", unresolvedLines.length);
    if (unresolvedLines.length > 0) {
      console.log("Sample unresolved lines (first 10):");
      console.log(unresolvedLines.slice(0, 10));
    }
    console.log("Unbalanced journal entries count:", unbalancedEntries.length);
    if (unbalancedEntries.length > 0) {
      console.log("Unbalanced journal entries detail:");
      console.log(unbalancedEntries);
    }
  }
}

main().catch(console.error);
