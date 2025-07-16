import React, { useState } from 'react';

function MealBuilder({ recipes, onMealCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [mealName, setMealName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  // Filter recipes based on search
  const searchResults = searchTerm 
    ? recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.mealType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
    
    alert('Fabulous meal created! ✨💅');
  };

  const cancelCreation = () => {
    setIsCreating(false);
    setSelectedRecipes([]);
    setMealName('');
    setSearchTerm('');
  };

  if (!isCreating) {
    return (
      <div className="feature-card">
        <h2 className="feature-title">🍽️ Create Fabulous Meals</h2>
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            margin: '0 0 25px 0', 
            color: 'var(--text-dark)', 
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            Combine your recipes into gorgeous complete meals with combined nutrition info ✨
          </p>
          
          <button
            onClick={() => setIsCreating(true)}
            className="primary-button"
            style={{ fontSize: '18px', padding: '20px 40px' }}
          >
            💅 Start Creating Meal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-card">
      <h2 className="feature-title">🍽️ Create Your Fabulous Meal</h2>
      
      {/* Meal Name Input */}
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Meal name (optional) - e.g., 'Sunday Brunch Vibes'"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="form-input"
          style={{ width: '100%', fontSize: '16px' }}
        />
      </div>
      
      {/* Search and Add Recipes */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(221, 160, 221, 0.3) 100%)',
        borderRadius: '15px',
        padding: '25px',
        marginBottom: '25px',
        border: '2px solid rgba(139, 69, 19, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: 'var(--brown-dark)' }}>
          🔍 Search & Add Recipes
        </h3>
        
        <input
          type="text"
          placeholder="Search recipes by name, ingredient, or meal type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ width: '100%', marginBottom: '15px' }}
        />
        
        {searchTerm && (
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '10px',
            border: '1px solid rgba(139, 69, 19, 0.2)'
          }}>
            {searchResults.length > 0 ? (
              searchResults.map(recipe => (
                <div 
                  key={recipe.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 20px',
                    borderBottom: '1px solid rgba(139, 69, 19, 0.1)',
                    background: selectedRecipes.includes(recipe.id) 
                      ? 'linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(221, 160, 221, 0.3) 100%)'
                      : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div>
                    <h4 style={{ 
                      margin: '0 0 5px 0', 
                      color: 'var(--brown-dark)', 
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {recipe.title}
                    </h4>
                    <p style={{ 
                      margin: 0, 
                      color: 'var(--text-dark)', 
                      fontSize: '13px' 
                    }}>
                      {recipe.mealType} • {recipe.nutrition?.servings || '?'} servings
                      {recipe.tags?.familyApproved && ' • 👨‍👩‍👧‍👦 Family Approved'}
                      {recipe.tags?.mealPrep && ' • 🥘 Meal Prep'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => selectedRecipes.includes(recipe.id) 
                      ? removeFromMeal(recipe.id) 
                      : addToMeal(recipe.id)
                    }
                    style={{
                      background: selectedRecipes.includes(recipe.id)
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, var(--brown-dark) 0%, var(--brown-medium) 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    {selectedRecipes.includes(recipe.id) ? '➖ Remove' : '➕ Add'}
                  </button>
                </div>
              ))
            ) : (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                color: 'var(--text-dark)',
                fontStyle: 'italic'
              }}>
                No recipes found for "{searchTerm}" 😢
                <br />
                <small>Try searching for ingredients or meal types!</small>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Recipes */}
      {selectedRecipes.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(221, 160, 221, 0.3) 0%, rgba(255, 182, 193, 0.3) 100%)',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '25px',
          border: '2px solid rgba(139, 69, 19, 0.2)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: 'var(--brown-dark)' }}>
            ✨ Selected Recipes ({selectedRecipes.length})
          </h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {selectedRecipes.map(recipeId => {
              const recipe = recipes.find(r => r.id === recipeId);
              return recipe ? (
                <span
                  key={recipeId}
                  style={{
                    background: 'linear-gradient(135deg, var(--brown-dark) 0%, var(--brown-medium) 100%)',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 10px rgba(139, 69, 19, 0.3)'
                  }}
                >
                  {recipe.title}
                  <button
                    onClick={() => removeFromMeal(recipeId)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
          
          {selectedRecipes.length === 1 && (
            <p style={{ 
              margin: '15px 0 0 0', 
              fontSize: '14px', 
              color: 'var(--text-dark)',
              fontStyle: 'italic'
            }}>
              💡 Select at least one more recipe to create your meal!
            </p>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          onClick={createMeal}
          disabled={selectedRecipes.length < 2}
          style={{
            background: selectedRecipes.length >= 2 
              ? 'linear-gradient(135deg, var(--plum) 0%, var(--pink) 50%, var(--brown-dark) 100%)'
              : '#9ca3af',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '12px',
            cursor: selectedRecipes.length >= 2 ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: selectedRecipes.length >= 2 ? '0 6px 20px rgba(139, 69, 19, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (selectedRecipes.length >= 2) {
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ✨ Create Fabulous Meal
        </button>
        
        <button
          onClick={cancelCreation}
          style={{
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Cancel
        </button>
      </div>
      
      {/* Instructions */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(221, 160, 221, 0.1) 100%)',
        borderRadius: '10px',
        border: '1px solid rgba(139, 69, 19, 0.1)',
        textAlign: 'center'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '14px', 
          color: 'var(--text-dark)',
          lineHeight: '1.5'
        }}>
          💅 <strong>Pro Tip:</strong> Your meal will combine all ingredients and instructions from selected recipes, 
          plus calculate the total nutrition info. Perfect for meal planning and prep! ✨
        </p>
      </div>
    </div>
  );
}

export default MealBuilder;