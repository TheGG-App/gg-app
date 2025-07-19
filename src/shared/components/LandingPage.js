// src/shared/components/LandingPage.js - Logo only
import React from 'react';

function LandingPage({ setCurrentView, user, onSignIn }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        cursor: 'pointer'
      }}
      onClick={() => user && setCurrentView('recipes')}
      >
        {/* Logo Only */}
        <img 
          src="/logo.png" // Update this with your logo path
          alt="G&G Recipe Collection"
          style={{
            maxWidth: '400px',
            width: '100%',
            height: 'auto'
          }}
        />
        
        {/* Sign In Prompt (if not signed in) */}
        {!user && (
          <div style={{
            marginTop: '60px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignIn();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #4285f4 0%, #3367d6 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(66, 133, 244, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(66, 133, 244, 0.3)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M3.96409 10.7101C3.78409 10.1701 3.68182 9.59325 3.68182 9.00007C3.68182 8.40689 3.78409 7.83007 3.96409 7.29007V4.95825H0.957273C0.347727 6.17325 0 7.54755 0 9.00007C0 10.4526 0.347727 11.8269 0.957273 13.0419L3.96409 10.7101Z" fill="white"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="white"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;