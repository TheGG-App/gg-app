// src/features/recipes/components/RecipeManager.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import RecipesView from '../RecipesView';
import MealsView from '../../meals/MealsView';

function RecipeManager() {
  const { user, isPrivileged } = useAuth();
  const [currentView, setCurrentView] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  // Subscribe to recipes collection
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const recipesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to meals collection
  useEffect(() => {
    if (!user) return;

    const mealsRef = collection(db, 'meals');
    const q = query(mealsRef);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const mealsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMeals(mealsData);
      },
      (error) => {
        console.error("Error fetching meals:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenaiApiKey(savedKey);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  // Navigation bar
  const renderNavigation = () => (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <button
        onClick={() => setCurrentView('recipes')}
        style={{
          background: currentView === 'recipes' ? '#06b6d4' : 'transparent',
          color: currentView === 'recipes' ? 'white' : '#6b7280',
          border: 'none',
          padding: '0.5rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
      >
        Recipes
      </button>
      
      <button
        onClick={() => setCurrentView('meals')}
        style={{
          background: currentView === 'meals' ? '#06b6d4' : 'transparent',
          color: currentView === 'meals' ? 'white' : '#6b7280',
          border: 'none',
          padding: '0.5rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
      >
        Meal Combos
      </button>

      <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#6b7280' }}>
        {!isPrivileged && '(Read-Only Mode)'}
      </div>
    </div>
  );

  return (
    <div>
      {renderNavigation()}
      
      {currentView === 'recipes' ? (
        <RecipesView
          recipes={recipes}
          setRecipes={setRecipes}
          openaiApiKey={openaiApiKey}
        />
      ) : (
        <MealsView
          meals={meals}
          setMeals={setMeals}
          recipes={recipes}
          openaiApiKey={openaiApiKey}
        />
      )}
    </div>
  );
}

export default RecipeManager;