// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPrivileged, setIsPrivileged] = useState(false);

  // Check user privileges
  const checkUserPrivileges = async (user) => {
    if (!user) {
      setIsAdmin(false);
      setIsPrivileged(false);
      return;
    }

    // Check if admin
    const adminStatus = user.uid === 'BRfC6aPCTqbLoBABczIU7025eyh2';
    setIsAdmin(adminStatus);

    // Check if privileged user
    if (adminStatus) {
      setIsPrivileged(true); // Admin is always privileged
    } else {
      try {
        const privilegedDoc = await getDoc(doc(db, 'privilegedUsers', user.uid));
        setIsPrivileged(privilegedDoc.exists());
      } catch (error) {
        console.error('Error checking privileges:', error);
        setIsPrivileged(false);
      }
    }
  };

  // Update privileged user record when they sign in
  const updatePrivilegedUserRecord = async (user) => {
    try {
      // Check if there's a pending privilege grant for this email
      const q = query(
        collection(db, 'privilegedUsers'), 
        where('email', '==', user.email.toLowerCase())
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Found a pending grant
        const pendingDoc = snapshot.docs[0];
        const pendingData = pendingDoc.data();

        // Create the proper privileged user record with user ID
        await setDoc(doc(db, 'privilegedUsers', user.uid), {
          ...pendingData,
          userId: user.uid,
          status: 'active',
          lastSignIn: new Date()
        });

        // Delete the pending record if it's different from the user ID
        if (pendingDoc.id !== user.uid) {
          await deleteDoc(doc(db, 'privilegedUsers', pendingDoc.id));
        }

        setIsPrivileged(true);
      }
    } catch (error) {
      console.error('Error updating privileged user record:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await updatePrivilegedUserRecord(user);
        await checkUserPrivileges(user);
      } else {
        setIsAdmin(false);
        setIsPrivileged(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    isPrivileged,
    loading,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}