// src/features/recipes/components/RecipeModal.js - Updated with optimized images
import React, { useState, useEffect } from 'react';
import { scaleWithAI } from '../../../shared/utils/aiHelpers';
import IngredientItem from './IngredientItem';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import { formatNutritionValue } from '../../../shared/utils/formatters';

function RecipeModal({ recipe, isOpen, onClose, onUpdate, onDelete, openaiApiKey, onSaveScaled }) {
  const [scaledRecipe, setScaledRecipe] = useState(null);
  const [targetServings, setTargetServings] = useState('');
  const [isScaling, setIsScaling] = useState(false);
  const [showScaleInput, setShowScaleInput] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScaledRecipe(null);
      setTargetServings('');
      setShowScaleInput(false);
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

      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate(recipe.id, { image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Backdrop */}
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
          padding: '20px',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '90%',
          maxWidth: '900px',
          height: '90vh',
          maxHeight: '800px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideIn 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '30px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#6b7280',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Recipe Title */}
          <h2 style={{
            margin: '0 40px 0 0',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: '800',
            color: '#1f2937',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.2'
          }}>
            {displayRecipe.title}
          </h2>

          {/* Time and Servings */}
          <div style={{
            display: 'flex',
            gap: '30px',
            marginTop: '15px',
            fontSize: '1rem',
            color: '#6b7280'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⏱️</span>
              <span style={{ fontWeight: '600' }}>{displayRecipe.cookTime || 'Time not specified'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🍽️</span>
              <span style={{ fontWeight: '600' }}>
                {displayRecipe.nutrition?.servings || '?'} servings
              </span>
            </span>
            {displayRecipe.nutrition?.calories && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔥</span>
                <span style={{ fontWeight: '600' }}>
                  {formatNutritionValue(displayRecipe.nutrition.calories, '')} cal/serving
                </span>
              </span>
            )}
          </div>

          {/* Scaling Controls */}
          <div style={{ marginTop: '20px' }}>
            {!showScaleInput ? (
              <button
                onClick={() => setShowScaleInput(true)}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.2)',
                  transition: 'all 0.2s ease',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(6, 182, 212, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.2)';
                }}
              >
                ⚖️ Adjust Servings
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetServings}
                  onChange={(e) => setTargetServings(e.target.value)}
                  placeholder="Servings"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    width: '100px',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  onClick={handleScale}
                  disabled={isScaling || !targetServings}
                  style={{
                    background: isScaling || !targetServings ? '#9ca3af' : '#06b6d4',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: isScaling || !targetServings ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isScaling ? '🔄 Scaling...' : '✨ Scale'}
                </button>
                <button
                  onClick={() => {
                    setShowScaleInput(false);
                    setTargetServings('');
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Scaled Recipe Actions */}
          {isShowingScaled && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <span style={{
                color: '#065f46',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                ✅ Recipe scaled to {scaledRecipe.nutrition.servings} servings
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSaveScaled}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                >
                  💾 Save as New
                </button>
                <button
                  onClick={handleResetScale}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '30px',
          background: 'white',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '350px 1fr' : '1fr',
            gap: '30px'
          }}>
            {/* Left Column - Image and Actions */}
            <div>
              {/* Recipe Image */}
              <div style={{
                marginBottom: '20px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                background: '#f3f4f6'
              }}>
                <OptimizedImage
                  src={displayRecipe.image}
                  alt={displayRecipe.title}
                  aspectRatio="4:3"
                  placeholder="🍽️"
                  priority={true}
                />
                
                {/* Image Upload Overlay */}
                <label 
                  htmlFor="recipe-image-upload"
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.2s ease',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'}
                >
                  📸 {displayRecipe.image ? 'Change' : 'Add'} Photo
                </label>
                <input
                  id="recipe-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px'
              }}>
                <button
                  onClick={() => {
                    // Implement edit functionality
                    alert('Edit feature coming soon! 🚧');
                  }}
                  style={{
                    flex: 1,
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(recipe.id)}
                  style={{
                    flex: 1,
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#fecaca';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              {/* Nutrition Box */}
              {displayRecipe.nutrition && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                  border: '2px solid #f59e0b',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                }}>
                  <h4 style={{
                    margin: '0 0 15px 0',
                    color: '#92400e',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🥗 Nutrition per Serving
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    {displayRecipe.nutrition.calories && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#92400e' }}>
                          {formatNutritionValue(displayRecipe.nutrition.calories, '')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: '600' }}>
                          Calories
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition.protein && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#92400e' }}>
                          {formatNutritionValue(displayRecipe.nutrition.protein, 'g')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: '600' }}>
                          Protein
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition.carbs && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#92400e' }}>
                          {formatNutritionValue(displayRecipe.nutrition.carbs, 'g')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: '600' }}>
                          Carbs
                        </div>
                      </div>
                    )}
                    {displayRecipe.nutrition.fat && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        padding: '12px',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#92400e' }}>
                          {formatNutritionValue(displayRecipe.nutrition.fat, 'g')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#78350f', fontWeight: '600' }}>
                          Fat
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Ingredients and Instructions */}
            <div>
              {/* Ingredients */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  fontFamily: 'Georgia, serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>🛒</span>
                  Ingredients
                </h3>
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb'
                }}>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gap: '12px'
                  }}>
                    {displayRecipe.ingredients.split('\n').filter(ing => ing.trim()).map((ingredient, index) => (
                      <IngredientItem
                        key={index}
                        ingredient={ingredient}
                        isScaled={isShowingScaled}
                      />
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  fontFamily: 'Georgia, serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span>👨‍🍳</span>
                  Instructions
                </h3>
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #bbf7d0'
                }}>
                  <ol style={{
                    margin: 0,
                    padding: '0 0 0 20px',
                    display: 'grid',
                    gap: '16px'
                  }}>
                    {displayRecipe.instructions.split('\n').filter(inst => inst.trim()).map((instruction, index) => (
                      <li key={index} style={{
                        color: '#1f2937',
                        lineHeight: '1.6',
                        paddingLeft: '8px'
                      }}>
                        {instruction.trim()}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}

export default RecipeModal;