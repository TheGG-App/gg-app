// src/features/recipes/RecipesView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import RecipeImport from './components/RecipeImport';
import RecipeImportConfirmation from './components/RecipeImportConfirmation';
import MealTypeLanding from './components/MealTypeLanding';
import { getMealTypeInfo } from '../../shared/utils/mealTypes';

function RecipesView({ recipes, updateRecipe, deleteRecipe, addRecipe, openaiApiKey }) {
  const { mealType } = useParams();
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [showFamilyOnly, setShowFamilyOnly] = useState(false);
  const [showMealPrepOnly, setShowMealPrepOnly] = useState(false);

  // If no meal type selected, show category landing
  if (!mealType) {
    return <MealTypeLanding recipes={recipes} onSelectMealType={(type) => navigate(`/recipes/${type}`)} />;
  }

  // Get meal type info
  const selectedMealType = mealType === 'all' ? null : mealType;
  const mealInfo = getMealTypeInfo(selectedMealType);

  // Filter recipes by meal type and tags
  const filteredByType = selectedMealType === 'all' 
    ? recipes 
    : recipes.filter(recipe => recipe && recipe.mealType === selectedMealType);

  const filteredByTags = filteredByType.filter(recipe => {
    if (!recipe) return false;
    if (showFamilyOnly && !recipe.tags?.familyApproved) return false;
    if (showMealPrepOnly && !recipe.tags?.mealPrep) return false;
    return true;
  });

  // Search functionality - add null check
  const searchedRecipes = searchTerm
    ? filteredByTags.filter(recipe => {
        if (!recipe || !recipe.title) return false;
        const search = searchTerm.toLowerCase();
        return recipe.title.toLowerCase().includes(search) ||
               (recipe.ingredients && recipe.ingredients.toLowerCase().includes(search)) ||
               (recipe.instructions && recipe.instructions.toLowerCase().includes(search));
      })
    : filteredByTags;

  // Sort recipes with null checks
  const sortedRecipes = [...searchedRecipes].sort((a, b) => {
    // Ensure both recipes exist and have required properties
    if (!a || !b) return 0;
    
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
        break;
      case 'cookTime':
        aValue = parseInt(a.cookTime) || 999;
        bValue = parseInt(b.cookTime) || 999;
        break;
      case 'calories':
        aValue = parseInt(a.nutrition?.calories) || 0;
        bValue = parseInt(b.nutrition?.calories) || 0;
        break;
      default:
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const handleCloseModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  const handleRecipeImport = (recipe) => {
    setPendingRecipe({
      ...recipe,
      mealType: selectedMealType // Set meal type based on current view
    });
    setShowImportConfirmation(true);
    setShowImport(false);
  };

  const handleConfirmImport = () => {
    if (pendingRecipe) {
      addRecipe(pendingRecipe);
      setPendingRecipe(null);
      setShowImportConfirmation(false);
    }
  };

  const handleCancelImport = () => {
    setPendingRecipe(null);
    setShowImportConfirmation(false);
  };

  const handleSaveScaledRecipe = (scaledRecipe) => {
    const newRecipe = {
      ...scaledRecipe,
      id: Date.now(),
      mealType: scaledRecipe.mealType || selectedMealType,
      tags: scaledRecipe.tags || {}
    };
    addRecipe(newRecipe);
  };

  // Final filtered recipes
  const filteredRecipes = sortedRecipes;

  return (
    <div style={{ 
      padding: '0', 
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '40px 20px',
        background: 'white',
        borderBottom: '2px solid #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/recipes')}
          style={{
            background: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
            marginBottom: '20px'
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
          fontSize: '3rem',
          color: '#1f2937',
          margin: '0 0 15px 0',
          fontWeight: '700',
          fontFamily: 'Georgia, serif'
        }}>
          {mealInfo.icon} {mealInfo.label}
        </h1>
        
        {/* Recipe Count Box */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: 'white',
          borderRadius: '15px',
          padding: '10px 20px',
          fontSize: '1rem',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
        }}>
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
        </div>
        
        {/* Import Button */}
        <div style={{ position: 'relative', display: 'inline-block', marginLeft: '20px' }}>
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
              marginTop: '10px',
              zIndex: 1000
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                padding: '20px',
                minWidth: '400px',
                maxWidth: '500px',
                border: '1px solid #e5e7eb'
              }}>
                <RecipeImport
                  onImport={handleRecipeImport}
                  onClose={() => setShowImport(false)}
                  openaiApiKey={openaiApiKey}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div style={{ 
        marginBottom: '30px',
        padding: '0 20px',
        maxWidth: '1200px',
        margin: '0 auto 30px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '10px',
                border: '2px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Filter Controls */}
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Sort Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontWeight: '600', color: '#4b5563' }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
              >
                <option value="title">Name</option>
                <option value="cookTime">Cook Time</option>
                <option value="calories">Calories</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  background: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Tag Filters */}
            <div style={{ display: 'flex', gap: '15px', marginLeft: 'auto' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showFamilyOnly}
                  onChange={(e) => setShowFamilyOnly(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: '#4b5563' }}>Family Approved ⭐</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showMealPrepOnly}
                  onChange={(e) => setShowMealPrepOnly(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: '#4b5563' }}>Meal Prep 📦</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div style={{ 
        padding: '0 20px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filteredRecipes.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '25px'
          }}>
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍽️</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#1f2937' }}>
              {searchTerm || showFamilyOnly || showMealPrepOnly
                ? 'No recipes match your filters' 
                : `No ${mealInfo.label.toLowerCase()} recipes found`}
            </h3>
            <p style={{ margin: '0 0 25px 0', color: '#6b7280' }}>
              {recipes.filter(r => selectedMealType === 'all' || (r && r.mealType === selectedMealType)).length > 0
                ? 'Try adjusting your search or filters above'
                : `Import your first ${mealInfo.label.toLowerCase()} recipe to get started!`}
            </p>
            {recipes.filter(r => selectedMealType === 'all' || (r && r.mealType === selectedMealType)).length === 0 && (
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
    </div>
  );
}

export default RecipesView;