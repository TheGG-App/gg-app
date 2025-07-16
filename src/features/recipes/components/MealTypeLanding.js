// src/features/recipes/components/MealTypeLanding.js - Updated with Import Recipe button
import React from 'react';
import { MEAL_TYPES } from '../utils/recipeUtils';

function MealTypeLanding({ 
  onSelectMealType, 
  recipes, 
  showImport, 
  setShowImport, 
  importInput, 
  setImportInput, 
  isImporting, 
  openaiApiKey, 
  handleImportClick 
}) {
  const getRecipeCount = (mealType) => {
    if (mealType === 'all') return recipes.length;
    return recipes.filter(recipe => recipe.mealType === mealType).length;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '25px',
      padding: '40px',
      boxShadow: '0 12px 40px rgba(139, 90, 60, 0.15)',
      border: '2px solid #EEB182',
      textAlign: 'center'
    }}>
      {/* Header with Import Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '3rem',
            background: 'linear-gradient(135deg, #8B5A3C 0%, #CA8462 30%, #BF5B4B 60%, #EEB182 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 20px 0',
            fontWeight: '900',
            fontFamily: 'Georgia, serif'
          }}>
            🍳 Choose Your Recipe Category
          </h1>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#666',
            margin: '0',
            fontWeight: '500'
          }}>
            Browse your delicious collection by meal type
          </p>
        </div>

        {/* Import Recipe Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              background: 'linear-gradient(135deg, #8B5A3C 0%, #CA8462 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '15px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 15px rgba(139, 90, 60, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(139, 90, 60, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(139, 90, 60, 0.3)';
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
              zIndex: 100,
              marginTop: '10px',
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 8px 25px rgba(139, 90, 60, 0.3)',
              border: '2px solid #8B5A3C',
              minWidth: '400px',
              maxWidth: '500px'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#8B5A3C',
                fontSize: '1.2rem',
                fontWeight: '600',
                fontFamily: 'Georgia, serif'
              }}>
                🤖 AI Recipe Import
              </h3>
              
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
                  border: '2px solid #8B5A3C',
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
                      : 'linear-gradient(135deg, #8B5A3C 0%, #CA8462 100%)',
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
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {MEAL_TYPES.map(mealType => (
          <button
            key={mealType.key}
            onClick={() => onSelectMealType(mealType.key)}
            style={{
              background: 'linear-gradient(135deg, #8B5A3C 0%, #CA8462 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '25px 20px',
              cursor: 'pointer',
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(139, 90, 60, 0.3)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 8px 25px rgba(139, 90, 60, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(139, 90, 60, 0.3)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
              {mealType.icon}
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '1.3rem',
              fontWeight: '700'
            }}>
              {mealType.label}
            </h3>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              {mealType.desc}
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '15px',
              padding: '5px 12px',
              fontSize: '0.8rem',
              fontWeight: '600',
              margin: '10px auto 0 auto',
              display: 'inline-block'
            }}>
              {getRecipeCount(mealType.key)} recipes
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MealTypeLanding;