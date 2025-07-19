// src/features/recipes/components/MealTypeLanding.js - Updated with search and fixed hover
import React, { useState } from 'react';
import { MEAL_TYPES } from '../utils/recipeUtils';
import CompactSquareRecipeCard from './CompactSquareRecipeCard';

function MealTypeLanding({ 
  onSelectMealType, 
  recipes, 
  showImport, 
  setShowImport, 
  importInput, 
  setImportInput, 
  isImporting, 
  openaiApiKey, 
  handleImportClick,
  allRecipes,
  onRecipeClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const getRecipeCount = (mealType) => {
    if (mealType === 'all') return recipes.length;
    return recipes.filter(recipe => recipe.mealType === mealType).length;
  };

  // Filter recipes based on search
  const filteredRecipes = searchTerm 
    ? allRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.mealType.toLowerCase().includes(searchTerm.toLowerCase())
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
            borderRadius: '15px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            fontFamily: 'Georgia, serif',
            boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
          }}
        >
          + Import Recipe
        </button>
        
        {/* AI Import Modal - Right Below Import Button */}
        {showImport && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '10px',
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)',
            border: '2px solid #06b6d4',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <textarea
              placeholder="Paste recipe URL (https://...) or raw recipe text here..."
              value={importInput}
              onChange={(e) => setImportInput(e.target.value)}
              disabled={isImporting}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #06b6d4',
                fontSize: '0.9rem',
                outline: 'none',
                background: 'white',
                marginBottom: '15px',
                resize: 'vertical',
                fontFamily: 'Georgia, serif',
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowImport(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  fontFamily: 'Georgia, serif'
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
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: isImporting || !importInput.trim() || !openaiApiKey ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  fontFamily: 'Georgia, serif'
                }}
              >
                {isImporting ? '🔄 Importing...' : '✨ Import'}
              </button>
            </div>

            {!openaiApiKey && (
              <div style={{
                marginTop: '10px',
                padding: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '0.8rem'
              }}>
                ⚠️ OpenAI API key required for recipe import
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        padding: '40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Title Only */}
        <h1 style={{
          fontSize: '3rem',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 30%, #0369a1 60%, #075985 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 30px 0',
          fontWeight: '900',
          fontFamily: 'Georgia, serif',
          textAlign: 'center'
        }}>
          G&G Recipe Collection
        </h1>

        {/* Search Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 40px auto'
        }}>
          <input
            type="text"
            placeholder="Search all recipes by name, ingredient, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '15px',
              border: '2px solid #e5e7eb',
              fontSize: '1rem',
              outline: 'none',
              background: 'white',
              fontFamily: 'Georgia, serif',
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#06b6d4';
              e.target.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
            }}
          />
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div style={{
            marginBottom: '40px',
            background: 'white',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f0f0f0'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              fontSize: '1.5rem',
              color: '#1f2937',
              fontWeight: '700'
            }}>
              Search Results ({filteredRecipes.length})
            </h2>
            
            {filteredRecipes.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {filteredRecipes.map(recipe => (
                  <CompactSquareRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={onRecipeClick}
                    onUpdate={(id, updates) => {
                      // Update recipe in the parent component
                      console.log('Update recipe:', id, updates);
                    }}
                  />
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
          margin: '0 auto 60px auto'
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
              {/* Food Image - No emoji overlay */}
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

        {/* Recent Recipes Section */}
        {allRecipes.length > 0 && !searchTerm && (
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '2rem',
              color: '#1f2937',
              fontWeight: '700',
              fontFamily: 'Georgia, serif',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              Recent Recipes
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '25px'
            }}>
              {allRecipes.slice(0, 6).map(recipe => (
                <CompactSquareRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={onRecipeClick}
                  onUpdate={(id, updates) => {
                    // Update recipe in the parent component
                    console.log('Update recipe:', id, updates);
                  }}
                />
              ))}
            </div>
            
            {allRecipes.length > 6 && (
              <div style={{
                textAlign: 'center',
                marginTop: '30px'
              }}>
                <button
                  onClick={() => onSelectMealType('all')}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    fontFamily: 'Georgia, serif',
                    boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
                  }}
                >
                  View All Recipes →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MealTypeLanding;