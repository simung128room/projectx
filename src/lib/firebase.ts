import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-2RnxebSvtzkD8JG8_OCsH2-BAncV8dw",
  authDomain: "apex-gen.firebaseapp.com",
  projectId: "apex-gen",
  storageBucket: "apex-gen.firebasestorage.app",
  messagingSenderId: "219914284298",
  appId: "1:219914284298:web:49637b2ca503e157421ef3",
  measurementId: "G-85MRQPP2Z6"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
