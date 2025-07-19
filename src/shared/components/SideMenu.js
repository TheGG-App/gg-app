// src/shared/components/SideMenu.js - Updated with arrow instead of X
import React, { useState } from 'react';

function SideMenu({ 
  currentView, 
  setCurrentView, 
  user, 
  onSignIn, 
  onSignOut, 
  recipes, 
  meals 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const menuItems = [
    { key: 'home', label: 'Home', icon: '🏠', count: null },
    { key: 'recipes', label: 'Recipes', icon: '🍳', count: recipes.length },
    { key: 'meals', label: 'Meals', icon: '🍽️', count: meals.length }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {!isCollapsed && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Side Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isCollapsed ? '-280px' : '0',
        width: '280px',
        height: '100vh',
        background: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.1)',
        zIndex: 999,
        transition: 'left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '25px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: 'white',
              fontFamily: 'Georgia, serif'
            }}>
              G&G
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '700',
                fontFamily: 'Georgia, serif'
              }}>
                Girl & The Gay
              </div>
              <div style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.8rem'
              }}>
                Your shared recipe hub
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '20px 0' }}>
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                setCurrentView(item.key);
                if (window.innerWidth <= 768) setIsCollapsed(true);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 25px',
                border: 'none',
                background: currentView === item.key 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: 'Georgia, serif',
                transition: 'all 0.2s ease',
                borderLeft: currentView === item.key ? '4px solid white' : '4px solid transparent'
              }}
              onMouseOver={(e) => {
                if (currentView !== item.key) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                if (currentView !== item.key) {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.count !== null && (
                <span style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* User Section */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(0, 0, 0, 0.1)'
        }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '10px',
                  background: showProfileMenu ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  transition: 'background 0.2s'
                }}
              >
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    {user.displayName}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem'
                  }}>
                    {user.email}
                  </div>
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.8rem',
                  transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>
                  ▼
                </div>
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                  marginBottom: '10px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => {
                      window.open('https://myaccount.google.com/', '_blank');
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'white',
                      color: '#374151',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                  >
                    Google Account
                  </button>
                  <button
                    onClick={() => {
                      onSignOut();
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'white',
                      color: '#ef4444',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderTop: '1px solid #f0f0f0',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#fef2f2'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignIn}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#4285f4',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285f4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34a853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M3.96409 10.7101C3.78409 10.1701 3.68182 9.59325 3.68182 9.00007C3.68182 8.40689 3.78409 7.83007 3.96409 7.29007V4.95825H0.957273C0.347727 6.17325 0 7.54755 0 9.00007C0 10.4526 0.347727 11.8269 0.957273 13.0419L3.96409 10.7101Z" fill="#fbbc05"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#ea4335"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Toggle Button with Arrow */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'fixed',
          top: '20px',
          left: isCollapsed ? '20px' : '300px',
          zIndex: 1000,
          background: '#06b6d4',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
        }}
      >
        <span style={{
          display: 'inline-block',
          transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s ease',
          lineHeight: '1'
        }}>
          →
        </span>
      </button>

      {/* Click outside to close */}
      {showProfileMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 997
          }}
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
}

export default SideMenu;