import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your Innovexa Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDLrmTZX27sLH-YguBR7HoezeIZF_Fno0",
  authDomain: "innovexa-studio.firebaseapp.com",
  projectId: "innovexa-studio",
  storageBucket: "innovexa-studio.firebasestorage.app",
  messagingSenderId: "125306122277",
  appId: "1:125306122277:web:fc3c1b24ee3b0762ab0fcc",
  measurementId: "G-E1C2V8T55M"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
