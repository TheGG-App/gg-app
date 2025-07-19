// src/App.js
import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import RecipesView from './features/recipes/RecipesView';
import MealsView from './features/meals/MealsView';
import LandingPage from './shared/components/LandingPage';
import { auth, googleProvider } from './config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import useFirebaseSync from './shared/hooks/useFirebaseSync';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Temporary local state (will be overridden by Firebase when logged in)
  const [localRecipes, setLocalRecipes] = useState([]);
  const [localMeals, setLocalMeals] = useState([]);
  const [localApiKey, setLocalApiKey] = useState('');
  
  // Firebase synced data
  const [firebaseRecipes, setFirebaseRecipes, recipesLoading] = useFirebaseSync('recipes', user?.uid);
  const [firebaseMeals, setFirebaseMeals, mealsLoading] = useFirebaseSync('meals', user?.uid);
  const [firebaseApiKey, setFirebaseApiKey, apiKeyLoading] = useFirebaseSync('settings', user?.uid);
  
  // Use Firebase data if logged in, otherwise use local
  const recipes = user ? firebaseRecipes : localRecipes;
  const setRecipes = user ? setFirebaseRecipes : setLocalRecipes;
  const meals = user ? firebaseMeals : localMeals;
  const setMeals = user ? setFirebaseMeals : setLocalMeals;
  
  // API key from Firebase settings
  const rawApiKey = user ? (firebaseApiKey.find(item => item.id === 'openai-key')?.value || '') : localApiKey;
  const openaiApiKey = rawApiKey.trim();
  
  const setOpenaiApiKey = async (value) => {
    if (user) {
      try {
        const existingSettings = firebaseApiKey.filter(item => item.id !== 'openai-key');
        const newSettings = [
          ...existingSettings,
          {
            id: 'openai-key',
            value: value,
            type: 'apiKey'
          }
        ];
        await setFirebaseApiKey(newSettings);
      } catch (error) {
        console.error('Error saving API key:', error);
        alert('Failed to save API key. Please try again.');
      }
    } else {
      setLocalApiKey(value);
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle sign in
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--color-gray-500)'
      }}>
        Loading...
      </div>
    );
  }

  // Show loading state while Firebase data loads
  const isLoading = user && (recipesLoading || mealsLoading || apiKeyLoading);
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--color-gray-500)'
      }}>
        Syncing your data...
      </div>
    );
  }

  // Navigation data for landing page
  const navigationData = {
    recipesCount: recipes.length,
    mealsCount: meals.length,
    hasApiKey: !!openaiApiKey,
    user: user
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'recipes':
        return (
          <RecipesView
            recipes={recipes}
            setRecipes={setRecipes}
            openaiApiKey={openaiApiKey}
          />
        );
      
      case 'meals':
        return (
          <MealsView
            meals={meals}
            setMeals={setMeals}
            recipes={recipes}
            openaiApiKey={openaiApiKey}
          />
        );
      
      case 'home':
      default:
        return (
          <LandingPage
            onNavigate={setCurrentView}
            navigationData={navigationData}
            user={user}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            openaiApiKey={openaiApiKey}
            setOpenaiApiKey={setOpenaiApiKey}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Header - only show when not on landing page */}
      {currentView !== 'home' && (
        <header style={{
          background: 'white',
          borderBottom: '1px solid var(--color-gray-200)',
          padding: 'var(--spacing-lg) var(--spacing-xl)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setCurrentView('home')}
              className="btn btn-secondary btn-sm"
            >
              ← Home
            </button>
            
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)'
              }}>
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-gray-200)'
                  }}
                />
                <span style={{ 
                  fontSize: '0.9rem',
                  color: 'var(--color-gray-600)'
                }}>
                  {user.displayName}
                </span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;