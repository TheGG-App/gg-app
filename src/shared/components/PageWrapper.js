// src/shared/components/PageWrapper.js - Updated with blue border theme
import React from 'react';

function PageWrapper({ children, className = '' }) {
  return (
    <div 
      className={className}
      style={{
        background: 'white',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 12px 40px rgba(6, 182, 212, 0.15)',
        border: '2px solid #06b6d4',
        marginBottom: '20px',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
}

export default PageWrapper;