// src/features/recipes/components/RecipeModal.js - Clean version without image generation
import React, { useState, useEffect } from 'react';
import { scaleWithAI } from '../../../shared/utils/aiHelpers';
import IngredientItem from './IngredientItem';
import { formatNutritionValue } from '../../../shared/utils/formatters';

function RecipeModal({ recipe, isOpen, onClose, onUpdate, onDelete, openaiApiKey, onSaveScaled }) {
  const [scaledRecipe, setScaledRecipe] = useState(null);
  const [targetServings, setTargetServings] = useState('');
  const [isScaling, setIsScaling] = useState(false);
  const [showScaleInput, setShowScaleInput] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScaledRecipe(null);
      setTargetServings('');
      setShowScaleInput(false);
      setImageError(false);
    }
  }, [isOpen, recipe?.id]);

  // Use scaled recipe if available, otherwise original
  const displayRecipe = scaledRecipe || recipe;
  const isShowingScaled = Boolean(scaledRecipe);

  if (!isOpen || !recipe) return null;

  const handleScale = async () => {
    const servings = parseInt(targetServings);
    if (!servings || servings <= 0) {
      alert('Please enter a valid number of servings');
      return;
    }

    setIsScaling(true);
    try {
      const scaled = await scaleWithAI(recipe, servings, openaiApiKey, false, false);
      setScaledRecipe(scaled);
      setShowScaleInput(false);
      setTargetServings('');
    } catch (error) {
      alert('Error adjusting recipe: ' + error.message);
    } finally {
      setIsScaling(false);
    }
  };

  const handleSaveScaled = () => {
    if (scaledRecipe && onSaveScaled) {
      const newRecipe = {
        ...scaledRecipe,
        id: Date.now(),
        title: `${recipe.title} (${scaledRecipe.nutrition.servings} servings)`,
        isScaledPreview: false,
        originalId: null
      };
      onSaveScaled(newRecipe);
      alert('Adjusted recipe saved! ✨');
    }
  };

  const handleResetScale = () => {
    setScaledRecipe(null);
    setShowScaleInput(false);
    setTargetServings('');
  };

  const ingredientsList = displayRecipe.ingredients ? 
    displayRecipe.ingredients.split('\n').filter(ing => ing.trim()) : [];
  const instructionsList = displayRecipe.instructions ? 
    displayRecipe.instructions.split('\n').filter(inst => inst.trim()) : [];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(139, 90, 60, 0.3)',
          border: '3px solid #8B5A3C',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          borderBottom: '2px solid #EEB182',
          background: 'linear-gradient(135deg, #F0D0C1 0%, rgba(255, 255, 255, 0.9) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                margin: '0 0 10px 0',
                fontSize: '2rem',
                fontWeight: '700',
                color: '#8B5A3C',
                fontFamily: 'Georgia, serif'
              }}>
                {displayRecipe.title}
                {isShowingScaled && (
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#BF5B4B',
                    marginLeft: '10px'
                  }}>
                    (Adjusted Preview)
                  </span>
                )}
              </h2>
              
              <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <span><strong>⏱️ Cook Time:</strong> {displayRecipe.cookTime}</span>
                <span><strong>🍽️ Servings:</strong> {displayRecipe.nutrition?.servings || 'Unknown'}</span>
                <span><strong>🥘 Type:</strong> {displayRecipe.mealType.charAt(0).toUpperCase() + displayRecipe.mealType.slice(1)}</span>
                {displayRecipe.nutrition?.calories && (
                  <span><strong>🔥 Calories:</strong> {formatNutritionValue(displayRecipe.nutrition.calories, '')}</span>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginLeft: '20px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #EEB182',
          background: '#F0D0C1',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {!showScaleInput && !isShowingScaled && (
            <button
              onClick={() => setShowScaleInput(true)}
              disabled={!openaiApiKey}
              style={{
                background: openaiApiKey ? '#06b6d4' : '#9ca3af',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: openaiApiKey ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              ⚖️ Adjust Recipe
            </button>
          )}

          {showScaleInput && !isShowingScaled && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#8B5A3C' }}>
                Adjust to:
              </span>
              <input
                type="number"
                min="1"
                max="50"
                placeholder="servings"
                value={targetServings}
                onChange={(e) => setTargetServings(e.target.value)}
                style={{
                  width: '80px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '2px solid #8B5A3C',
                  outline: 'none'
                }}
                disabled={isScaling}
              />
              <button
                onClick={handleScale}
                disabled={isScaling || !targetServings}
                style={{
                  background: isScaling || !targetServings ? '#9ca3af' : '#8B5A3C',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: isScaling || !targetServings ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {isScaling ? '🔄 Adjusting...' : '✨ Preview'}
              </button>
              <button
                onClick={() => setShowScaleInput(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {isShowingScaled && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleSaveScaled}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                💾 Save Adjusted Recipe
              </button>
              <button
                onClick={handleResetScale}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                🔄 Reset to Original
              </button>
            </div>
          )}

          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => onDelete(recipe.id)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#dc2626';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#ef4444';
                e.target.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '30px'
        }}>
          {/* Recipe Image - Manual Only */}
          {displayRecipe.image && !imageError && (
            <div style={{
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <img
                src={displayRecipe.image}
                alt={displayRecipe.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '15px',
                  boxShadow: '0 8px 25px rgba(139, 90, 60, 0.2)'
                }}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Nutrition Information */}
          {(displayRecipe.nutrition?.calories || displayRecipe.nutrition?.protein) && (
            <div style={{
              background: '#F0D0C1',
              padding: '20px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '2px solid #EEB182'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#8B5A3C',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                🥗 Nutrition Information
                {displayRecipe.nutrition?.servings && ` (per serving of ${displayRecipe.nutrition.servings})`}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '15px'
              }}>
                {displayRecipe.nutrition?.calories && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#BF5B4B' }}>
                      {formatNutritionValue(displayRecipe.nutrition.calories, '')}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#8B5A3C', fontWeight: '600' }}>
                      Calories
                    </div>
                  </div>
                )}
                {displayRecipe.nutrition?.protein && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B5A3C' }}>
                      {formatNutritionValue(displayRecipe.nutrition.protein, 'g')}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#8B5A3C', fontWeight: '600' }}>
                      Protein
                    </div>
                  </div>
                )}
                {displayRecipe.nutrition?.carbs && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#CA8462' }}>
                      {formatNutritionValue(displayRecipe.nutrition.carbs, 'g')}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#8B5A3C', fontWeight: '600' }}>
                      Carbs
                    </div>
                  </div>
                )}
                {displayRecipe.nutrition?.fat && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#EEB182' }}>
                      {formatNutritionValue(displayRecipe.nutrition.fat, 'g')}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#8B5A3C', fontWeight: '600' }}>
                      Fat
                    </div>
                  </div>
                )}
                {displayRecipe.nutrition?.fiber && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                      {formatNutritionValue(displayRecipe.nutrition.fiber, 'g')}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#8B5A3C', fontWeight: '600' }}>
                      Fiber
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px'
          }}>
            {/* Ingredients */}
            <div>
              <h3 style={{
                margin: '0 0 20px 0',
                color: '#8B5A3C',
                fontSize: '1.4rem',
                fontWeight: '700',
                fontFamily: 'Georgia, serif',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🛒 Ingredients
                {isShowingScaled && (
                  <span style={{
                    fontSize: '0.8rem',
                    background: '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px'
                  }}>
                    ADJUSTED
                  </span>
                )}
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {ingredientsList.map((ingredient, index) => (
                  <IngredientItem 
                    key={index}
                    ingredient={ingredient}
                    openaiApiKey={openaiApiKey}
                  />
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 style={{
                margin: '0 0 20px 0',
                color: '#8B5A3C',
                fontSize: '1.4rem',
                fontWeight: '700',
                fontFamily: 'Georgia, serif',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                👨‍🍳 Instructions
                {isShowingScaled && (
                  <span style={{
                    fontSize: '0.8rem',
                    background: '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px'
                  }}>
                    ADJUSTED
                  </span>
                )}
              </h3>
              <ol style={{
                padding: '0 0 0 20px',
                margin: 0
              }}>
                {instructionsList.map((instruction, index) => (
                  <li key={index} style={{
                    marginBottom: '15px',
                    color: '#333',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                  }}>
                    {instruction.trim()}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Source URL */}
          {displayRecipe.sourceUrl && (
            <div style={{
              marginTop: '30px',
              padding: '15px',
              background: 'rgba(139, 90, 60, 0.1)',
              borderRadius: '10px',
              borderLeft: '4px solid #8B5A3C'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#8B5A3C' }}>
                📖 Original Recipe Source:
              </p>
              <a 
                href={displayRecipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#BF5B4B',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                {displayRecipe.sourceUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;