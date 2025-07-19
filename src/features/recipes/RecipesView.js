// src/features/recipes/RecipesView.js - Updated with virtual scrolling
import React, { useState, useCallback, useRef, useEffect } from 'react';
import MealTypeLanding from './components/MealTypeLanding';
import FilterBar from '../../shared/components/FilterBar';
import VirtualizedRecipeGrid from './components/VirtualizedRecipeGrid';
import RecipeModal from './components/RecipeModal';
import RecipeImportConfirmation from './components/RecipeImportConfirmation';
import { useRecipeLogic } from './hooks/useRecipeLogic';
import { getMealTypeInfo } from './utils/recipeUtils';

function RecipesView({ recipes, setRecipes, openaiApiKey }) {
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight - 300);
  const headerRef = useRef(null);

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

  // Calculate container height based on header size
  useEffect(() => {
    const calculateHeight = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        const padding = 40; // Bottom padding
        setContainerHeight(windowHeight - headerHeight - padding);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [selectedMealType, showImport]);

  // Define all callback functions using useCallback to prevent unnecessary re-renders
  const updateRecipe = useCallback((id, updates) => {
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
      alert('Please enter a recipe URL or paste recipe text! 🔗');
      return;
    }

    try {
      const parsedRecipe = await handleImport(importInput, selectedMealType);
      setPendingRecipe(parsedRecipe);
      setShowImportConfirmation(true);
      setImportInput('');
      setShowImport(false);
    } catch (error) {
      console.error('Import error:', error);
    }
  }, [importInput, handleImport, selectedMealType]);

  // Show landing page when no meal type selected
  if (!selectedMealType) {
    return <MealTypeLanding onSelectMealType={setSelectedMealType} />;
  }

  const mealInfo = getMealTypeInfo(selectedMealType);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <div ref={headerRef} style={{ flexShrink: 0 }}>
        {/* Header with Back Button */}
        <div style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          padding: '25px 20px',
          color: 'white',
          boxShadow: '0 4px 20px rgba(6, 182, 212, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setSelectedMealType(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ← Back to Categories
            </button>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontWeight: '800',
                fontFamily: 'Georgia, serif',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <span style={{ fontSize: '1.2em' }}>{mealInfo.icon}</span>
                {mealInfo.title}
              </h1>
              <p style={{
                margin: '8px 0 0 0',
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                opacity: 0.9,
                fontFamily: 'Georgia, serif'
              }}>
                {filteredRecipes.length} delicious {selectedMealType === 'all' ? 'recipes' : mealInfo.description}
              </p>
            </div>

            <button
              onClick={() => setShowImport(!showImport)}
              style={{
                background: 'white',
                color: '#06b6d4',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              Import Recipe
            </button>
          </div>

          {/* Import Section */}
          {showImport && (
            <div style={{
              marginTop: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '20px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end'
              }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    Recipe URL or Text
                  </label>
                  <textarea
                    value={importInput}
                    onChange={(e) => setImportInput(e.target.value)}
                    placeholder="Paste a recipe URL (e.g., from AllRecipes, Food Network) or paste recipe text..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.95rem',
                      resize: 'vertical',
                      minHeight: '60px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
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
                      : '0 2px 8px rgba(6, 182, 212, 0.3)',
                    minHeight: '44px',
                    WebkitTapHighlightColor: 'transparent'
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

        {/* Filters */}
        <div style={{ 
          padding: '20px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e5e7eb'
        }}>
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
      </div>

      {/* Virtualized Recipe Grid */}
      <div style={{ flex: 1, overflow: 'hidden', background: '#f8f9fa' }}>
        {filteredRecipes.length > 0 ? (
          <div style={{ padding: '20px', height: '100%' }}>
            <VirtualizedRecipeGrid
              recipes={filteredRecipes}
              onRecipeClick={handleRecipeClick}
              onRecipeUpdate={updateRecipe}
              containerHeight={containerHeight}
              hasMore={false}
              loadMore={() => {}}
              isLoading={false}
            />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '60px 30px',
              textAlign: 'center',
              color: '#6b7280',
              boxShadow: '0 2px 15px rgba(0, 0, 0, 0.06)',
              border: '1px solid #f0f0f0',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{mealInfo.icon}</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '1.5rem' }}>
                {recipes.filter(r => selectedMealType === 'all' || r.mealType === selectedMealType).length > 0 
                  ? 'No recipes match your filters'
                  : `No ${mealInfo.title.toLowerCase()} yet!`
                }
              </h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {recipes.filter(r => selectedMealType === 'all' || r.mealType === selectedMealType).length > 0 
                  ? 'Try adjusting your filters or search terms'
                  : 'Click "Import Recipe" to add your first one'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RecipeModal
        recipe={selectedRecipe}
        isOpen={showRecipeModal}
        onClose={handleCloseModal}
        onUpdate={updateRecipe}
        onDelete={deleteRecipe}
        openaiApiKey={openaiApiKey}
        onSaveScaled={handleSaveScaledRecipe}
      />

      <RecipeImportConfirmation
        isOpen={showImportConfirmation}
        onClose={handleCancelImport}
        pendingRecipe={pendingRecipe}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
}

export default RecipesView;