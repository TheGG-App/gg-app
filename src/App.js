import React, { useState } from 'react';
import RecipesView from './features/recipes/RecipesView';
import MealsView from './features/meals/MealsView';
import LandingPage from './shared/components/LandingPage';
import RecipeImport from './shared/components/RecipeImport';
import PageWrapper from './shared/components/PageWrapper';
import { useLocalStorage } from './shared/hooks/useLocalStorage';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [recipes, setRecipes] = useLocalStorage('gg-recipes', []);
  const [meals, setMeals] = useLocalStorage('gg-meals', []);
  const [openaiApiKey, setOpenaiApiKey] = useLocalStorage('gg-openai-api-key', '');

  // Show different header based on current view
  const isLandingPage = currentView === 'home';

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#F0D0C1', // Static background instead of gradient
      padding: '20px'
    }}>
      {/* Header - only show on non-landing pages */}
      {!isLandingPage && (
        <>
          <div style={{
            background: 'white',
            borderRadius: '25px',
            padding: '30px',
            boxShadow: '0 12px 40px rgba(139, 90, 60, 0.15)',
            border: '2px solid #EEB182',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              background: 'linear-gradient(135deg, #8B5A3C 0%, #CA8462 30%, #BF5B4B 60%, #EEB182 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 15px 0',
              fontWeight: '900',
              textShadow: '0 2px 4px rgba(139, 90, 60, 0.1)',
              fontFamily: 'Brush Script MT, cursive, Georgia, serif'
            }}>
              The G&G Recipe App ✨
            </h1>
            <p style={{
              fontSize: '1.3rem',
              color: '#8B5A3C',
              margin: 0,
              fontWeight: '600'
            }}>
              💅 Sassy AI-Powered Recipe & Meal Management
            </p>
          </div>

          {/* Navigation */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(139, 90, 60, 0.2)',
            border: '2px solid #EEB182',
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setCurrentView('home')}
              style={{
                border: currentView === 'home' ? 'none' : '2px solid #8B5A3C',
                padding: '12px 30px',
                borderRadius: '15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: currentView === 'home' ? '#8B5A3C' : 'rgba(139, 90, 60, 0.1)',
                color: currentView === 'home' ? 'white' : '#8B5A3C',
                boxShadow: currentView === 'home' ? '0 6px 20px rgba(139, 90, 60, 0.4)' : 'none'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setCurrentView('recipes')}
              style={{
                border: currentView === 'recipes' ? 'none' : '2px solid #8B5A3C',
                padding: '12px 30px',
                borderRadius: '15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: currentView === 'recipes' ? '#8B5A3C' : 'rgba(139, 90, 60, 0.1)',
                color: currentView === 'recipes' ? 'white' : '#8B5A3C',
                boxShadow: currentView === 'recipes' ? '0 6px 20px rgba(139, 90, 60, 0.4)' : 'none'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🍳 Recipes ({recipes.length})
            </button>
            <button
              onClick={() => setCurrentView('meals')}
              style={{
                border: currentView === 'meals' ? 'none' : '2px solid #8B5A3C',
                padding: '12px 30px',
                borderRadius: '15px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: currentView === 'meals' ? '#8B5A3C' : 'rgba(139, 90, 60, 0.1)',
                color: currentView === 'meals' ? 'white' : '#8B5A3C',
                boxShadow: currentView === 'meals' ? '0 6px 20px rgba(139, 90, 60, 0.4)' : 'none'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              🍽️ Meals ({meals.length})
            </button>
          </div>

          {/* FIXED: Status bar completely removed from here */}

          {/* API Key Setup */}
          {!openaiApiKey && (
            <div style={{
              background: '#F0D0C1',
              borderRadius: '20px',
              padding: '25px',
              boxShadow: '0 8px 30px rgba(139, 90, 60, 0.2)',
              border: '2px solid #EEB182',
              marginBottom: '20px'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#8B5A3C',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                🔑 AI Setup Required, Babe
              </h3>
              <p style={{
                margin: '0 0 15px 0',
                color: '#666'
              }}>
                Get your OpenAI API key to unlock the magic ✨
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '2px solid #8B5A3C',
                    fontSize: '14px',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                />
                <button 
                  onClick={() => openaiApiKey.trim() && alert('API key saved!')}
                  style={{
                    background: '#8B5A3C',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(139, 90, 60, 0.3)'
                  }}
                >
                  Save ✨
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Views */}
      {currentView === 'home' && (
        <LandingPage 
          setCurrentView={setCurrentView}
        />
      )}
      
      {currentView === 'recipes' && (
        <PageWrapper>
          <RecipesView 
            recipes={recipes}
            setRecipes={setRecipes}
            openaiApiKey={openaiApiKey}
          />
        </PageWrapper>
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
    </div>
  );
}

export default App;