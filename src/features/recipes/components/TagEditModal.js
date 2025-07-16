// src/features/recipes/components/TagEditModal.js - Fixed with independent scrolling
import React, { useState } from 'react';
import { BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';

function TagEditModal({ recipe, onUpdate, onClose, position }) {
  const [tags, setTags] = useState(recipe.tags || {});

  const updateTag = (key, value) => {
    setTags(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate({ tags });
  };

  const modalStyle = position ? {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000
  } : {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  return (
    <div style={modalStyle} onClick={position ? undefined : onClose}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        minWidth: '500px',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(139, 90, 60, 0.3)',
        border: '3px solid #8B5A3C',
        position: position ? 'relative' : undefined,
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 25px',
          borderBottom: '2px solid #EEB182',
          background: '#F0D0C1'
        }}>
          <h3 style={{
            margin: 0,
            color: '#8B5A3C',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            🏷️ Edit Tags
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 25px',
          maxHeight: '300px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              color: '#8B5A3C',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif'
            }}>
              Basic Tags
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {BASIC_TAGS.map(tag => (
                <label
                  key={tag.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '8px',
                    background: tags[tag.key] ? 'rgba(34, 197, 94, 0.1)' : 'rgba(139, 90, 60, 0.05)',
                    border: `2px solid ${tags[tag.key] ? '#22c55e' : 'transparent'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tags[tag.key] || false}
                    onChange={(e) => updateTag(tag.key, e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#22c55e' }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>{tag.icon}</span>
                  <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                    {tag.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              margin: '0 0 12px 0',
              color: '#BF5B4B',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif'
            }}>
              Cooking Methods
            </h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {COOKING_METHODS.map(method => (
                <label
                  key={method.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '8px',
                    background: tags[method.key] ? 'rgba(191, 91, 75, 0.1)' : 'rgba(191, 91, 75, 0.05)',
                    border: `2px solid ${tags[method.key] ? '#BF5B4B' : 'transparent'}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tags[method.key] || false}
                    onChange={(e) => updateTag(method.key, e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#BF5B4B' }}
                  />
                  <span style={{ fontSize: '1.1rem' }}>{method.icon}</span>
                  <span style={{ fontWeight: '600', color: '#333', fontSize: '0.9rem' }}>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div style={{
          padding: '15px 25px',
          borderTop: '1px solid #EEB182',
          background: '#F0D0C1',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleSave}
            style={{
              background: '#8B5A3C',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              fontFamily: 'Georgia, serif'
            }}
          >
            ✓ Save Tags
          </button>
        </div>
      </div>
    </div>
  );
}

export default TagEditModal;