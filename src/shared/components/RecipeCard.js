// src/shared/components/ModernRecipeCard.js
import React, { useState } from 'react';
import { scaleWithAI } from '../utils/aiHelpers';
import { formatNutritionValue } from '../utils/formatters';

function ModernRecipeCard({ item, isMeal, onUpdate, onDelete, openaiApiKey, onSaveScaled }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [scalingMode, setScalingMode] = useState(false);
  const [targetServings, setTargetServings] = useState('');
  const [isScaling, setIsScaling] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleTagUpdate = (tagName, value) => {
    onUpdate(item.id, {
      tags: { ...item.tags, [tagName]: value }
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdate(item.id, {
          image: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScale = async () => {
    const servings = parseInt(targetServings);
    if (!servings || servings <= 0) {
      alert('Please enter a valid number of servings');
      return;
    }

    setIsScaling(true);
    try {
      const scaledItem = await scaleWithAI(item, servings, openaiApiKey, isMeal);
      // Create new scaled recipe instead of updating existing
      const newScaledItem = {
        ...scaledItem,
        id: Date.now(),
        title: `${item.title} (${servings} servings)`
      };
      
      // Add to recipes list
      if (onSaveScaled) {
        onSaveScaled(newScaledItem);
      } else {
        // Fallback if onSaveScaled is not provided
        alert('Unable to save scaled recipe. Please try again.');
      }
      
      setScalingMode(false);
      setTargetServings('');
      alert(`Scaled ${isMeal ? 'meal' : 'recipe'} created successfully! ✨`);
    } catch (error) {
      alert('Error scaling: ' + error.message);
    } finally {
      setIsScaling(false);
    }
  };

  // Parse ingredients into array for better display
  const ingredientsList = item.ingredients ? item.ingredients.split('\n').filter(ing => ing.trim()) : [];
  
  // Parse instructions into numbered steps
  const instructionsList = item.instructions ? item.instructions.split('\n').filter(inst => inst.trim()) : [];

  return (
    <div style={{
      background: 'white',
      borderRadius: '15px',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(139, 90, 60, 0.1)',
      border: '1px solid #EEB182',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}>
      {/* Recipe Header - Always Visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          borderBottom: isExpanded ? '1px solid #EEB182' : 'none'
        }}
      >
        {/* Recipe Image */}
        <div style={{
          width: '120px',
          height: '80px',
          borderRadius: '10px',
          overflow: 'hidden',
          background: '#F0D0C1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              color: '#8B5A3C',
              fontSize: '2rem'
            }}>
              🍽️
            </div>
          )}
          
          {/* Upload overlay on hover */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Recipe Info */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '1.4rem',
            fontWeight: '600',
            color: '#333'
          }}>
            {isMeal ? '🍽️ ' : ''}{item.title}
          </h3>
          
          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '10px'
          }}>
            {item.nutrition?.servings && (
              <span><strong>Servings:</strong> {item.nutrition.servings}</span>
            )}
            {item.nutrition?.calories && (
              <span><strong>Calories:</strong> {formatNutritionValue(item.nutrition.calories, '')}</span>
            )}
            <span><strong>Type:</strong> {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}</span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: isMeal ? '#BF5B4B' : '#8B5A3C',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {isMeal ? 'Multi-Recipe Meal' : 'Recipe'}
            </span>
            
            {item.tags?.familyApproved && (
              <span style={{
                background: '#22c55e',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                👨‍👩‍👧‍👦 Family Approved
              </span>
            )}
            
            {item.tags?.mealPrep && (
              <span style={{
                background: '#8B5A3C',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '500'
              }}>
                🥘 Meal Prep
              </span>
            )}
          </div>
        </div>

        {/* Expand Arrow */}
        <div style={{
          fontSize: '1.5rem',
          color: '#8B5A3C',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '25px' }}>
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '25px',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => setEditingTags(!editingTags)}
              style={{
                background: '#8B5A3C',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              🏷️ Edit Tags
            </button>
            
            {openaiApiKey && (
              <button 
                onClick={() => setScalingMode(!scalingMode)}
                disabled={isScaling}
                style={{
                  background: scalingMode ? '#fbbf24' : '#06b6d4',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '8px',
                  cursor: isScaling ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {scalingMode ? 'Cancel Scale' : '⚖️ Scale Recipe'}
              </button>
            )}
            
            <button 
              onClick={() => onDelete(item.id)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              🗑️ Delete
            </button>
          </div>

          {/* Tag Editing */}
          {editingTags && (
            <div style={{
              background: '#F0D0C1',
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '10px',
              border: '1px solid #EEB182'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#8B5A3C' }}>Edit Tags</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.tags?.familyApproved || false}
                    onChange={(e) => handleTagUpdate('familyApproved', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ color: '#8B5A3C', fontWeight: '600' }}>👨‍👩‍👧‍👦 Family Approved</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={item.tags?.mealPrep || false}
                    onChange={(e) => handleTagUpdate('mealPrep', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ color: '#8B5A3C', fontWeight: '600' }}>🥘 Meal Prep</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Scaling Interface */}
          {scalingMode && (
            <div style={{
              background: '#F0D0C1',
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '10px',
              border: '1px solid #EEB182'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#8B5A3C' }}>🤖 Scale {isMeal ? 'Meal' : 'Recipe'}</h4>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#666' }}>
                Current: {item.nutrition?.servings || 'Unknown'} servings → Scale to:
              </p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  max="50"
                  placeholder="New servings"
                  value={targetServings}
                  onChange={(e) => setTargetServings(e.target.value)}
                  style={{
                    width: '120px',
                    padding: '10px',
                    borderRadius: '8px',
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
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: isScaling || !targetServings ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {isScaling ? '🔄 Scaling...' : '✨ Create Scaled Version'}
                </button>
              </div>
            </div>
          )}

          {/* Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '25px'
          }}>
            {/* Ingredients */}
            <div>
              <h4 style={{
                margin: '0 0 15px 0',
                color: '#8B5A3C',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                🛒 {isMeal ? 'Combined ' : ''}Ingredients
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {ingredientsList.map((ingredient, index) => (
                  <li key={index} style={{
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      background: '#8B5A3C',
                      borderRadius: '50%',
                      marginTop: '6px',
                      flexShrink: 0
                    }}></span>
                    <span style={{
                      color: '#333',
                      lineHeight: '1.4'
                    }}>
                      {ingredient.trim()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h4 style={{
                margin: '0 0 15px 0',
                color: '#8B5A3C',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>
                👨‍🍳 {isMeal ? 'Combined ' : ''}Instructions
              </h4>
              <ol style={{
                padding: '0 0 0 20px',
                margin: 0
              }}>
                {instructionsList.map((instruction, index) => (
                  <li key={index} style={{
                    marginBottom: '12px',
                    color: '#333',
                    lineHeight: '1.5'
                  }}>
                    {instruction.trim()}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Nutrition Info */}
          {(item.nutrition?.calories || item.nutrition?.protein || item.nutrition?.servings) && (
            <div style={{
              marginTop: '25px',
              background: '#F0D0C1',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #EEB182'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#8B5A3C' }}>
                🥗 {isMeal ? 'Combined ' : ''}Nutrition {item.nutrition?.servings && `(makes ${item.nutrition.servings} servings)`}
              </h4>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
                {item.nutrition?.calories && (
                  <span style={{ color: '#333', fontWeight: '600' }}>
                    Calories: {formatNutritionValue(item.nutrition.calories, '')}
                  </span>
                )}
                {item.nutrition?.protein && (
                  <span style={{ color: '#333', fontWeight: '600' }}>
                    Protein: {formatNutritionValue(item.nutrition.protein, 'g')}
                  </span>
                )}
                {item.nutrition?.carbs && (
                  <span style={{ color: '#333', fontWeight: '600' }}>
                    Carbs: {formatNutritionValue(item.nutrition.carbs, 'g')}
                  </span>
                )}
                {item.nutrition?.fat && (
                  <span style={{ color: '#333', fontWeight: '600' }}>
                    Fat: {formatNutritionValue(item.nutrition.fat, 'g')}
                  </span>
                )}
                {item.nutrition?.fiber && (
                  <span style={{ color: '#333', fontWeight: '600' }}>
                    Fiber: {formatNutritionValue(item.nutrition.fiber, 'g')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ModernRecipeCard;