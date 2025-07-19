// src/features/meals/components/MealBuilder.js - Fixed with safe filtering
import React, { useState } from 'react';

function MealBuilder({ recipes = [], onMealCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [mealName, setMealName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  // Safe filter function
  const safeFilterRecipes = (recipesToFilter, searchQuery) => {
    if (!Array.isArray(recipesToFilter) || !searchQuery) return [];
    
    const searchLower = searchQuery.toLowerCase();
    
    return recipesToFilter.filter((recipe, index) => {
      try {
        // Skip invalid recipes
        if (!recipe || typeof recipe !== 'object') {
          console.warn(`Invalid recipe at index ${index}:`, recipe);
          return false;
        }

        // Safe property checks
        const titleMatch = recipe.title && 
          typeof recipe.title === 'string' && 
          recipe.title.toLowerCase().includes(searchLower);

        const ingredientsMatch = recipe.ingredients && 
          typeof recipe.ingredients === 'string' && 
          recipe.ingredients.toLowerCase().includes(searchLower);

        const mealTypeMatch = recipe.mealType && 
          typeof recipe.mealType === 'string' && 
          recipe.mealType.toLowerCase().includes(searchLower);

        return titleMatch || ingredientsMatch || mealTypeMatch;
      } catch (error) {
        console.error(`Error filtering recipe at index ${index}:`, recipe, error);
        return false;
      }
    });
  };

  // Filter recipes based on search
  const searchResults = searchTerm ? safeFilterRecipes(recipes, searchTerm) : [];

  const addToMeal = (recipeId) => {
    if (!selectedRecipes.includes(recipeId)) {
      setSelectedRecipes([...selectedRecipes, recipeId]);
    }
  };

  const removeFromMeal = (recipeId) => {
    setSelectedRecipes(selectedRecipes.filter(id => id !== recipeId));
  };

  const createMeal = () => {
    if (selectedRecipes.length < 2) {
      alert('Please select at least 2 recipes to create a meal, babe! 💅');
      return;
    }

    const selectedRecipeObjects = recipes.filter(recipe => 
      selectedRecipes.includes(recipe.id)
    );

    // Calculate combined nutrition
    const combinedNutrition = selectedRecipeObjects.reduce((total, recipe) => {
      return {
        calories: (parseInt(total.calories) || 0) + (parseInt(recipe.nutrition?.calories) || 0),
        protein: (parseInt(total.protein) || 0) + (parseInt(recipe.nutrition?.protein) || 0),
        carbs: (parseInt(total.carbs) || 0) + (parseInt(recipe.nutrition?.carbs) || 0),
        fat: (parseInt(total.fat) || 0) + (parseInt(recipe.nutrition?.fat) || 0),
        fiber: (parseInt(total.fiber) || 0) + (parseInt(recipe.nutrition?.fiber) || 0),
        servings: Math.max(...selectedRecipeObjects.map(r => parseInt(r.nutrition?.servings) || 1))
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servings: 1 });

    // Create combined ingredients and instructions
    const combinedIngredients = selectedRecipeObjects.map(recipe => 
      `${recipe.title}:\n${recipe.ingredients}`
    ).join('\n\n');

    const combinedInstructions = selectedRecipeObjects.map(recipe => 
      `${recipe.title}:\n${recipe.instructions}`
    ).join('\n\n');

    // Create the meal
    const meal = {
      title: mealName || `${selectedRecipeObjects.map(r => r.title).join(' + ')}`,
      ingredients: combinedIngredients,
      instructions: combinedInstructions,
      mealType: 'dinner', // Default to dinner for meals
      nutrition: {
        calories: combinedNutrition.calories.toString(),
        protein: combinedNutrition.protein.toString(),
        carbs: combinedNutrition.carbs.toString(),
        fat: combinedNutrition.fat.toString(),
        fiber: combinedNutrition.fiber.toString(),
        servings: combinedNutrition.servings.toString()
      },
      tags: {
        familyApproved: selectedRecipeObjects.every(r => r.tags?.familyApproved),
        mealPrep: selectedRecipeObjects.some(r => r.tags?.mealPrep)
      },
      recipes: selectedRecipeObjects.map(r => r.id) // Track component recipes
    };

    onMealCreated(meal);
    
    // Reset form
    setSelectedRecipes([]);
    setMealName('');
    setSearchTerm('');
    setIsCreating(false);
    
    alert('Fabulous meal created! ✨');
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        style={{
          background: 'linear-gradient(135deg, #8B5A3C 0%, #A0522D 100%)',
          color: 'white',
          border: 'none',
          padding: '20px 40px',
          borderRadius: '15px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 6px 25px rgba(139, 90, 60, 0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '0 auto'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 90, 60, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(139, 90, 60, 0.4)';
        }}
      >
        <span style={{ fontSize: '24px' }}>👩‍🍳</span>
        Create a Meal Combo
      </button>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      marginBottom: '30px',
      border: '2px solid #8B5A3C'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{ 
          margin: 0, 
          color: '#8B5A3C',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          👩‍🍳 Create a Meal Combo
        </h2>
        <button
          onClick={() => {
            setIsCreating(false);
            setSelectedRecipes([]);
            setMealName('');
            setSearchTerm('');
          }}
          style={{
            background: '#DC3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Cancel
        </button>
      </div>

      {/* Meal Name Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: '#8B5A3C',
          fontWeight: 'bold'
        }}>
          Meal Name (optional)
        </label>
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="e.g., Sunday Family Dinner"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid #EEB182',
            fontSize: '16px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B5A3C'}
          onBlur={(e) => e.target.style.borderColor = '#EEB182'}
        />
      </div>

      {/* Recipe Search */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: '#8B5A3C',
          fontWeight: 'bold'
        }}>
          Search and Add Recipes
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search recipes..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid #EEB182',
            fontSize: '16px',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#8B5A3C'}
          onBlur={(e) => e.target.style.borderColor = '#EEB182'}
        />
      </div>

      {/* Search Results */}
      {searchTerm && searchResults.length > 0 && (
        <div style={{
          marginBottom: '20px',
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #EEB182',
          borderRadius: '10px',
          padding: '10px'
        }}>
          {searchResults.map(recipe => (
            <div
              key={recipe.id}
              style={{
                padding: '10px',
                background: selectedRecipes.includes(recipe.id) ? '#F0D0C1' : '#FFF5EE',
                marginBottom: '8px',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onClick={() => {
                if (selectedRecipes.includes(recipe.id)) {
                  removeFromMeal(recipe.id);
                } else {
                  addToMeal(recipe.id);
                }
              }}
            >
              <span style={{ fontWeight: '600', color: '#333' }}>
                {recipe.title || 'Untitled Recipe'}
              </span>
              <span style={{
                fontSize: '20px',
                color: selectedRecipes.includes(recipe.id) ? '#22C55E' : '#8B5A3C'
              }}>
                {selectedRecipes.includes(recipe.id) ? '✓' : '+'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Selected Recipes */}
      {selectedRecipes.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#8B5A3C', marginBottom: '10px' }}>
            Selected Recipes ({selectedRecipes.length})
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {selectedRecipes.map(recipeId => {
              const recipe = recipes.find(r => r.id === recipeId);
              if (!recipe) return null;
              
              return (
                <div
                  key={recipeId}
                  style={{
                    background: '#F0D0C1',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '2px solid #8B5A3C'
                  }}
                >
                  <span style={{ fontWeight: '600', color: '#333' }}>
                    {recipe.title || 'Untitled'}
                  </span>
                  <button
                    onClick={() => removeFromMeal(recipeId)}
                    style={{
                      background: '#DC3545',
                      color: 'white',
                      border: 'none',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={createMeal}
        disabled={selectedRecipes.length < 2}
        style={{
          width: '100%',
          background: selectedRecipes.length >= 2 
            ? 'linear-gradient(135deg, #8B5A3C 0%, #A0522D 100%)'
            : '#cccccc',
          color: 'white',
          border: 'none',
          padding: '16px',
          borderRadius: '12px',
          cursor: selectedRecipes.length >= 2 ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: selectedRecipes.length >= 2 
            ? '0 6px 25px rgba(139, 90, 60, 0.4)'
            : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        {selectedRecipes.length >= 2 
          ? `Create Meal with ${selectedRecipes.length} Recipes ✨`
          : `Select at least 2 recipes to create a meal`}
      </button>
    </div>
  );
}

export default MealBuilder;