const admin = require("firebase-admin");

admin.initializeApp({
  projectId: "idham-foodstuffs-sa",
});

const auth = admin.auth();
const db   = admin.firestore();

async function createAdminUser() {
  const email    = "alifayad18@gmail.com";
  const password = "Aa121234";
  const name     = "علي فياض";

  console.log(`Creating/Updating user ${email}...`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log("User found, updating password...");
    await auth.updateUser(userRecord.uid, {
      password: password,
      displayName: name,
    });
  } catch (e) {
    userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });
    console.log("User created with UID:", userRecord.uid);
  }

  // Create admin profile in Firestore
  const companyId = "idham_main";
  const userRef = db.doc(`companies/${companyId}/users/${userRecord.uid}`);
  await userRef.set({
    uid: userRecord.uid,
    name: name,
    email: email,
    role: "admin",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log("✅ Admin user setup completed!");
}

createAdminUser().then(() => {
  process.exit(0);
}).catch(err => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});
