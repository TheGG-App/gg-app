// src/features/recipes/components/CompactRecipeCard.js - Updated with black nutrition text
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
        x: Math.max(10, rect.left - 300),
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
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '1px solid #f0f0f0',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.borderColor = '#f0f0f0';
        }}
      >
        {/* Recipe Image */}
        <div style={{
          width: '100px',
          height: '80px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f3f4f6',
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
                e.target.parentElement.innerHTML = '<div style="color: #9ca3af; font-size: 1.5rem;">🍽️</div>';
              }}
            />
          ) : (
            <div style={{
              color: '#9ca3af',
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
            color: '#1f2937',
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
            color: '#6b7280',
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
            <button
              ref={tagButtonRef}
              onClick={handleTagEditClick}
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
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
                e.target.style.background = '#06b6d4';
                e.target.style.color = 'white';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.color = '#6b7280';
                e.target.style.transform = 'scale(1)';
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Nutrition Box - BLACK TEXT, BLUE BORDER */}
        {(recipe.nutrition?.calories || recipe.nutrition?.protein) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            background: 'white',
            borderRadius: '12px',
            minWidth: '140px',
            flexShrink: 0,
            border: '2px solid #06b6d4',
            boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)'
          }}>
            <div style={{
              fontSize: '0.7rem',
              color: '#1f2937', // BLACK TEXT
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
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.calories, '')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#1f2937', fontWeight: '600' }}>
                    calories
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.protein && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.protein, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#1f2937', fontWeight: '600' }}>
                    protein
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.carbs && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.carbs, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#1f2937', fontWeight: '600' }}>
                    carbs
                  </div>
                </div>
              )}
              
              {recipe.nutrition?.fat && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {formatNutritionValue(recipe.nutrition.fat, 'g')}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#1f2937', fontWeight: '600' }}>
                    fat
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