// src/shared/components/LandingPage.js
import React, { useState } from 'react';
import IconSettings from '../../features/settings/IconSettings';
import styles from './LandingPage.module.css';

function LandingPage({ 
  onNavigate, 
  navigationData, 
  user, 
  onSignIn, 
  onSignOut,
  openaiApiKey,
  setOpenaiApiKey 
}) {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSettingKey, setIsSettingKey] = useState(false);

  const handleSetApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    
    setIsSettingKey(true);
    try {
      await setOpenaiApiKey(apiKeyInput.trim());
      setApiKeyInput('');
      setShowApiKeyInput(false);
      alert('API key saved successfully!');
    } catch (error) {
      alert('Failed to save API key: ' + error.message);
    } finally {
      setIsSettingKey(false);
    }
  };

  const handleRemoveApiKey = async () => {
    if (window.confirm('Are you sure you want to remove your API key?')) {
      await setOpenaiApiKey('');
      alert('API key removed');
    }
  };

  // Calculate stats
  const totalItems = navigationData.recipesCount + navigationData.mealsCount;
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drinks'];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logo}>👩‍🍳</div>
          <h1 className={styles.title}>Recipe Collection</h1>
          <p className={styles.subtitle}>Your personal cookbook in the cloud</p>
        </header>

        {/* User Section */}
        <div className={styles.userSection}>
          {user ? (
            <>
              <div className={styles.userInfo}>
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className={styles.userAvatar}
                />
                <div>
                  <div className={styles.userName}>{user.displayName}</div>
                  <div className={styles.userEmail}>{user.email}</div>
                </div>
              </div>
              <button onClick={onSignOut} className="btn btn-secondary">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <p className={styles.signInPrompt}>
                Sign in to sync your recipes across devices
              </p>
              <button onClick={onSignIn} className="btn btn-primary">
                <span>🔑</span> Sign in with Google
              </button>
            </>
          )}
        </div>

        {/* Navigation Cards */}
        <div className={styles.navGrid}>
          <div 
            className={styles.navCard}
            onClick={() => onNavigate('recipes')}
          >
            <div className={styles.navIcon}>🍽️</div>
            <h2 className={styles.navTitle}>Recipes</h2>
            <div className={styles.navCount}>{navigationData.recipesCount}</div>
            <p className={styles.navDescription}>
              Browse and manage your recipe collection
            </p>
          </div>

          <div 
            className={styles.navCard}
            onClick={() => onNavigate('meals')}
          >
            <div className={styles.navIcon}>🍱</div>
            <h2 className={styles.navTitle}>Meal Combos</h2>
            <div className={styles.navCount}>{navigationData.mealsCount}</div>
            <p className={styles.navDescription}>
              Create and organize meal combinations
            </p>
          </div>
        </div>

        {/* Settings Section */}
        <div className={styles.settingsSection}>
          <div className={styles.settingsHeader}>
            <h2 className={styles.settingsTitle}>⚙️ Settings</h2>
          </div>

          {/* API Key Management */}
          <div className={styles.apiKeySection}>
            <div className={`${styles.apiKeyStatus} ${navigationData.hasApiKey ? styles.configured : styles.missing}`}>
              <span>{navigationData.hasApiKey ? '✅' : '⚠️'}</span>
              <span>
                OpenAI API Key: {navigationData.hasApiKey ? 'Configured' : 'Not configured'}
              </span>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-600)', margin: '0 0 var(--spacing-md) 0' }}>
              Required for importing recipes from URLs
            </p>

            {!showApiKeyInput && !navigationData.hasApiKey && (
              <button 
                onClick={() => setShowApiKeyInput(true)}
                className="btn btn-primary btn-sm"
              >
                Add API Key
              </button>
            )}

            {!showApiKeyInput && navigationData.hasApiKey && (
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button 
                  onClick={() => setShowApiKeyInput(true)}
                  className="btn btn-secondary btn-sm"
                >
                  Update Key
                </button>
                <button 
                  onClick={handleRemoveApiKey}
                  className="btn btn-danger btn-sm"
                >
                  Remove Key
                </button>
              </div>
            )}

            {showApiKeyInput && (
              <div className={styles.apiKeyForm}>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className={`input ${styles.apiKeyInput}`}
                  disabled={isSettingKey}
                />
                <button
                  onClick={handleSetApiKey}
                  disabled={!apiKeyInput.trim() || isSettingKey}
                  className="btn btn-primary"
                >
                  {isSettingKey ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKeyInput('');
                  }}
                  className="btn btn-secondary"
                  disabled={isSettingKey}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Icon Settings */}
          {openaiApiKey && (
            <IconSettings 
              userId={user?.uid} 
              openaiApiKey={openaiApiKey}
            />
          )}

          {/* Quick Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{totalItems}</div>
              <div className={styles.statLabel}>Total Items</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{mealTypes.length}</div>
              <div className={styles.statLabel}>Categories</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {user ? '☁️' : '💾'}
              </div>
              <div className={styles.statLabel}>
                {user ? 'Cloud Sync' : 'Local Only'}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {navigationData.hasApiKey ? '✅' : '❌'}
              </div>
              <div className={styles.statLabel}>AI Ready</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-2xl) 0',
          color: 'var(--color-gray-500)',
          fontSize: '0.9rem'
        }}>
          Made with ❤️ for home cooks everywhere
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;