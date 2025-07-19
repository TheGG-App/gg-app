// src/features/recipes/RecipesView.js - Fixed syntax error and updated layout
import React, { useState, useCallback } from 'react';
import MealTypeLanding from './components/MealTypeLanding';
import FilterBar from '../../shared/components/FilterBar';
import CompactRecipeCard from './components/CompactRecipeCard';
import CompactSquareRecipeCard from './components/CompactSquareRecipeCard';
import RecipeModal from './components/RecipeModal';
import TagEditModal from './components/TagEditModal';
import RecipeImportConfirmation from './components/RecipeImportConfirmation';
import { useRecipeLogic } from './hooks/useRecipeLogic';
import { getMealTypeInfo } from './utils/recipeUtils';

function RecipesView({ recipes, setRecipes, openaiApiKey }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [tagEditRecipe, setTagEditRecipe] = useState(null);
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

  // Create a proper setFilterTags function that FilterBar expects
  const setFilterTags = useCallback((updater) => {
    updateFilter('tags', updater);
  }, [updateFilter]);

  // Define all callback functions using useCallback to prevent hoisting issues
  const updateRecipe = useCallback((id, updates) => {
    // Handle special case for adding new recipes
    if (id === 'ADD_NEW') {
      setRecipes([...recipes, updates]);
      return;
    }
    
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, ...updates } : recipe
    ));
  }, [recipes, setRecipes]);

  const deleteRecipe = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      setShowRecipeModal(false);
      setSelectedRecipe(null);
    }
  }, [recipes, setRecipes]);

  const handleRecipeClick = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  }, []);

  const handleSaveScaledRecipe = useCallback((scaledRecipe) => {
    setRecipes([...recipes, scaledRecipe]);
  }, [recipes, setRecipes]);

  const handleConfirmImport = useCallback((confirmedRecipe) => {
    const recipeWithId = { ...confirmedRecipe, id: Date.now() };
    setRecipes([...recipes, recipeWithId]);
    setShowImportConfirmation(false);
    setPendingRecipe(null);
  }, [recipes, setRecipes]);

  const handleCancelImport = useCallback(() => {
    setShowImportConfirmation(false);
    setPendingRecipe(null);
  }, []);

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

  // If no meal type selected, show landing page
  if (!selectedMealType) {
    return (
      <>
        <MealTypeLanding 
          onSelectMealType={setSelectedMealType} 
          recipes={recipes}
          showImport={showImport}
          setShowImport={setShowImport}
          importInput={importInput}
          setImportInput={setImportInput}
          isImporting={isImporting}
          openaiApiKey={openaiApiKey}
          handleImportClick={handleImportClick}
          // Pass search functionality to MealTypeLanding
          allRecipes={recipes}
          onRecipeClick={handleRecipeClick}
        />
        
        {/* Import Confirmation Modal */}
        <RecipeImportConfirmation
          recipe={pendingRecipe}
          isOpen={showImportConfirmation}
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
        />

        {/* Recipe Modal for MealTypeLanding */}
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={showRecipeModal}
          onClose={handleCloseModal}
          onUpdate={updateRecipe}
          onDelete={deleteRecipe}
          openaiApiKey={openaiApiKey}
          onSaveScaled={handleSaveScaledRecipe}
        />
      </>
    );
  }

  const mealInfo = getMealTypeInfo(selectedMealType);

  return (
    <div style={{ 
      fontFamily: 'Georgia, serif', 
      color: '#2c1810',
      background: 'white',
      minHeight: '100vh'
    }}>
      {/* Compact Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        gap: '20px',
        padding: '15px 20px'
      }}>
        <button
          onClick={() => setSelectedMealType(null)}
          style={{
            background: '#f3f4f6',
            border: '2px solid #e5e7eb',
            color: '#6b7280',
            padding: '10px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            fontFamily: 'Georgia, serif',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.background = '#06b6d4';
            e.target.style.borderColor = '#06b6d4';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.background = '#f3f4f6';
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.color = '#6b7280';
          }}
        >
          ← Back to Categories
        </button>

        <h1 style={{
          fontSize: '2rem',
          color: '#1f2937',
          margin: 0,
          fontWeight: '700',
          fontFamily: 'Georgia, serif',
          flex: 1,
          textAlign: 'center'
        }}>
          {mealInfo.icon} {mealInfo.label} ({filteredRecipes.length})
        </h1>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              fontFamily: 'Georgia, serif',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
            }}
          >
            + Import Recipe
          </button>
          
          {/* Recipe Import Modal */}
          {showImport && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              zIndex: 100,
              marginTop: '10px',
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e5e7eb',
              minWidth: '400px',
              maxWidth: '500px'
            }}>
              <textarea
                placeholder="Paste recipe URL (https://...) or raw recipe text here..."
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                disabled={isImporting}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'white',
                  marginBottom: '15px',
                  resize: 'vertical',
                  fontFamily: 'Georgia, serif',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowImport(false)}
                  style={{
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    fontFamily: 'Georgia, serif',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#e5e7eb';
                    e.target.style.color = '#4b5563';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.color = '#6b7280';
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleImportClick}
                  disabled={isImporting || !importInput.trim() || !openaiApiKey}
                  style={{
                    background: isImporting || !importInput.trim() || !openaiApiKey
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: isImporting || !importInput.trim() || !openaiApiKey ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    fontFamily: 'Georgia, serif',
                    boxShadow: isImporting || !importInput.trim() || !openaiApiKey
                      ? 'none' 
                      : '0 2px 8px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  {isImporting ? '🔄 Importing...' : '✨ Import'}
                </button>
              </div>

              {!openaiApiKey && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '0.8rem'
                }}>
                  ⚠️ OpenAI API key required for recipe import
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact Filters */}
      <div style={{ padding: '0 20px' }}>
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCookTime={filterState.cookTime}
          setFilterCookTime={(value) => updateFilter('cookTime', value)}
          filterTags={filterState.tags}
          setFilterTags={setFilterTags}
          onClearFilters={clearFilters}
          compact={true}
        />
      </div>

      {/* Recipe List */}
      <div style={{ padding: '0 20px' }}>
        {filteredRecipes.length > 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 2px 15px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <h2 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: '700',
                fontFamily: 'Georgia, serif'
              }}>
                📚 Your {mealInfo.label} Collection
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                </div>
                {/* View Mode Toggle */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  background: '#f3f4f6',
                  padding: '4px',
                  borderRadius: '8px'
                }}>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      background: viewMode === 'list' ? '#06b6d4' : 'transparent',
                      color: viewMode === 'list' ? 'white' : '#6b7280',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      background: viewMode === 'grid' ? '#06b6d4' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : '#6b7280',
                      border: 'none',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>

            {/* Recipe Cards */}
            <div style={viewMode === 'grid' ? {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            } : {}}>
              {filteredRecipes.map(recipe => (
                viewMode === 'grid' ? (
                  <CompactSquareRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={handleRecipeClick}
                    onUpdate={updateRecipe}
                  />
                ) : (
                  <CompactRecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={handleRecipeClick}
                    onUpdate={updateRecipe}
                  />
                )
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '60px 30px',
            textAlign: 'center',
            color: '#6b7280',
            boxShadow: '0 2px 15px rgba(0, 0, 0, 0.06)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{mealInfo.icon}</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '1.5rem' }}>
              {recipes.filter(r => selectedMealType === 'all' || r.mealType === selectedMealType).length > 0 
                ? 'No recipes match your filters' 
                : `No ${mealInfo.label.toLowerCase()} recipes found`}
            </h3>
            <p style={{ margin: '0 0 25px 0', color: '#6b7280' }}>
              {recipes.filter(r => selectedMealType === 'all' || r.mealType === selectedMealType).length > 0
                ? 'Try adjusting your search or filters above'
                : `Import your first ${mealInfo.label.toLowerCase()} recipe to get started!`}
            </p>
            {recipes.filter(r => selectedMealType === 'all' || r.mealType === selectedMealType).length === 0 && (
              <button
                onClick={() => setShowImport(true)}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  fontFamily: 'Georgia, serif',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                }}
              >
                ✨ Import Your First Recipe
              </button>
            )}
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={handleCloseModal}
        onUpdate={updateRecipe}
        onDelete={deleteRecipe}
        openaiApiKey={openaiApiKey}
        onSaveScaled={handleSaveScaledRecipe}
      />

      {/* Import Confirmation Modal */}
      <RecipeImportConfirmation
        recipe={pendingRecipe}
        isOpen={showImportConfirmation}
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />

      {/* Tag Edit Modal */}
      {tagEditRecipe && (
        <TagEditModal
          recipe={tagEditRecipe}
          onUpdate={(updates) => {
            updateRecipe(tagEditRecipe.id, updates);
            setTagEditRecipe(null);
          }}
          onClose={() => setTagEditRecipe(null)}
        />
      )}
    </div>
  );
}

export default RecipesView;