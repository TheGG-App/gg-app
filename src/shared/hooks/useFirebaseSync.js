// src/shared/hooks/useFirebaseSync.js
import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function useFirebaseSync(collectionName, userId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to Firestore changes
  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        console.log(`Fetched ${snapshot.docs.length} ${collectionName} documents`);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`${collectionName} data:`, items);
        setData(items);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, userId]);

  // Update data function
  const updateData = async (newData) => {
    if (!userId) {
      console.warn('No user logged in, cannot sync to Firebase');
      return;
    }

    try {
      // Handle array of items
      if (Array.isArray(newData)) {
        // Delete items that no longer exist
        const currentIds = data.map(item => item.id.toString());
        const newIds = newData.map(item => item.id.toString());
        const toDelete = currentIds.filter(id => !newIds.includes(id));
        
        // Delete removed items
        for (const id of toDelete) {
          await deleteDoc(doc(db, collectionName, id));
        }
        
        // Update or add items
        for (const item of newData) {
          console.log(`Saving ${collectionName} document:`, item.id, item);
          await setDoc(
            doc(db, collectionName, item.id.toString()),
            {
              ...item,
              userId: userId,
              updatedAt: new Date().toISOString()
            }
          );
        }
      } else {
        // Handle single item update
        await setDoc(
          doc(db, collectionName, newData.id.toString()),
          {
            ...newData,
            userId: userId,
            updatedAt: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      setError(error.message);
    }
  };

  return [data, updateData, loading, error];
}