import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction, 
  serverTimestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyAike2lPO7VnFoRHevnGkbHpAQbKoDb5r8",
  authDomain:        "idham-foodstuffs-sa.firebaseapp.com",
  projectId:         "idham-foodstuffs-sa",
  storageBucket:     "idham-foodstuffs-sa.firebasestorage.app",
  messagingSenderId: "771445462953",
  appId:             "1:771445462953:web:05d70fb7c36a385c9796b8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const COMPANY_ID = "idham-main";

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
  serverTimestamp
};
