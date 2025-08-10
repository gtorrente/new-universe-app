import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBhuWwh_riGIGD-QL_h-Z3-q7kY7Yj4ZrE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tarot-universo-catia.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tarot-universo-catia",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tarot-universo-catia.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "248009503977",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:248009503977:web:a85f8b9b0f4b5c7d8e9a2c",
  measurementId: "G-NMFHG8MH72"
};

// Debug: Log da configuração para verificar
console.log('🔧 Firebase Config Debug:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { db, addDoc, collection, storage };

