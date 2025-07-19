// src/features/recipes/components/CompactSquareRecipeCard.js - Grid-only square card with nutrition
import React, { useState, useRef, useEffect } from 'react';
import { formatNutritionValue } from '../../../shared/utils/formatters';
import { BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';

function CompactSquareRecipeCard({ recipe, onClick, onUpdate }) {
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [tags, setTags] = useState(recipe.tags || {});
  const [menuPosition, setMenuPosition] = useState({ bottom: 0 });
  const tagButtonRef = useRef(null);
  const cardRef = useRef(null);
  const menuRef = useRef(null);

  // Update menu position when it opens
  useEffect(() => {
    if (showTagMenu && tagButtonRef.current && cardRef.current && menuRef.current) {
      const buttonRect = tagButtonRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      
      // Calculate position relative to card
      const buttonBottomRelativeToCard = buttonRect.bottom - cardRect.top;
      const availableHeight = cardRect.height - buttonBottomRelativeToCard - 10; // 10px padding
      
      // Set max height for menu to not extend past card bottom
      const maxMenuHeight = Math.min(availableHeight, 300); // Cap at 300px
      
      setMenuPosition({
        bottom: cardRect.height - buttonBottomRelativeToCard + 5,
        maxHeight: maxMenuHeight
      });
    }
  }, [showTagMenu]);

  const handleTagEditClick = (e) => {
    e.stopPropagation();
    setShowTagMenu(!showTagMenu);
  };

  const updateTag = (key, value) => {
    setTags(prev => ({ ...prev, [key]: value }));
    onUpdate(recipe.id, { tags: { ...tags, [key]: value } });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTagMenu && !event.target.closest('.tag-menu-container')) {
        setShowTagMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagMenu]);

  // Get all active tags for display
  const activeTags = [];
  
  // Basic tags
  BASIC_TAGS.forEach(tag => {
    if (recipe.tags?.[tag.key]) {
      activeTags.push({ ...tag, type: 'basic' });
    }
  });
  
  // Cooking method tags  
  COOKING_METHODS.forEach(method => {
    if (recipe.tags?.[method.key]) {
      activeTags.push({ ...method, type: 'method' });
    }
  });

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(recipe)}
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = '#06b6d4';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = '#f0f0f0';
      }}
    >
      {/* Recipe Image */}
      <div style={{
        width: '100%',
        paddingTop: '66.67%', // 3:2 aspect ratio
        position: 'relative',
        background: '#f3f4f6',
        overflow: 'hidden'
      }}>
        {recipe.image && !imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: '3rem'
          }}>
            🍽️
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div style={{
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Title */}
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1f2937',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {recipe.title}
        </h3>

        {/* Time and Servings */}
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '0.85rem',
          color: '#6b7280',
          marginBottom: '12px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>⏱️</span>
            <span>{recipe.cookTime || 'Unknown'}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🍽️</span>
            <span>{recipe.nutrition?.servings || '?'} servings</span>
          </span>
        </div>

        {/* Nutrition Box */}
        {(recipe.nutrition?.calories || recipe.nutrition?.protein) && (
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '12px',
            border: '2px solid #06b6d4',
            boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              {recipe.nutrition?.calories && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.calories, '')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#1f2937', fontWeight: '600' }}>
                    calories
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.protein && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.protein, 'g')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#1f2937', fontWeight: '600' }}>
                    protein
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.carbs && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.carbs, 'g')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#1f2937', fontWeight: '600' }}>
                    carbs
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.fat && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.fat, 'g')}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#1f2937', fontWeight: '600' }}>
                    fat
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags with + Button */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          {/* Active Tags */}
          {activeTags.map((tag, index) => (
            <span key={`${tag.key}-${index}`} style={{
              background: tag.type === 'basic' ? '#22c55e' : '#06b6d4',
              color: 'white',
              padding: '3px 10px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {tag.icon} {tag.label}
            </span>
          ))}

          {/* Add Tags Button */}
          <div className="tag-menu-container" style={{ position: 'relative' }}>
            <button
              ref={tagButtonRef}
              onClick={handleTagEditClick}
              style={{
                background: showTagMenu ? '#06b6d4' : '#f3f4f6',
                color: showTagMenu ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!showTagMenu) {
                  e.target.style.background = '#06b6d4';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'scale(1.1)';
                }
              }}
              onMouseOut={(e) => {
                if (!showTagMenu) {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.color = '#6b7280';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              +
            </button>

            {/* Tag Menu */}
            {showTagMenu && (
              <div
                ref={menuRef}
                style={{
                  position: 'absolute',
                  bottom: menuPosition.bottom,
                  left: '0',
                  background: 'white',
                  borderRadius: '12px',
                  minWidth: '200px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb',
                  zIndex: 10,
                  maxHeight: menuPosition.maxHeight,
                  overflowY: 'auto',
                  padding: '12px'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Basic Tags */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: '#9ca3af',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Basic Tags
                  </div>
                  {BASIC_TAGS.map(tag => (
                    <label
                      key={tag.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '6px 0',
                        fontSize: '0.85rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={tags[tag.key] || false}
                        onChange={(e) => updateTag(tag.key, e.target.checked)}
                        style={{ 
                          width: '14px', 
                          height: '14px',
                          accentColor: '#22c55e'
                        }}
                      />
                      <span style={{ color: '#374151' }}>
                        {tag.label}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Cooking Methods */}
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: '#9ca3af',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Cooking Methods
                  </div>
                  {COOKING_METHODS.map(method => (
                    <label
                      key={method.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '6px 0',
                        fontSize: '0.85rem'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={tags[method.key] || false}
                        onChange={(e) => updateTag(method.key, e.target.checked)}
                        style={{ 
                          width: '14px', 
                          height: '14px',
                          accentColor: '#06b6d4'
                        }}
                      />
                      <span style={{ color: '#374151' }}>
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompactSquareRecipeCard;