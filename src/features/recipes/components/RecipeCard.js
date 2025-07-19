// src/features/recipes/components/RecipeCard.js
import React, { useState, useRef, useEffect } from 'react';
import { formatNutritionValue } from '../../../shared/utils/formatters';
import { BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';
import styles from './RecipeCard.module.css';

// Combine tag lists for easier iteration
const ALL_TAGS = [
  { section: 'Basic Tags', items: BASIC_TAGS },
  { section: 'Cooking Methods', items: COOKING_METHODS }
];

function RecipeCard({ recipe, onClick, onUpdate }) {
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showTagMenu) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowTagMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagMenu]);

  const handleCardClick = (e) => {
    // Prevent card click when clicking tag menu
    if (e.target.closest(`.${styles.tagMenuContainer}`)) return;
    onClick(recipe);
  };

  const handleTagClick = (e) => {
    e.stopPropagation();
    setShowTagMenu(!showTagMenu);
  };

  const updateTag = (key, value) => {
    onUpdate(recipe.id, { 
      tags: { ...recipe.tags, [key]: value } 
    });
  };

  // Get active tags
  const activeTags = [...BASIC_TAGS, ...COOKING_METHODS]
    .filter(tag => recipe.tags?.[tag.key])
    .map(tag => ({
      ...tag,
      type: BASIC_TAGS.includes(tag) ? 'basic' : 'method'
    }));

  // Nutrition items configuration
  const nutritionItems = [
    { key: 'calories', label: 'Calories', unit: '' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' }
  ];

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Image */}
      <div className={styles.imageContainer}>
        {recipe.image && !imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className={styles.image}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            {recipe.mealType === 'breakfast' ? '🌅' : 
             recipe.mealType === 'lunch' ? '🥗' :
             recipe.mealType === 'dinner' ? '🍽️' :
             recipe.mealType === 'snack' ? '🍿' :
             recipe.mealType === 'dessert' ? '🍰' :
             recipe.mealType === 'drinks' ? '🥤' : '🍽️'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.title}</h3>

        {/* Metadata */}
        <div className={styles.metadata}>
          <span className={styles.metaItem}>
            <span>⏱️</span>
            <span>{recipe.cookTime || 'Unknown'}</span>
          </span>
          <span className={styles.metaItem}>
            <span>🍽️</span>
            <span>{recipe.nutrition?.servings || '?'} servings</span>
          </span>
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div className={styles.nutritionGrid}>
            {nutritionItems.map(item => (
              <div key={item.key} className={styles.nutritionItem}>
                <div className={styles.nutritionLabel}>{item.label}</div>
                <div className={styles.nutritionValue}>
                  {formatNutritionValue(recipe.nutrition[item.key], item.unit) || '-'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className={styles.tagsSection}>
          {activeTags.map((tag, index) => (
            <span 
              key={index} 
              className={`tag ${tag.type === 'basic' ? 'tag-green' : 'tag-blue'}`}
            >
              {tag.icon} {tag.label}
            </span>
          ))}

          {/* Tag Menu */}
          <div className={styles.tagMenuContainer} ref={menuRef}>
            <button
              onClick={handleTagClick}
              className={`${styles.tagButton} ${showTagMenu ? styles.active : ''}`}
              aria-label="Add tags"
            >
              +
            </button>

            {showTagMenu && (
              <div className={styles.tagMenu}>
                {ALL_TAGS.map(section => (
                  <div key={section.section} className={styles.tagMenuSection}>
                    <div className={styles.tagMenuTitle}>
                      {section.section}
                    </div>
                    {section.items.map(tag => (
                      <label key={tag.key} className={styles.tagOption}>
                        <input
                          type="checkbox"
                          checked={recipe.tags?.[tag.key] || false}
                          onChange={(e) => updateTag(tag.key, e.target.checked)}
                          className={styles.tagCheckbox}
                        />
                        <span>{tag.label}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;