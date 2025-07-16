// src/shared/components/LandingPage.js
import React from 'react';

function LandingPage({ setCurrentView }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '25px',
      padding: '40px',
      boxShadow: '0 12px 40px rgba(139, 90, 60, 0.15)',
      border: '2px solid #EEB182',
      textAlign: 'center',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* Logo Section */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{
          width: '300px',
          height: '300px',
          margin: '0 auto 30px auto',
          backgroundImage: 'url("data:image/svg+xml;base64,INSERT_YOUR_LOGO_BASE64_HERE")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}>
          {/* Fallback G&G text if logo doesn't load */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            background: 'linear-gradient(135deg, var(--brown-dark) 0%, var(--brown-medium) 30%, var(--plum) 60%, var(--pink) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '900',
            fontFamily: 'Georgia, serif'
          }}>
            G&G
          </div>
        </div>
        
        <p style={{
          fontSize: '1.3rem',
          color: '#8B5A3C',
          margin: '0 0 15px 0',
          fontWeight: '600',
          letterSpacing: '2px'
        }}>
          Girl and The Gay
        </p>
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          margin: 0,
          opacity: 0.8
        }}>
          💅 Your sassy AI-powered kitchen companion
        </p>
      </div>

      {/* Main Navigation Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '50px',
        maxWidth: '600px',
        margin: '0 auto 50px auto'
      }}>
        {/* Browse Recipes Button */}
        <button
          onClick={() => setCurrentView('recipes')}
          style={{
            background: '#8B5A3C',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '30px',
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(139, 90, 60, 0.3)',
            transition: 'transform 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {/* Top accent bar */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '4px',
            background: '#EEB182'
          }} />
          
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🍳</div>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '1.4rem',
            fontWeight: '700'
          }}>
            Browse Recipes
          </h3>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            Explore your collection of delicious recipes
          </p>
        </button>

        {/* Plan Meals Button */}
        <button
          onClick={() => setCurrentView('meals')}
          style={{
            background: '#BF5B4B',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '30px',
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(191, 91, 75, 0.3)',
            transition: 'transform 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {/* Top accent bar */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '4px',
            background: '#CA8462'
          }} />
          
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🍽️</div>
          <h3 style={{
            margin: '0 0 10px 0',
            fontSize: '1.4rem',
            fontWeight: '700'
          }}>
            Plan Meals
          </h3>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            Create fabulous meal combinations
          </p>
        </button>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '60px',
        padding: '20px 0',
        borderTop: '1px solid rgba(139, 90, 60, 0.2)'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.9rem',
          color: '#666',
          opacity: 0.7
        }}>
          Made with love for fabulous home cooks ✨
        </p>
      </div>
    </div>
  );
}

export default LandingPage;