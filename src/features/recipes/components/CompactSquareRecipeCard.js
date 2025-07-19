// src/features/recipes/components/CompactSquareRecipeCard.js - Square cards for meal type pages
import React, { useState, useRef } from 'react';
import { formatNutritionValue } from '../../../shared/utils/formatters';
import { BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';
import TagEditModal from './TagEditModal';

// Global state to track which modal is open
let globalOpenModal = null;
let globalSetModalCallback = null;

function CompactSquareRecipeCard({ recipe, onClick, onUpdate }) {
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
          padding: '15px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          height: '280px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          border: '2px solid #f0f0f0'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.15)';
          e.currentTarget.style.borderColor = '#06b6d4';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.borderColor = '#f0f0f0';
        }}
      >
        {/* Recipe Image */}
        <div style={{
          width: '100%',
          height: '120px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          position: 'relative'
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
                e.target.parentElement.innerHTML = '<div style="color: #9ca3af; font-size: 2rem;">🍽️</div>';
              }}
            />
          ) : (
            <div style={{
              color: '#9ca3af',
              fontSize: '2rem'
            }}>
              🍽️
            </div>
          )}
          
          {/* Nutrition Badge */}
          {recipe.nutrition?.calories && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(6, 182, 212, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: '700'
            }}>
              {formatNutritionValue(recipe.nutrition.calories, '')} cal
            </div>
          )}
        </div>

        {/* Recipe Title */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#1f2937',
          fontFamily: 'Georgia, serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: '1.2'
        }}>
          {recipe.title}
        </h3>

        {/* Quick Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#6b7280',
          marginBottom: '10px'
        }}>
          <span style={{ fontWeight: '600' }}>
            {recipe.cookTime || 'Unknown'}
          </span>
          <span style={{ fontWeight: '600' }}>
            {recipe.nutrition?.servings || '?'} servings
          </span>
        </div>

        {/* Tags Area - Compact */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ 
            display: 'flex', 
            gap: '4px', 
            flexWrap: 'wrap', 
            alignItems: 'flex-start',
            minHeight: '20px'
          }}>
            {/* Show first 2 active tags */}
            {activeTags.slice(0, 2).map((tag, index) => (
              <span key={`${tag.key}-${index}`} style={{
                background: tag.type === 'basic' ? '#22c55e' : '#06b6d4',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: '600'
              }}>
                {tag.label}
              </span>
            ))}
            
            {/* Show count if more tags */}
            {activeTags.length > 2 && (
              <span style={{
                background: '#e5e7eb',
                color: '#6b7280',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: '600'
              }}>
                +{activeTags.length - 2}
              </span>
            )}
          </div>

          {/* Add Tags Button - Bottom Right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
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
      </div>

      {/* Tag Edit Modal */}
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

export default CompactSquareRecipeCard;