// src/features/recipes/components/RecipeImportConfirmation.js - Fixed imports
import React, { useState, useEffect, useRef } from 'react';
import { MEAL_TYPES, BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';

function RecipeImportConfirmation({ recipe, isOpen, onConfirm, onCancel }) {
  const [editedRecipe, setEditedRecipe] = useState(recipe || {});
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (recipe) {
      setEditedRecipe(recipe);
      setImageError(false);
    }
  }, [recipe]);

  if (!isOpen || !recipe) return null;

  const updateRecipe = (field, value) => {
    setEditedRecipe(prev => ({ ...prev, [field]: value }));
  };

  const updateNutrition = (field, value) => {
    setEditedRecipe(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value }
    }));
  };

  const updateTag = (tagKey, checked) => {
    setEditedRecipe(prev => ({
      ...prev,
      tags: { ...prev.tags, [tagKey]: checked }
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateRecipe('image', e.target.result);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    onConfirm(editedRecipe);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 5px 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#1f2937',
              fontFamily: 'Georgia, serif'
            }}>
              📝 Confirm Recipe Import
            </h2>
            <p style={{
              margin: 0,
              fontSize: '1rem',
              color: '#6b7280'
            }}>
              Review and customize your recipe before adding
            </p>
          </div>
          
          {/* Add Recipe Button - GREEN */}
          <button
            onClick={handleConfirm}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>+</span>
            Add Recipe
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '25px 30px',
          background: '#fafafa'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '30px'
          }}>
            {/* Left Column - Image & Basic Info */}
            <div>
              {/* Recipe Image */}
              <div style={{
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div 
                  style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px',
                    border: '2px solid #e5e7eb',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#22c55e';
                    e.currentTarget.style.background = '#f0fdf4';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  {editedRecipe.image && !imageError ? (
                    <img
                      src={editedRecipe.image}
                      alt={editedRecipe.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#9ca3af'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🍽️</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        Click to upload image
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Recipe Title */}
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
                  onChange={(e) => updateRecipe('title', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Georgia, serif',
                    fontWeight: '600',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Meal Type */}
              <div style={{ marginBottom: '20px' }}>
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
                  onChange={(e) => updateRecipe('mealType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Georgia, serif',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    background: 'white',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  {MEAL_TYPES.map(type => (
                    <option key={type.key} value={type.key}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cook Time */}
              <div style={{ marginBottom: '20px' }}>
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
                  onChange={(e) => updateRecipe('cookTime', e.target.value)}
                  placeholder="e.g., 30 minutes"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Right Column - Nutrition & Tags */}
            <div>
              {/* Nutrition Information */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '25px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                <h3 style={{
                  margin: '0 0 15px 0',
                  color: '#1f2937',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  🥗 Nutrition Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px'
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
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Section - NO TITLE */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
              }}>
                {/* Basic Tags */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    margin: '0 0 10px 0',
                    color: '#374151',
                    fontSize: '1rem'
                  }}>
                    Basic Tags
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {BASIC_TAGS.map(tag => (
                      <label
                        key={tag.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: editedRecipe.tags?.[tag.key] 
                            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 163, 74, 0.1) 100%)' 
                            : '#f9fafb',
                          border: `2px solid ${editedRecipe.tags?.[tag.key] ? '#22c55e' : '#e5e7eb'}`,
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editedRecipe.tags?.[tag.key] || false}
                          onChange={(e) => updateTag(tag.key, e.target.checked)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '1.1rem' }}>{tag.icon}</span>
                        <span style={{ fontWeight: '600', color: '#374151' }}>
                          {tag.label}
                        </span>
                        {editedRecipe.tags?.[tag.key] && (
                          <span style={{ fontSize: '0.9rem', color: '#22c55e' }}>✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cooking Methods */}
                <div>
                  <h4 style={{
                    margin: '0 0 10px 0',
                    color: '#374151',
                    fontSize: '1rem'
                  }}>
                    Cooking Methods
                  </h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {COOKING_METHODS.map(method => (
                      <label
                        key={method.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: editedRecipe.tags?.[method.key] 
                            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)' 
                            : '#f9fafb',
                          border: `2px solid ${editedRecipe.tags?.[method.key] ? '#06b6d4' : '#e5e7eb'}`,
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editedRecipe.tags?.[method.key] || false}
                          onChange={(e) => updateTag(method.key, e.target.checked)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: '1.1rem' }}>{method.icon}</span>
                        <span style={{ fontWeight: '600', color: '#374151' }}>
                          {method.label}
                        </span>
                        {editedRecipe.tags?.[method.key] && (
                          <span style={{ fontSize: '0.9rem', color: '#06b6d4' }}>✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '1px solid #f0f0f0',
          background: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              fontFamily: 'Georgia, serif',
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
          
          <div style={{ fontSize: '0.9rem', color: '#9ca3af', fontStyle: 'italic' }}>
            Click "Add Recipe" to save to your collection
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeImportConfirmation;