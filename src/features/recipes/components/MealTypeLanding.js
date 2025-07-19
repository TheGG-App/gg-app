// src/features/recipes/components/MealTypeLanding.js - Fixed to remove unused setIsImporting
import React, { useState } from 'react';
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
  handleImportClick,
  allRecipes,
  onRecipeClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  // Removed const [isImporting, setIsImporting] = useState(false);
  
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
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  cursor: isImporting || !importInput.trim() || !openaiApiKey 
                    ? 'not-allowed' 
                    : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  fontFamily: 'Georgia, serif',
                  opacity: isImporting || !importInput.trim() || !openaiApiKey ? 0.6 : 1
                }}
              >
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
            
            {!openaiApiKey && (
              <p style={{
                margin: '10px 0 0 0',
                fontSize: '0.8rem',
                color: '#dc2626',
                textAlign: 'center'
              }}>
                Please set your OpenAI API key in settings first
              </p>
            )}
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px 40px',
        borderBottom: '2px solid #fef3c7'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '3rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b4513 0%, #d2691e 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          What's on the menu?
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#92400e',
          margin: '0'
        }}>
          Choose a meal type to browse recipes
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        maxWidth: '600px',
        margin: '40px auto 0',
        padding: '0 20px'
      }}>
        <div style={{
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search all recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 20px 15px 50px',
              borderRadius: '30px',
              border: '3px solid #fbbf24',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'Georgia, serif',
              boxSizing: 'border-box',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.2)'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.3rem'
          }}>
            🔍
          </span>
        </div>

        {/* Search Results */}
        {searchTerm && filteredRecipes.length > 0 && (
          <div style={{
            marginTop: '20px',
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 30px rgba(139, 69, 19, 0.2)',
            border: '2px solid #fef3c7',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#8b4513',
              fontSize: '1.2rem'
            }}>
              Found {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              {filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => onRecipeClick(recipe)}
                  style={{
                    padding: '15px',
                    background: '#fffbeb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fef3c7';
                    e.currentTarget.style.borderColor = '#fbbf24';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fffbeb';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 4px 0',
                      color: '#8b4513',
                      fontSize: '1rem'
                    }}>
                      {recipe.title}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#92400e'
                    }}>
                      {recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1)}
                      {recipe.cookTime && ` • ${recipe.cookTime}`}
                    </p>
                  </div>
                  
                  <span style={{
                    fontSize: '1.2rem',
                    color: '#fbbf24'
                  }}>
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && filteredRecipes.length === 0 && (
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            color: '#92400e',
            fontSize: '1.1rem'
          }}>
            No recipes found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Meal Type Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '25px'
        }}>
          {/* All Recipes Card */}
          <div
            onClick={() => onSelectMealType('all')}
            style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              borderRadius: '20px',
              padding: '30px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 30px rgba(251, 191, 36, 0.3)',
              border: '3px solid #fbbf24',
              gridColumn: 'span 2'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(251, 191, 36, 0.3)';
            }}
          >
            <div style={{
              position: 'relative',
              zIndex: 2
            }}>
              <h2 style={{
                margin: '0 0 10px 0',
                fontSize: '2.5rem',
                color: '#8b4513',
                fontWeight: '700'
              }}>
                All Recipes
              </h2>
              <p style={{
                margin: '0 0 20px 0',
                fontSize: '1.2rem',
                color: '#92400e'
              }}>
                Browse your complete collection
              </p>
              <div style={{
                background: 'white',
                display: 'inline-block',
                padding: '12px 25px',
                borderRadius: '30px',
                fontSize: '1.3rem',
                fontWeight: '700',
                color: '#8b4513',
                boxShadow: '0 4px 15px rgba(139, 69, 19, 0.2)'
              }}>
                {getRecipeCount('all')} recipes
              </div>
            </div>
            
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '150px',
              opacity: 0.1,
              transform: 'rotate(-15deg)',
              pointerEvents: 'none'
            }}>
              📚
            </div>
          </div>

          {/* Individual Meal Type Cards */}
          {Object.entries(MEAL_TYPES).map(([key, mealType]) => (
            <div
              key={key}
              onClick={() => onSelectMealType(key)}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 30px rgba(139, 69, 19, 0.2)',
                border: '2px solid rgba(139, 69, 19, 0.1)',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(139, 69, 19, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 69, 19, 0.2)';
              }}
            >
              {/* Meal Type Image */}
              <div style={{
                height: '160px',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%), url(${mealTypeImages[key]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: '#8b4513',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                  {getRecipeCount(key)} recipes
                </div>
              </div>

              {/* Card Content */}
              <div style={{
                padding: '25px',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '10px'
                }}>
                  {mealType.icon}
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '1.5rem',
                  color: '#8b4513',
                  fontWeight: '700'
                }}>
                  {mealType.label}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: '#92400e'
                }}>
                  {mealType.time}
                </p>
              </div>

              {/* Hover Effect Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease'
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MealTypeLanding;