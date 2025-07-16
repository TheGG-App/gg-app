// src/features/recipes/components/CompactRecipeCard.js - Fixed with one modal at a time
import React, { useState, useRef } from 'react';
import { formatNutritionValue } from '../../../shared/utils/formatters';
import { BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';
import TagEditModal from './TagEditModal';

// Global state to track which modal is open
let globalOpenModal = null;
let globalSetModalCallback = null;

function CompactRecipeCard({ recipe, onClick, onUpdate }) {
  const [showTagModal, setShowTagModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const tagButtonRef = useRef(null);

  const handleTagEditClick = (e) => {
    e.stopPropagation();
    
    // Close any existing modal
    if (globalSetModalCallback && globalOpenModal !== recipe.id) {
      globalSetModalCallback(false);
    }
    
    if (tagButtonRef.current) {
      const rect = tagButtonRef.current.getBoundingClientRect();
      setModalPosition({
        x: Math.max(10, rect.left - 300), // Adjusted for wider modal
        y: rect.top
      });
    }
    
    setShowTagModal(true);
    globalOpenModal = recipe.id;
    globalSetModalCallback = setShowTagModal;
  };

  const handleTagUpdate = (updates) => {
    onUpdate(recipe.id, updates);
    setShowTagModal(false);
    globalOpenModal = null;
    globalSetModalCallback = null;
  };

  const handleCloseModal = () => {
    setShowTagModal(false);
    globalOpenModal = null;
    globalSetModalCallback = null;
  };

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
    <>
      <div
        onClick={() => onClick(recipe)}
        style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '15px',
          boxShadow: '0 4px 15px rgba(139, 90, 60, 0.1)',
          border: '2px solid #EEB182',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 90, 60, 0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(139, 90, 60, 0.1)';
        }}
      >
        {/* Recipe Image - NO IMAGE GENERATION */}
        <div style={{
          width: '100px',
          height: '80px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#F0D0C1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="color: #8B5A3C; font-size: 1.5rem;">🍽️</div>';
              }}
            />
          ) : (
            <div style={{
              color: '#8B5A3C',
              fontSize: '1.8rem'
            }}>
              🍽️
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#333',
            fontFamily: 'Georgia, serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {recipe.title}
          </h3>

          {/* Quick Stats Row */}
          <div style={{
            display: 'flex',
            gap: '20px',
            fontSize: '0.85rem',
            color: '#666',
            marginBottom: '10px',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⏱️</span>
              <strong>{recipe.cookTime || 'Unknown'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🍽️</span>
              <strong>{recipe.nutrition?.servings || '?'} servings</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🥘</span>
              <strong>{recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1)}</strong>
            </span>
          </div>

          {/* Tags with + Button */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Recipe Type Tag */}
            <span style={{
              background: '#8B5A3C',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: '600'
            }}>
              Recipe
            </span>

            {/* Active Tags */}
            {activeTags.map((tag, index) => (
              <span key={`${tag.key}-${index}`} style={{
                background: tag.type === 'basic' ? '#22c55e' : '#BF5B4B',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: '500'
              }}>
                {tag.icon} {tag.label}
              </span>
            ))}

            {/* Add Tags Button */}
            <button
              ref={tagButtonRef}
              onClick={handleTagEditClick}
              style={{
                background: '#8B5A3C',
                color: 'white',
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
                e.target.style.background = '#CA8462';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#8B5A3C';
                e.target.style.transform = 'scale(1)';
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Enhanced Nutrition Box */}
        {(recipe.nutrition?.calories || recipe.nutrition?.protein) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            background: 'linear-gradient(135deg, #F0D0C1 0%, #EEB182 100%)',
            borderRadius: '12px',
            minWidth: '140px',
            flexShrink: 0,
            border: '2px solid #8B5A3C'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: '#8B5A3C',
              fontWeight: '700',
              marginBottom: '8px',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              NUTRITION INFO
            </div>
            
            {/* Nutrition Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              width: '100%'
            }}>
              {recipe.nutrition?.calories && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#BF5B4B' }}>
                    {formatNutritionValue(recipe.nutrition.calories, '')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8B5A3C', fontWeight: '600' }}>
                    calories
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.protein && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#8B5A3C' }}>
                    {formatNutritionValue(recipe.nutrition.protein, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8B5A3C', fontWeight: '600' }}>
                    protein
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.carbs && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#CA8462' }}>
                    {formatNutritionValue(recipe.nutrition.carbs, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8B5A3C', fontWeight: '600' }}>
                    carbs
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.fat && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#EEB182' }}>
                    {formatNutritionValue(recipe.nutrition.fat, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8B5A3C', fontWeight: '600' }}>
                    fat
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.fiber && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#22c55e' }}>
                    {formatNutritionValue(recipe.nutrition.fiber, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#8B5A3C', fontWeight: '600' }}>
                    fiber
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tag Edit Modal - Only this recipe's modal */}
      {showTagModal && (
        <TagEditModal
          recipe={recipe}
          onUpdate={handleTagUpdate}
          onClose={handleCloseModal}
          position={modalPosition}
        />
      )}
    </>
  );
}

export default CompactRecipeCard;