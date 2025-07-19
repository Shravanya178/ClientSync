// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqouz5l_GqRfGjMXECzaxeROkqI2p4bVQ",
  authDomain: "clientsync-77fd5.firebaseapp.com",
  projectId: "clientsync-77fd5",
  storageBucket: "clientsync-77fd5.firebasestorage.app",
  messagingSenderId: "115846373211",
  appId: "1:115846373211:web:fa4750343defc73a8ec47e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
