
// src/shared/components/PageWrapper.js
import React from 'react';

function PageWrapper({ children, className = '' }) {
  return (
    <div 
      className={className}
      style={{
        background: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 12px 40px rgba(139, 90, 60, 0.15)',
        border: '2px solid #EEB182',
        marginBottom: '20px',
        position: 'relative'
        // Remove any shimmer or animation effects
      }}
    >
      {children}
    </div>
  );
}

export default PageWrapper;