// src/features/recipes/components/RecipeImportConfirmation.js - Clean version without image generation
import React, { useState, useEffect, useRef } from 'react';
import { MEAL_TYPES, BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';

function RecipeImportConfirmation({ recipe, isOpen, onConfirm, onCancel }) {
  const [editedRecipe, setEditedRecipe] = useState(recipe || {});
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Update editedRecipe when recipe prop changes
  useEffect(() => {
    if (recipe) {
      setEditedRecipe(recipe);
      setCustomImageUrl('');
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

  const handleImageChange = () => {
    if (customImageUrl.trim()) {
      updateRecipe('image', customImageUrl.trim());
      setCustomImageUrl('');
      setImageError(false);
    }
  };

  const handleConfirm = () => {
    onConfirm(editedRecipe);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        boxShadow: '0 20px 60px rgba(139, 90, 60, 0.4)',
        border: '3px solid #8B5A3C',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px 30px',
          borderBottom: '2px solid #EEB182',
          background: 'linear-gradient(135deg, #F0D0C1 0%, rgba(255, 255, 255, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: '0 0 5px 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#8B5A3C',
              fontFamily: 'Georgia, serif'
            }}>
              🤖 Confirm Recipe Import
            </h2>
            <p style={{
              margin: 0,
              fontSize: '1rem',
              color: '#666'
            }}>
              Review and customize your recipe before adding it
            </p>
          </div>
          
          {/* Add Recipe Button */}
          <button
            onClick={handleConfirm}
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
          >
            +
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '25px 30px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: '30px'
          }}>
            {/* Left Column - Image & Basic Info */}
            <div>
              {/* Recipe Image - With Upload */}
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
                    background: '#F0D0C1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px',
                    border: '2px solid #8B5A3C',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current?.click()}
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
                      color: '#8B5A3C'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🍽️</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        Click to upload image
                      </div>
                    </div>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          updateRecipe('image', event.target.result);
                          setImageError(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                
                {/* Manual Image URL Input */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="url"
                    placeholder="Or paste image URL here..."
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: '2px solid #8B5A3C',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleImageChange}
                    style={{
                      background: '#8B5A3C',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}
                  >
                    Set
                  </button>
                </div>
              </div>

              {/* Recipe Title */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#8B5A3C',
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
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #8B5A3C',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Georgia, serif',
                    fontWeight: '600',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Meal Type */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#8B5A3C',
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
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #8B5A3C',
                    fontSize: '1rem',
                    outline: 'none',
                    fontFamily: 'Georgia, serif',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  {MEAL_TYPES.map(type => (
                    <option key={type.key} value={type.key}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cook Time */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#8B5A3C',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  Cook Time
                </label>
                <input
                  type="text"
                  value={editedRecipe.cookTime || ''}
                  onChange={(e) => updateRecipe('cookTime', e.target.value)}
                  placeholder="e.g., 30 Minutes"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid #8B5A3C',
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Right Column - Nutrition & Tags */}
            <div>
              {/* Nutrition Information */}
              <div style={{
                background: '#F0D0C1',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '25px',
                border: '2px solid #EEB182'
              }}>
                <h3 style={{
                  margin: '0 0 15px 0',
                  color: '#8B5A3C',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  🥗 Nutrition Information
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px'
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
                        marginBottom: '3px',
                        color: '#8B5A3C',
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
                          borderRadius: '6px',
                          border: '2px solid #8B5A3C',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Section - Horizontal Layout */}
              <div style={{
                background: '#F0D0C1',
                padding: '20px',
                borderRadius: '15px',
                border: '2px solid #EEB182'
              }}>
                <h3 style={{
                  margin: '0 0 15px 0',
                  color: '#8B5A3C',
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  🏷️ Recipe Tags
                </h3>

                {/* Basic Tags */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    margin: '0 0 10px 0',
                    color: '#8B5A3C',
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
                          borderRadius: '8px',
                          background: editedRecipe.tags?.[tag.key] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 90, 60, 0.05)',
                          border: `2px solid ${editedRecipe.tags?.[tag.key] ? '#22c55e' : 'transparent'}`,
                          transition: 'all 0.2s ease',
                          fontSize: '0.85rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editedRecipe.tags?.[tag.key] || false}
                          onChange={(e) => updateTag(tag.key, e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#22c55e' }}
                        />
                        <span style={{ fontSize: '1rem' }}>{tag.icon}</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          {tag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cooking Methods */}
                <div>
                  <h4 style={{
                    margin: '0 0 10px 0',
                    color: '#BF5B4B',
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
                          borderRadius: '8px',
                          background: editedRecipe.tags?.[method.key] ? 'rgba(191, 91, 75, 0.1)' : 'rgba(191, 91, 75, 0.05)',
                          border: `2px solid ${editedRecipe.tags?.[method.key] ? '#BF5B4B' : 'transparent'}`,
                          transition: 'all 0.2s ease',
                          fontSize: '0.85rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editedRecipe.tags?.[method.key] || false}
                          onChange={(e) => updateTag(method.key, e.target.checked)}
                          style={{ width: '16px', height: '16px', accentColor: '#BF5B4B' }}
                        />
                        <span style={{ fontSize: '1rem' }}>{method.icon}</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          {method.label}
                        </span>
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
          borderTop: '1px solid #EEB182',
          background: '#F0D0C1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              fontFamily: 'Georgia, serif'
            }}
          >
            Cancel Import
          </button>
          
          <div style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
            Click the green + button to add this recipe to your collection ✨
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeImportConfirmation;