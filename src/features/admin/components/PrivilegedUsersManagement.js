// src/features/admin/components/PrivilegedUsersManagement.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import styles from './PrivilegedUsersManagement.module.css';

function PrivilegedUsersManagement({ currentUser }) {
  const [showPanel, setShowPanel] = useState(false);
  const [privilegedUsers, setPrivilegedUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPanel) {
      loadPrivilegedUsers();
    }
  }, [showPanel]);

  const loadPrivilegedUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'privilegedUsers'));
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrivilegedUsers(users);
    } catch (error) {
      console.error('Error loading privileged users:', error);
    }
  };

  const addPrivilegedUser = async () => {
    if (!newUserEmail || !newUserEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const docId = newUserEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'privilegedUsers', docId), {
        email: newUserEmail.toLowerCase(),
        addedBy: currentUser.email,
        addedAt: new Date(),
        status: 'pending'
      });
      
      setNewUserEmail('');
      await loadPrivilegedUsers();
      alert('User added successfully! They will have write access when they sign in.');
    } catch (error) {
      console.error('Error adding privileged user:', error);
      alert('Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removePrivilegedUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user\'s privileges?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'privilegedUsers', userId));
      await loadPrivilegedUsers();
    } catch (error) {
      console.error('Error removing privileged user:', error);
      alert('Failed to remove user. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={styles.toggleButton}
      >
        👥 Manage Users
      </button>

      {showPanel && (
        <div className={styles.overlay} onClick={() => setShowPanel(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.title}>Manage Privileged Users</h2>
            <p className={styles.subtitle}>
              Users with write access can add, edit, and delete recipes.
            </p>

            <div className={styles.addForm}>
              <input
                type="email"
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className={styles.input}
                disabled={loading}
              />
              <button
                onClick={addPrivilegedUser}
                disabled={loading || !newUserEmail}
                className={styles.addButton}
              >
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </div>

            <div className={styles.usersList}>
              <h3 className={styles.listTitle}>Current Privileged Users</h3>
              {privilegedUsers.length === 0 ? (
                <p className={styles.emptyState}>No privileged users yet.</p>
              ) : (
                privilegedUsers.map(user => (
                  <div key={user.id} className={styles.userItem}>
                    <div className={styles.userInfo}>
                      <div className={styles.userEmail}>{user.email}</div>
                      <div className={styles.userMeta}>
                        {user.status === 'active' ? (
                          <span className={styles.active}>Active</span>
                        ) : (
                          <span className={styles.pending}>Pending</span>
                        )}
                        {user.addedBy && ` • Added by ${user.addedBy}`}
                      </div>
                    </div>
                    <button
                      onClick={() => removePrivilegedUser(user.id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowPanel(false)}
              className={styles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PrivilegedUsersManagement;