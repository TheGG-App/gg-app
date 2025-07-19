// src/App.js
import React from 'react';
import './styles/globals.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login/Login';
import RecipeManager from './features/recipes/components/RecipeManager';
import PrivilegedUsersManagement from './features/admin/components/PrivilegedUsersManagement';

// Header component to show user status
function AppHeader() {
  const { user, isAdmin, isPrivileged, logout } = useAuth();

  if (!user) return null;

  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
          G&G Recipe Collection
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Admin Management Button */}
        {isAdmin && <PrivilegedUsersManagement currentUser={user} />}
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', color: '#374151' }}>
            {user.email}
          </div>
          <div style={{ fontSize: '0.8rem', color: isAdmin ? '#7c3aed' : isPrivileged ? '#059669' : '#6b7280' }}>
            {isAdmin ? '★ Admin' : isPrivileged ? '✓ Write Access' : 'Read-Only'}
          </div>
        </div>
        <button 
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

// Main app content
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <AppHeader />
      <main style={{ minHeight: 'calc(100vh - 73px)' }}>
        <RecipeManager />
      </main>
    </>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;