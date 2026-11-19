const projectId = "idham-b3a7e";
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

async function findCompany() {
  const res = await fetch(`${baseUrl}/userIndex`);
  const data = await res.json();
  console.log("userIndex documents:", JSON.stringify(data, null, 2));

  // Also query companies list
  const resComp = await fetch(`${baseUrl}/companies`);
  const dataComp = await resComp.json();
  console.log("companies list:", (dataComp.documents || []).map(d => d.name));
}

findCompany().catch(console.error);
