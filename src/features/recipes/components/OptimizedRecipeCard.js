// src/features/recipes/components/OptimizedRecipeCard.js
import React, { useState } from 'react';
import OptimizedImage from '../../../shared/components/OptimizedImage';
import styles from './OptimizedRecipeCard.module.css';

// AI-generated SVG icons as components
const Icons = {
  Family: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.01 2.01 0 0017.72 7h-.87c-.8 0-1.54.5-1.85 1.26l-1.92 5.25A2 2 0 0015 16v6h2v-6h2v6h1zm-11.42-5.8l-1.88-4.3c-.3-.67-.99-1.1-1.75-1.1H4c-.86 0-1.6.6-1.84 1.44L0 18v4h1.5v-4l.72-2h2.28L6 22h1.5l-1.5-6.1V9h1v6.1L8.5 22H10l-1.42-6.8z"/>
      <circle cx="5" cy="5" r="2"/>
      <path d="M9.5 16c.83 0 1.5-.67 1.5-1.5S10.33 13 9.5 13 8 13.67 8 14.5 8.67 16 9.5 16z"/>
    </svg>
  ),
  MealPrep: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12zm-8-2h4v-4h-4v4zm-6 0h4v-4H6v4zm6-6h4V6h-4v4z"/>
    </svg>
  ),
  Grill: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 5V2h-2v3h-2V2h-2v3h-2V2H9v3H7V2H5v3c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2v9h2v-9h10v9h2v-9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM5 9V7h14v2H5z"/>
      <rect x="5" y="7" width="14" height="2"/>
      <path d="M5 12h14v1H5zm0 3h14v1H5z"/>
    </svg>
  ),
  Bake: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8.5V4h-4v4.5h-2V4h-4v4.5h-2V4H4v4.5c-1.1 0-2 .9-2 2V16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5.5c0-1.1-.9-2-2-2zM20 16H4v-5.5c0-.28.22-.5.5-.5h15c.28 0 .5.22.5.5V16z"/>
      <circle cx="7" cy="13.5" r="1.5"/>
      <circle cx="12" cy="13.5" r="1.5"/>
      <circle cx="17" cy="13.5" r="1.5"/>
    </svg>
  ),
  Stove: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 15c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34 3 3zm3-1c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0-2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM3 21h18v-2H3v2zM21 3H3v10h18V3zm-2 8H5V5h14v6z"/>
    </svg>
  ),
  SlowCooker: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-1V4h-2v5h-2V4h-2v5h-2V4H8v5H7V4H5v5H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2zm0 11H5v-9h14v9z"/>
      <path d="M7 14h10v2H7zm0 3h10v1H7z"/>
    </svg>
  ),
  Microwave: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
      <rect x="6" y="8" width="10" height="8"/>
      <circle cx="18" cy="8" r="1"/>
      <circle cx="18" cy="11" r="1"/>
      <path d="M7 9h8v6H7z" opacity=".3"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
    </svg>
  ),
  Serving: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2v7z"/>
    </svg>
  )
};

function OptimizedRecipeCard({ recipe, onClick, onUpdate }) {
  const [showTagMenu, setShowTagMenu] = useState(false);
  const { tags = {}, nutrition = {} } = recipe;

  // Tag configurations with AI icons
  const BASIC_TAGS = [
    { key: 'familyApproved', label: 'Family', icon: Icons.Family, color: '#8b4513' },
    { key: 'mealPrep', label: 'Prep', icon: Icons.MealPrep, color: '#06b6d4' }
  ];

  const COOKING_METHODS = [
    { key: 'grill', label: 'Grill', icon: Icons.Grill },
    { key: 'bake', label: 'Bake', icon: Icons.Bake },
    { key: 'stove', label: 'Stove', icon: Icons.Stove },
    { key: 'slowCooker', label: 'Slow', icon: Icons.SlowCooker },
    { key: 'microwave', label: 'Micro', icon: Icons.Microwave }
  ];

  const activeTags = [
    ...BASIC_TAGS.filter(tag => tags[tag.key]).map(tag => ({ ...tag, type: 'basic' })),
    ...COOKING_METHODS.filter(method => tags[method.key]).map(method => ({ ...method, type: 'method' }))
  ];

  const handleClick = (e) => {
    if (!e.target.closest('.tag-menu-container')) {
      onClick(recipe);
    }
  };

  const handleTagClick = (e) => {
    e.stopPropagation();
    setShowTagMenu(!showTagMenu);
  };

  const updateTag = (key, value) => {
    onUpdate(recipe.id, { tags: { ...tags, [key]: value } });
  };

  return (
    <div
      onClick={handleClick}
      className={styles.recipeCard}
    >
      {/* Optimized Image */}
      <OptimizedImage
        src={recipe.image}
        alt={recipe.title}
        aspectRatio="3:2"
        placeholder="🍽️"
        priority={false}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>
          {recipe.title}
        </h3>

        {/* Time and Servings */}
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <Icons.Clock /> {recipe.cookTime || 'Unknown'}
          </span>
          <span className={styles.metaItem}>
            <Icons.Serving /> {nutrition.servings || '?'} servings
          </span>
        </div>

        {/* Nutrition */}
        {(nutrition.calories || nutrition.protein) && (
          <div className={styles.nutritionBox}>
            <div className={styles.nutritionGrid}>
              {nutrition.calories && (
                <div className={styles.nutritionItem}>
                  <div className={styles.nutritionValue}>
                    {Math.round(nutrition.calories)}
                  </div>
                  <div className={styles.nutritionLabel}>
                    calories
                  </div>
                </div>
              )}
              {nutrition.protein && (
                <div className={styles.nutritionItem}>
                  <div className={styles.nutritionValue}>
                    {Math.round(nutrition.protein)}g
                  </div>
                  <div className={styles.nutritionLabel}>
                    protein
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className={styles.tagsSection}>
          {activeTags.map((tag, index) => {
            const Icon = tag.icon;
            return (
              <span 
                key={`${tag.key}-${index}`} 
                className={`${styles.tag} ${tag.type === 'basic' ? styles.basicTag : styles.methodTag}`}
                style={tag.type === 'basic' ? { backgroundColor: tag.color } : undefined}
              >
                <Icon /> {tag.label}
              </span>
            );
          })}
          
          <button
            className={`tag-menu-container ${styles.tagMenuButton} ${activeTags.length > 0 ? styles.hasActiveTags : ''}`}
            onClick={handleTagClick}
          >
            +
          </button>

          {/* Tag menu */}
          {showTagMenu && (
            <div
              className={`tag-menu-container ${styles.tagMenu}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.tagMenuTitle}>
                Quick Tags
              </div>
              {[...BASIC_TAGS, ...COOKING_METHODS].map(tag => {
                const Icon = tag.icon;
                return (
                  <label
                    key={tag.key}
                    className={styles.tagOption}
                  >
                    <input
                      type="checkbox"
                      checked={tags[tag.key] || false}
                      onChange={(e) => updateTag(tag.key, e.target.checked)}
                      className={styles.tagCheckbox}
                    />
                    <span className={styles.tagOptionLabel}>
                      <Icon /> {tag.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OptimizedRecipeCard;