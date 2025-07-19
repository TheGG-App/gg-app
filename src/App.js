// src/App.js - Updated with side menu
import React, { useState, useEffect } from 'react';
import RecipesView from './features/recipes/RecipesView';
import MealsView from './features/meals/MealsView';
import LandingPage from './shared/components/LandingPage';
import RecipeImport from './shared/components/RecipeImport';
import PageWrapper from './shared/components/PageWrapper';
import SideMenu from './shared/components/SideMenu';
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
  // Clean the API key - remove any whitespace or hidden characters
  const openaiApiKey = rawApiKey.trim();
  
  console.log('Firebase API Key data:', firebaseApiKey);
  console.log('Raw API Key length:', rawApiKey.length);
  console.log('Cleaned API Key:', openaiApiKey ? 'sk-...' + openaiApiKey.slice(-4) : 'Not found');
  console.log('API Key starts with sk-:', openaiApiKey.startsWith('sk-'));
  
  const setOpenaiApiKey = async (value) => {
    if (user) {
      try {
        // Save as an array with a single document
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
    return unsubscribe;
  }, []);

  // Handle Google sign in
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again! 💔');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show different header based on current view
  const isLandingPage = currentView === 'home';
  const isLoading = authLoading || (user && (recipesLoading || mealsLoading || apiKeyLoading));

  return (
    <>
      {/* Side Menu */}
      <SideMenu
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        recipes={recipes}
        meals={meals}
      />

      {/* Main Content Area */}
      <div style={{ 
        minHeight: '100vh',
        background: '#f8fafc',
        marginLeft: '0px', // Always start from left, menu is overlay
        padding: '20px',
        paddingTop: '80px' // Space for menu toggle button
      }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              🥗
            </div>
            <p style={{
              fontSize: '1.2rem',
              color: '#4b5563',
              fontWeight: '600',
              fontFamily: 'Georgia, serif'
            }}>
              Loading your recipes...
            </p>
          </div>
        )}

        {/* API Key Setup - Only show if not on landing page and no API key */}
        {!isLandingPage && !isLoading && !openaiApiKey && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '15px',
            padding: '15px 20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',
            border: '1px solid #fbbf24',
            marginBottom: '15px'
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 5px 0',
                  color: '#92400e',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  Recipe Import Setup
                </h3>
                <p style={{
                  margin: 0,
                  color: '#78350f',
                  fontSize: '0.85rem'
                }}>
                  Add your OpenAI API key to enable recipe import
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  style={{
                    width: '200px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #f59e0b',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: 'white'
                  }}
                />
                <button 
                  onClick={() => openaiApiKey.trim() && alert('API key saved!')}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Views */}
        {!isLoading && (
          <>
            {currentView === 'home' && (
              <LandingPage 
                setCurrentView={setCurrentView}
                user={user}
                onSignIn={handleSignIn}
              />
            )}
            
            {currentView === 'recipes' && (
              <RecipesView 
                recipes={recipes}
                setRecipes={setRecipes}
                openaiApiKey={openaiApiKey}
              />
            )}
            
            {currentView === 'meals' && (
              <PageWrapper>
                <MealsView 
                  meals={meals}
                  setMeals={setMeals}
                  recipes={recipes}
                  openaiApiKey={openaiApiKey}
                />
              </PageWrapper>
            )}

            {currentView === 'import' && (
              <PageWrapper>
                <RecipeImport 
                  setCurrentView={setCurrentView}
                  openaiApiKey={openaiApiKey}
                  onRecipeParsed={(recipe) => {
                    const recipeWithId = { ...recipe, id: Date.now() };
                    setRecipes([...recipes, recipeWithId]);
                    setCurrentView('recipes');
                  }}
                />
              </PageWrapper>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;