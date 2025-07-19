// src/features/recipes/components/RecipeEditModal.js - Full recipe edit modal
import React, { useState, useEffect } from 'react';
import { MEAL_TYPES } from '../utils/recipeUtils';

function RecipeEditModal({ recipe, isOpen, onClose, onUpdate }) {
  const [editedRecipe, setEditedRecipe] = useState(recipe);

  useEffect(() => {
    if (recipe) {
      setEditedRecipe(recipe);
    }
  }, [recipe]);

  if (!isOpen || !recipe) return null;

  const updateField = (field, value) => {
    setEditedRecipe(prev => ({ ...prev, [field]: value }));
  };

  const updateNutrition = (field, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value }
    }));
  };

  const handleSave = () => {
    onUpdate(recipe.id, editedRecipe);
    onClose();
  };

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
          maxWidth: '700px',
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            fontFamily: 'Georgia, serif'
          }}>
            Edit Recipe
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '30px'
        }}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Recipe Title
            </label>
            <input
              type="text"
              value={editedRecipe.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Meal Type and Cook Time */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                Meal Type
              </label>
              <select
                value={editedRecipe.mealType || 'dinner'}
                onChange={(e) => updateField('mealType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  background: 'white',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {MEAL_TYPES.map(type => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#374151',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                Cook Time
              </label>
              <input
                type="text"
                value={editedRecipe.cookTime || ''}
                onChange={(e) => updateField('cookTime', e.target.value)}
                placeholder="e.g., 30 minutes"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Ingredients
            </label>
            <textarea
              value={editedRecipe.ingredients || ''}
              onChange={(e) => updateField('ingredients', e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#374151',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Instructions
            </label>
            <textarea
              value={editedRecipe.instructions || ''}
              onChange={(e) => updateField('instructions', e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Nutrition */}
          <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#1f2937',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Nutrition Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px'
            }}>
              {[
                { key: 'servings', label: 'Servings' },
                { key: 'calories', label: 'Calories' },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fat', label: 'Fat (g)' },
                { key: 'fiber', label: 'Fiber (g)' }
              ].map(field => (
                <div key={field.key}>
                  <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#6b7280',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}>
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={editedRecipe.nutrition?.[field.key] || ''}
                    onChange={(e) => updateNutrition(field.key, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
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
          
          <button
            onClick={handleSave}
            style={{
              background: '#06b6d4',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#0891b2';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#06b6d4';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeEditModal;