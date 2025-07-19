// src/features/recipes/components/MealTypeLanding.js
import React, { useState } from 'react';
import { MEAL_TYPES } from '../utils/recipeUtils';
import styles from './MealTypeLanding.module.css';

// Food images for each meal type
const MEAL_TYPE_IMAGES = {
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=300&h=200&fit=crop',
  lunch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
  snack: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=200&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=200&fit=crop'
};

function MealTypeLanding({ 
  onSelectMealType, 
  recipes, 
  onRecipeClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const getRecipeCount = (mealType) => {
    if (mealType === 'all') return recipes.length;
    return recipes.filter(recipe => recipe.mealType === mealType).length;
  };

  // Filter recipes based on search
  const searchResults = searchTerm 
    ? recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.mealType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle import (placeholder - should be passed from parent)
  const handleImportClick = () => {
    alert('Import functionality should be implemented in parent component');
    setShowImport(false);
  };

  return (
    <div className={styles.container}>
      {/* Floating Import Button */}
      <div className={styles.floatingImport}>
        <button
          onClick={() => setShowImport(true)}
          className="btn btn-primary"
        >
          + Import Recipe
        </button>
        
        {/* Import Modal */}
        {showImport && (
          <div className={styles.importModal}>
            <h3 className={styles.importTitle}>📥 Import Recipe</h3>
            
            <div>
              <label className="label">Enter Recipe URL:</label>
              <input
                type="text"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder="https://example.com/recipe"
                disabled={isImporting}
                className="input"
              />
            </div>

            <div className={styles.importActions}>
              <button
                onClick={() => setShowImport(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleImportClick}
                disabled={isImporting || !importInput.trim()}
                className="btn btn-primary"
              >
                {isImporting ? '🔄 Importing...' : '✨ Import'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🍳 What's Cooking?</h1>
        <p className={styles.subtitle}>Choose a category to explore your recipes</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="🔍 Search all recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        {/* Search Results */}
        {searchTerm && (
          <div className={styles.searchResults}>
            <h3 className={styles.searchResultsTitle}>
              Search Results ({searchResults.length})
            </h3>
            {searchResults.length > 0 ? (
              <div className={styles.searchResultsGrid}>
                {searchResults.slice(0, 5).map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => onRecipeClick(recipe)}
                    className={styles.searchResultCard}
                  >
                    <div className={styles.searchResultImage}>
                      {recipe.image ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className={styles.searchResultImageImg}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={styles.searchResultPlaceholder}>
                          🍽️
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.searchResultInfo}>
                      <h3 className={styles.searchResultTitle}>
                        {recipe.title}
                      </h3>
                      <div className={styles.searchResultMeta}>
                        <span>{recipe.mealType.charAt(0).toUpperCase() + recipe.mealType.slice(1)}</span>
                        <span>⏱️ {recipe.cookTime || 'Unknown'}</span>
                        <span>🍽️ {recipe.nutrition?.servings || '?'} servings</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noResults}>
                No recipes found matching "{searchTerm}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Meal Type Cards */}
      <div className={styles.mealTypeGrid}>
        {MEAL_TYPES.map(mealType => (
          <button
            key={mealType.key}
            onClick={() => onSelectMealType(mealType.key)}
            className={styles.mealTypeCard}
          >
            <div 
              className={styles.mealTypeImage}
              style={{ backgroundImage: `url(${MEAL_TYPE_IMAGES[mealType.key]})` }}
            />

            <div className={styles.mealTypeContent}>
              <div className={styles.mealTypeInfo}>
                <h3 className={styles.mealTypeTitle}>
                  {mealType.label}
                </h3>
                <p className={styles.mealTypeDesc}>
                  {mealType.desc}
                </p>
              </div>
              
              <div className={styles.mealTypeCount}>
                {getRecipeCount(mealType.key)} recipes
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* All Recipes Button */}
      <div className={styles.allRecipesSection}>
        <button
          onClick={() => onSelectMealType('all')}
          className="btn btn-primary"
        >
          View All {recipes.length} Recipes
        </button>
      </div>
    </div>
  );
}

export default MealTypeLanding;