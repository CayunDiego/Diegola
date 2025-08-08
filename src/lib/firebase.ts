// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "tuneshare-rq0t8",
  "appId": "1:656635218138:web:65003c6f3224ccd0bf3de3",
  "storageBucket": "tuneshare-rq0t8.firebasestorage.app",
  "apiKey": "AIzaSyBKdExRI_QB9gFlNe97gh50Ni-2MmGwf-0",
  "authDomain": "tuneshare-rq0t8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "656635218138"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
