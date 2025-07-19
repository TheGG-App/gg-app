// src/features/recipes/RecipesView.js
import React, { useState, useCallback } from 'react';
import MealTypeLanding from './components/MealTypeLanding';
import FilterBar from '../../shared/components/FilterBar';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import RecipeImportConfirmation from './components/RecipeImportConfirmation';
import { useRecipeLogic } from './hooks/useRecipeLogic';
import { getMealTypeInfo } from './utils/recipeUtils';
import styles from './RecipesView.module.css';

function RecipesView({ recipes, setRecipes, openaiApiKey }) {
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState(null);

  const {
    filteredRecipes,
    filterState,
    searchTerm,
    setSearchTerm,
    updateFilter,
    clearFilters,
    handleImport,
    isImporting
  } = useRecipeLogic(recipes, setRecipes, selectedMealType, openaiApiKey);

  // Recipe operations
  const updateRecipe = useCallback((id, updates) => {
    setRecipes(prev => prev.map(recipe => 
      recipe.id === id ? { ...recipe, ...updates } : recipe
    ));
  }, [setRecipes]);

  const deleteRecipe = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      setShowRecipeModal(false);
      setSelectedRecipe(null);
    }
  }, [setRecipes]);

  const handleRecipeClick = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  }, []);

  const handleSaveScaledRecipe = useCallback((scaledRecipe) => {
    setRecipes(prev => [...prev, scaledRecipe]);
  }, [setRecipes]);

  // Import handlers
  const handleImportClick = useCallback(async () => {
    if (!importInput.trim()) {
      alert('Please enter a recipe URL or paste recipe text!');
      return;
    }
    
    try {
      const parsedRecipe = await handleImport(importInput);
      if (parsedRecipe) {
        setPendingRecipe(parsedRecipe);
        setShowImportConfirmation(true);
        setImportInput('');
        setShowImport(false);
      }
    } catch (error) {
      alert('Error importing recipe: ' + error.message);
    }
  }, [importInput, handleImport]);

  const handleConfirmImport = useCallback((confirmedRecipe) => {
    const recipeWithId = { ...confirmedRecipe, id: Date.now() };
    setRecipes(prev => [...prev, recipeWithId]);
    setShowImportConfirmation(false);
    setPendingRecipe(null);
  }, [setRecipes]);

  // Show landing page if no meal type selected
  if (!selectedMealType) {
    return (
      <>
        <MealTypeLanding 
          onSelectMealType={setSelectedMealType} 
          recipes={recipes}
          onRecipeClick={handleRecipeClick}
        />
        
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={showRecipeModal}
          onClose={() => setShowRecipeModal(false)}
          onUpdate={updateRecipe}
          onDelete={deleteRecipe}
          openaiApiKey={openaiApiKey}
          onSaveScaled={handleSaveScaledRecipe}
        />
      </>
    );
  }

  const mealInfo = getMealTypeInfo(selectedMealType);
  const hasRecipes = filteredRecipes.length > 0;
  const totalMealTypeRecipes = recipes.filter(r => 
    selectedMealType === 'all' || r.mealType === selectedMealType
  ).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          onClick={() => setSelectedMealType(null)}
          className={styles.backButton}
        >
          ← Back to Categories
        </button>

        <h1 className={styles.pageTitle}>
          {mealInfo.icon} {mealInfo.label}
        </h1>
        
        <span className={styles.recipeCount}>
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
        
        {/* Import Button */}
        <div className={styles.importSection}>
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
                  disabled={isImporting || !openaiApiKey}
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
                  disabled={isImporting || !importInput.trim() || !openaiApiKey}
                  className="btn btn-primary"
                >
                  {isImporting ? '🔄 Importing...' : '✨ Import'}
                </button>
              </div>

              {!openaiApiKey && (
                <div className={styles.errorMessage}>
                  ⚠️ OpenAI API key required for recipe import
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCookTime={filterState.cookTime}
          setFilterCookTime={(value) => updateFilter('cookTime', value)}
          filterTags={filterState.tags}
          setFilterTags={(updater) => updateFilter('tags', updater)}
          onClearFilters={clearFilters}
          compact={true}
        />
      </div>

      {/* Recipe Grid */}
      <div className={styles.gridContainer}>
        {hasRecipes ? (
          <div className={styles.recipeGrid}>
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={handleRecipeClick}
                onUpdate={updateRecipe}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{mealInfo.icon}</div>
            <h3 className={styles.emptyTitle}>
              {totalMealTypeRecipes > 0 
                ? 'No recipes match your filters' 
                : `No ${mealInfo.label.toLowerCase()} recipes found`}
            </h3>
            <p className={styles.emptyText}>
              {totalMealTypeRecipes > 0
                ? 'Try adjusting your search or filters above'
                : `Import your first ${mealInfo.label.toLowerCase()} recipe to get started!`}
            </p>
            {totalMealTypeRecipes === 0 && (
              <button
                onClick={() => setShowImport(true)}
                className="btn btn-primary"
              >
                ✨ Import Your First Recipe
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onUpdate={updateRecipe}
        onDelete={deleteRecipe}
        openaiApiKey={openaiApiKey}
        onSaveScaled={handleSaveScaledRecipe}
      />

      <RecipeImportConfirmation
        recipe={pendingRecipe}
        isOpen={showImportConfirmation}
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirmation(false);
          setPendingRecipe(null);
        }}
      />
    </div>
  );
}

export default RecipesView;