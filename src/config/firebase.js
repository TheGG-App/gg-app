// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBwf7PrhN45My-mDjNjC7o_dTJ-07cGAAg",
  authDomain: "gg-recipe-app.firebaseapp.com",
  projectId: "gg-recipe-app",
  storageBucket: "gg-recipe-app.firebasestorage.app",
  messagingSenderId: "845280238042",
  appId: "1:845280238042:web:f73e37f84b8b75568f88e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();