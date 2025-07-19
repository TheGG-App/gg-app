// src/features/settings/IconSettings.js
import React, { useState, useEffect, useCallback } from 'react';
import ingredientIconService from '../../services/ingredientIconService';
import styles from './IconSettings.module.css';

function IconSettings({ userId, openaiApiKey }) {
  const [stats, setStats] = useState({
    cacheSize: 0,
    localIcons: 0,
    firebaseIcons: 0
  });
  const [isExporting, setIsExporting] = useState(false);

  const loadStats = useCallback(async () => {
    const iconStats = await ingredientIconService.getStats(userId);
    setStats(iconStats);
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cached icons? They will be regenerated as needed.')) {
      ingredientIconService.clearCache();
      loadStats();
      alert('Icon cache cleared!');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const mappings = await ingredientIconService.exportMappings(userId);
      const dataStr = JSON.stringify(mappings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `ingredient-icons-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert('Failed to export icon mappings');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🎨 AI Ingredient Icons</h3>
      
      <div className={styles.description}>
        Your recipes use AI to automatically generate perfect emoji icons for each ingredient. 
        Icons are cached locally and synced to the cloud when you're signed in.
      </div>

      {/* Status */}
      <div className={styles.status}>
        {openaiApiKey ? (
          <div className={styles.statusItem}>
            <span className={styles.statusIcon}>✅</span>
            <span>AI Icons Enabled</span>
          </div>
        ) : (
          <div className={styles.statusItem}>
            <span className={styles.statusIcon}>❌</span>
            <span>API Key Required for AI Icons</span>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{stats.localIcons}</div>
          <div className={styles.statLabel}>Cached Icons</div>
        </div>
        {userId && (
          <div className={styles.stat}>
            <div className={styles.statValue}>{stats.firebaseIcons}</div>
            <div className={styles.statLabel}>Cloud Icons</div>
          </div>
        )}
        <div className={styles.stat}>
          <div className={styles.statValue}>
            {stats.localIcons > 0 ? Math.round((stats.localIcons * 0.003 * 100)) / 100 : 0}¢
          </div>
          <div className={styles.statLabel}>Saved (est.)</div>
        </div>
      </div>

      {/* How it works */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>How it works</h4>
        <ul className={styles.list}>
          <li>Icons are generated using GPT-4 for maximum accuracy</li>
          <li>Each unique ingredient is processed only once</li>
          <li>Icons are cached locally for instant loading</li>
          <li>When signed in, icons sync across all your devices</li>
          <li>Batch processing reduces API costs by ~90%</li>
        </ul>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          onClick={handleExport}
          disabled={isExporting || stats.localIcons === 0}
          className="btn btn-secondary"
        >
          {isExporting ? 'Exporting...' : '📥 Export Icons'}
        </button>
        
        <button
          onClick={handleClearCache}
          disabled={stats.localIcons === 0}
          className="btn btn-danger"
        >
          🗑️ Clear Cache
        </button>
      </div>

      {/* Examples */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Example Icons</h4>
        <div className={styles.examples}>
          <div className={styles.example}>
            <span className={styles.exampleIcon}>🍗</span>
            <span className={styles.exampleText}>2 lbs chicken breast</span>
          </div>
          <div className={styles.example}>
            <span className={styles.exampleIcon}>🧄</span>
            <span className={styles.exampleText}>3 cloves garlic, minced</span>
          </div>
          <div className={styles.example}>
            <span className={styles.exampleIcon}>🌿</span>
            <span className={styles.exampleText}>Fresh basil leaves</span>
          </div>
          <div className={styles.example}>
            <span className={styles.exampleIcon}>🫒</span>
            <span className={styles.exampleText}>Extra virgin olive oil</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IconSettings;