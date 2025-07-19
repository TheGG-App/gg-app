// src/features/recipes/components/RecipeModal.js - Fixed image size and button alignment
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please choose a file smaller than 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize image if too large
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          const maxWidth = 800;
          const maxHeight = 600;
          
          let { width, height } = img;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          onUpdate(recipe.id, { image: compressedDataUrl });
          setImageError(false);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const ingredientsList = displayRecipe.ingredients ? 
    (typeof displayRecipe.ingredients === 'string' ? displayRecipe.ingredients.split('\n').filter(ing => ing.trim()) : []) : [];
  const instructionsList = displayRecipe.instructions ? 
    (typeof displayRecipe.instructions === 'string' ? displayRecipe.instructions.split('\n').filter(inst => inst.trim()) : []) : [];

  // Calculate nutrition box height to align image
  const hasNutrition = displayRecipe.nutrition?.calories || displayRecipe.nutrition?.protein;
  const nutritionBoxHeight = hasNutrition ? 140 : 0; // Approximate height of nutrition box

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
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
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          borderBottom: '1px solid #f0f0f0',
          background: 'white'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* Recipe Image - Larger size */}
            <div 
              style={{
                width: '200px',
                height: nutritionBoxHeight ? `${80 + nutritionBoxHeight}px` : '200px',
                borderRadius: '15px',
                overflow: 'hidden',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
                border: '2px solid #e5e7eb',
                position: 'relative',
                transition: 'all 0.2s'
              }}
              onClick={() => document.getElementById('recipe-image-upload')?.click()}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#06b6d4';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {displayRecipe.image && !imageError ? (
                <>
                  <img
                    src={displayRecipe.image}
                    alt={displayRecipe.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={() => setImageError(true)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                  onMouseOut={(e) => e.currentTarget.style.opacity = 0}
                  >
                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>
                      Change Photo
                    </span>
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📸</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Add Photo
                  </div>
                </div>
              )}
              <input
                id="recipe-image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>

            {/* Recipe Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                margin: '0 0 5px 0',
                fontSize: '2rem',
                fontWeight: '700',
                color: '#1f2937',
                fontFamily: 'Georgia, serif'
              }}>
                {displayRecipe.title}
                {isShowingScaled && (
                  <span style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#f59e0b',
                    marginLeft: '10px'
                  }}>
                    (Adjusted Preview)
                  </span>
                )}
              </h2>
              
              {/* Source URL */}
              {displayRecipe.sourceUrl && (
                <div style={{ marginBottom: '10px' }}>
                  <a 
                    href={displayRecipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0891b2',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}
                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                  >
                    📖 View Original Recipe
                  </a>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                fontSize: '0.9rem',
                color: '#6b7280',
                marginBottom: '15px'
              }}>
                <span><strong>⏱️ Cook Time:</strong> {displayRecipe.cookTime}</span>
                <span><strong>🍽️ Servings:</strong> {displayRecipe.nutrition?.servings || 'Unknown'}</span>
              </div>

              {/* Nutrition Information */}
              {hasNutrition && (
                <div style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid #06b6d4',
                  boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)'
                }}>
                  <h4 style={{
                    margin: '0 0 10px 0',
                    color: '#1f2937',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    🥗 Nutrition Information
                    {displayRecipe.nutrition?.servings && ` (per serving)`}
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                    gap: '10px'
                  }}>
                    {displayRecipe.nutrition?.calories && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06b6d4' }}>
                          {formatNutritionValue(displayRecipe.nutrition.calories, '')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1f2937', fontWeight: '600' }}>
                          Calories
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition?.protein && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06b6d4' }}>
                          {formatNutritionValue(displayRecipe.nutrition.protein, 'g')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1f2937', fontWeight: '600' }}>
                          Protein
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition?.carbs && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06b6d4' }}>
                          {formatNutritionValue(displayRecipe.nutrition.carbs, 'g')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1f2937', fontWeight: '600' }}>
                          Carbs
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition?.fat && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06b6d4' }}>
                          {formatNutritionValue(displayRecipe.nutrition.fat, 'g')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1f2937', fontWeight: '600' }}>
                          Fat
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition?.fiber && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#06b6d4' }}>
                          {formatNutritionValue(displayRecipe.nutrition.fiber, 'g')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#1f2937', fontWeight: '600' }}>
                          Fiber
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Top Right Controls - Fixed alignment */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'center',
              height: '40px' // Fixed height to ensure alignment
            }}>
              {/* Adjust Button */}
              {!showScaleInput && !isShowingScaled && (
                <button
                  onClick={() => setShowScaleInput(true)}
                  disabled={!openaiApiKey}
                  style={{
                    background: openaiApiKey ? '#06b6d4' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    padding: '0 16px',
                    height: '40px', // Same height as close button
                    borderRadius: '8px',
                    cursor: openaiApiKey ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseOver={(e) => {
                    if (openaiApiKey) {
                      e.target.style.background = '#0891b2';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (openaiApiKey) {
                      e.target.style.background = '#06b6d4';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  Adjust
                </button>
              )}

              {/* Close Button */}
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
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
        </div>

        {/* Action Bar */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {showScaleInput && !isShowingScaled && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
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
                  border: '2px solid #e5e7eb',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                disabled={isScaling}
              />
              <button
                onClick={handleScale}
                disabled={isScaling || !targetServings}
                style={{
                  background: isScaling || !targetServings ? '#9ca3af' : '#06b6d4',
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
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e5e7eb';
                  e.target.style.color = '#4b5563';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#6b7280';
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
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#16a34a';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#22c55e';
                  e.target.style.transform = 'translateY(0)';
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
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#d97706';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f59e0b';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🔄 Reset to Original
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '30px',
          background: 'white'
        }}>
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
                color: '#1f2937',
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
                color: '#1f2937',
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
                    color: '#374151',
                    lineHeight: '1.6',
                    fontSize: '0.95rem'
                  }}>
                    {instruction.trim()}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Delete Recipe Button */}
          <div style={{
            marginTop: '40px',
            paddingTop: '30px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this recipe?')) {
                  onDelete(recipe.id);
                }
              }}
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '2px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#ef4444';
                e.target.style.borderColor = '#ef4444';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#fef2f2';
                e.target.style.borderColor = '#fecaca';
                e.target.style.color = '#dc2626';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🗑️ Delete Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;