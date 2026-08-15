import { db, COMPANY_ID } from "../firebase-config.js";
import { collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Uploads a file to the archive collection in Firestore
window.uploadFileToArchive = async (file, category, relatedId = "", notes = "") => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileId = doc(collection(db, `companies/${COMPANY_ID}/archivedFiles`)).id;
        const fileData = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result, // base64 / data URL
          category, // sales_invoices | purchase_invoices | bank_transfers | expenses | quotations | employee_docs | company_docs
          relatedId,
          notes: notes || "تم الرفع تلقائياً أثناء المعاملة",
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedBy: "علي فياض — مدير النظام"
        };
        
        await setDoc(doc(db, `companies/${COMPANY_ID}/archivedFiles`, fileId), fileData);
        resolve(fileData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
