import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDLrMTZX27sLH-YguBR7HoezeIZF_Fno0",
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

// Keep credentials stored across browser reopens
setPersistence(auth, browserLocalPersistence);

// 21 Days Session Expiry (3 Weeks = 21 * 24 * 60 * 60 * 1000 ms)
const SESSION_DURATION_MS = 21 * 24 * 60 * 60 * 1000;

export function recordLoginSession() {
  localStorage.setItem('innovexa_login_timestamp', Date.now().toString());
}

export function checkSessionExpiry() {
  const timestamp = localStorage.getItem('innovexa_login_timestamp');
  if (timestamp) {
    const elapsed = Date.now() - parseInt(timestamp, 10);
    if (elapsed > SESSION_DURATION_MS) {
      localStorage.removeItem('innovexa_login_timestamp');
      signOut(auth);
      return true; // Expired
    }
  }
  return false; // Still valid
}
