import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const firebaseAuth = getAuth(firebaseApp);
const firebaseFirestore = getFirestore(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
const firebaseRealtimeDB = getDatabase(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();

// Export with clear names
export const auth = firebaseAuth;
export const db = firebaseFirestore;
export const storage = firebaseStorage;
export const realtimeDb = firebaseRealtimeDB;
export const googleProvider = googleAuthProvider;

export default firebaseApp;
