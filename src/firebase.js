import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
const firebaseConfig = { 
  apiKey: "AIzaSyD35-cWvVTNXaiu1CdXWg4t6yMrVqcgbUY",
  authDomain: "fee-tracking-system-a016f.firebaseapp.com",
  projectId: "fee-tracking-system-a016f",
  storageBucket: "fee-tracking-system-a016f.firebasestorage.app",
  messagingSenderId: "744642278765",
  appId: "1:744642278765:web:44e503e5bc79bde426d664"};

const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app);