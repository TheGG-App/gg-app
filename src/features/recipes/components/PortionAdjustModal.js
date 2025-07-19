// src/features/recipes/components/PortionAdjustModal.js - Modal for adjusting portion sizes
import React, { useState } from 'react';

function PortionAdjustModal({ 
  recipe, 
  isOpen, 
  onClose, 
  onAdjust, 
  isAdjusting 
}) {
  const currentServings = parseInt(recipe.nutrition?.servings) || 1;
  const [targetServings, setTargetServings] = useState(currentServings);

  if (!isOpen) return null;

  const handleIncrement = () => {
    setTargetServings(prev => Math.min(prev + 1, 50));
  };

  const handleDecrement = () => {
    setTargetServings(prev => Math.max(prev - 1, 1));
  };

  const handleAdjust = () => {
    if (targetServings !== currentServings) {
      onAdjust(targetServings);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100, // Higher than recipe modal
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
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '2px solid #06b6d4',
          minWidth: '350px',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#1f2937',
          fontSize: '1.4rem',
          fontWeight: '700',
          fontFamily: 'Georgia, serif'
        }}>
          Adjust Portion Size
        </h3>
        
        {/* Current vs New */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '25px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '8px'
          }}>
            Current: {currentServings} serving{currentServings !== 1 ? 's' : ''}
          </div>
          <div style={{
            fontSize: '1.1rem',
            color: '#1f2937',
            fontWeight: '600'
          }}>
            Adjust to: {targetServings} serving{targetServings !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Portion Adjuster */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <button
            onClick={handleDecrement}
            disabled={targetServings <= 1}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: 'none',
              background: targetServings <= 1 ? '#e2e8f0' : '#06b6d4',
              color: targetServings <= 1 ? '#94a3b8' : 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: targetServings <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (targetServings > 1) {
                e.target.style.background = '#0891b2';
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseOut={(e) => {
              if (targetServings > 1) {
                e.target.style.background = '#06b6d4';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            −
          </button>

          <div style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            minWidth: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {targetServings}
          </div>

          <button
            onClick={handleIncrement}
            disabled={targetServings >= 50}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: 'none',
              background: targetServings >= 50 ? '#e2e8f0' : '#06b6d4',
              color: targetServings >= 50 ? '#94a3b8' : 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: targetServings >= 50 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (targetServings < 50) {
                e.target.style.background = '#0891b2';
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseOut={(e) => {
              if (targetServings < 50) {
                e.target.style.background = '#06b6d4';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            +
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
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
          
          <button
            onClick={handleAdjust}
            disabled={isAdjusting || targetServings === currentServings}
            style={{
              background: isAdjusting || targetServings === currentServings
                ? '#9ca3af'
                : '#06b6d4',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              cursor: isAdjusting || targetServings === currentServings
                ? 'not-allowed' 
                : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              fontFamily: 'Georgia, serif',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!isAdjusting && targetServings !== currentServings) {
                e.target.style.background = '#0891b2';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!isAdjusting && targetServings !== currentServings) {
                e.target.style.background = '#06b6d4';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {isAdjusting ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  animation: 'spin 1s linear infinite'
                }}>
                  🔄
                </span>
                Adjusting...
              </>
            ) : (
              'Preview Adjustment'
            )}
          </button>
        </div>

        {/* Helper Text */}
        <p style={{
          margin: '20px 0 0 0',
          fontSize: '0.85rem',
          color: '#64748b',
          lineHeight: '1.4'
        }}>
          This will create a preview with adjusted ingredients and nutrition.
        </p>

        {/* CSS for spin animation */}
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default PortionAdjustModal;