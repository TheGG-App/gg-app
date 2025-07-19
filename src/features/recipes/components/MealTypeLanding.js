// src/features/recipes/components/MealTypeLanding.js - Fixed with null checks
import React, { useState } from 'react';
import { MEAL_TYPES } from '../utils/recipeUtils';

function MealTypeLanding({ 
  onSelectMealType, 
  recipes = [], // Default to empty array
  showImport, 
  setShowImport, 
  importInput, 
  setImportInput, 
  isImporting, 
  openaiApiKey, 
  handleImportClick,
  allRecipes = [], // Default to empty array
  onRecipeClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add null check for recipes
  const safeRecipes = recipes || [];
  const safeAllRecipes = allRecipes || [];
  
  const getRecipeCount = (mealType) => {
    if (mealType === 'all') return safeRecipes.length;
    return safeRecipes.filter(recipe => recipe.mealType === mealType).length;
  };

  // Filter recipes based on search with null check
  const filteredRecipes = searchTerm 
    ? safeAllRecipes.filter(recipe =>
        recipe && recipe.title && recipe.ingredients && recipe.mealType && (
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.mealType.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : [];

  // Food images for each meal type
  const mealTypeImages = {
    breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300&h=200&fit=crop',
    lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
    dinner: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
    snack: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=200&fit=crop',
    dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
    drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop'
  };

  return (
    <div style={{
      background: 'white',
      minHeight: '100vh'
    }}>
      {/* Floating Import Button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowImport(true)}
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.3)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          Import Recipe
        </button>
      </div>

      {/* Import Modal */}
      {showImport && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowImport(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>✨</span>
              Import a Recipe
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#4b5563'
              }}>
                Recipe URL or Text
              </label>
              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="Paste a recipe URL (e.g., from AllRecipes, Food Network) or paste recipe text..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            {!openaiApiKey && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.85rem'
              }}>
                ⚠️ OpenAI API key required for recipe import. Add it in Settings.
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowImport(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImportClick}
                disabled={isImporting || !importInput.trim() || !openaiApiKey}
                style={{
                  background: isImporting || !importInput.trim() || !openaiApiKey
                    ? '#9ca3af'
                    : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: isImporting || !importInput.trim() || !openaiApiKey ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isImporting ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Importing...
                  </>
                ) : (
                  <>✨ Import</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        padding: '60px 20px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Georgia, serif'
          }}>
            Girl & The Gay
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: '#6b7280',
            margin: 0
          }}>
            What are we cooking today? 👨‍🍳
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 40px',
          position: 'relative'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search all recipes..."
            style={{
              width: '100%',
              padding: '16px 50px 16px 20px',
              fontSize: '1.1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '50px',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#06b6d4';
              e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          <span style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.3rem'
          }}>
            🔍
          </span>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div style={{
            marginBottom: '40px',
            background: '#f9fafb',
            borderRadius: '20px',
            padding: '30px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '1.3rem',
              color: '#1f2937'
            }}>
              Search Results ({filteredRecipes.length})
            </h3>
            
            {filteredRecipes.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {filteredRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => onRecipeClick && onRecipeClick(recipe)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '1.1rem',
                      color: '#1f2937'
                    }}>
                      {recipe.title}
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '15px',
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      <span>{MEAL_TYPES.find(m => m.key === recipe.mealType)?.label || recipe.mealType}</span>
                      <span>•</span>
                      <span>{recipe.cookTime || 'Time not set'}</span>
                      {recipe.nutrition?.servings && (
                        <>
                          <span>•</span>
                          <span>{recipe.nutrition.servings} servings</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '1rem',
                margin: 0
              }}>
                No recipes found matching "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {/* Meal Type Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {MEAL_TYPES.map(mealType => (
            <button
              key={mealType.key}
              onClick={() => onSelectMealType(mealType.key)}
              style={{
                background: 'white',
                border: '3px solid #06b6d4',
                borderRadius: '20px',
                padding: '0',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 6px 20px rgba(6, 182, 212, 0.15)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => {
                const button = e.currentTarget;
                button.style.transform = 'translateY(-5px)';
                button.style.boxShadow = '0 10px 30px rgba(6, 182, 212, 0.25)';
              }}
              onMouseOut={(e) => {
                const button = e.currentTarget;
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.15)';
              }}
            >
              {/* Food Image */}
              <div style={{
                width: '100%',
                height: '180px',
                backgroundImage: `url(${mealTypeImages[mealType.key]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
              </div>

              {/* Content Area */}
              <div style={{
                padding: '20px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'white'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    {mealType.label}
                  </h3>
                  <p style={{
                    margin: '0 0 15px 0',
                    fontSize: '0.95rem',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    {mealType.desc}
                  </p>
                </div>
                
                {/* Blue count box */}
                <div style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  margin: '0 auto',
                  display: 'inline-block'
                }}>
                  {getRecipeCount(mealType.key)} recipes
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CSS for spin animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default MealTypeLanding;