import fs from "fs";
import admin from "firebase-admin";

async function main() {
  const refreshData = JSON.parse(fs.readFileSync("../refresh.json", "utf8"));

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
      client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
      grant_type: "refresh_token",
      refresh_token: refreshData.refresh_token,
    }).toString(),
  });

  const tokenJson = await res.json();
  if (!tokenJson.access_token) {
    console.error("Token exchange failed:", tokenJson);
    return;
  }

  const app = admin.initializeApp({
    projectId: "idham-foodstuffs-sa",
    credential: admin.credential.accessToken(tokenJson.access_token),
  });

  const db = admin.firestore(app);

  const companiesSnap = await db.collection("companies").get();
  for (const companyDoc of companiesSnap.docs) {
    console.log("=== Company ID:", companyDoc.id);
    const errorsSnap = await db.collection(`companies/${companyDoc.id}/clientErrors`).orderBy("time", "desc").limit(10).get();
    if (errorsSnap.empty) {
      console.log("No client errors found.");
    } else {
      for (const errDoc of errorsSnap.docs) {
        const errData = errDoc.data();
        console.log(`[${errData.time}] Message: ${errData.message}`);
        if (errData.stack) console.log(`Stack: ${errData.stack}`);
        console.log("-----------------------------------------");
      }
    }
  }
}

main().catch(console.error);
