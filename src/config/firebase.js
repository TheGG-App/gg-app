// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase config from console.firebase.google.com
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

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database
export const db = getFirestore(app);