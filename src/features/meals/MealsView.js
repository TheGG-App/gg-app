// src/features/meals/MealsView.js - Modern version with filtering
import React, { useState } from 'react';
import MealBuilder from './components/MealBuilder';
import FilterBar from '../../shared/components/FilterBar';

function MealsView({ meals, setMeals, recipes, openaiApiKey }) {
  const [filterMealType, setFilterMealType] = useState('all');
  const [filterTags, setFilterTags] = useState({
    familyApproved: false,
    mealPrep: false
  });
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drinks'];

  const addMeal = (newMeal) => {
    const mealWithId = { ...newMeal, id: Date.now(), isMeal: true };
    setMeals([...meals, mealWithId]);
    setShowMealBuilder(false);
  };

  const updateMeal = (id, updates) => {
    setMeals(meals.map(meal => 
      meal.id === id ? { ...meal, ...updates } : meal
    ));
  };

  const deleteMeal = (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      setMeals(meals.filter(meal => meal.id !== id));
    }
  };

  const filteredMeals = meals.filter(meal => {
    const mealTypeMatch = filterMealType === 'all' || meal.mealType === filterMealType;
    const familyMatch = !filterTags.familyApproved || meal.tags?.familyApproved;
    const mealPrepMatch = !filterTags.mealPrep || meal.tags?.mealPrep;
    return mealTypeMatch && familyMatch && mealPrepMatch;
  });

  return (
    <div>
      {/* Header with Create Meal Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#8B5A3C',
          margin: 0,
          fontWeight: '700',
          fontFamily: 'Georgia, serif'
        }}>
          🍽️ Your Meals ({meals.length})
        </h1>
        
        <button
          onClick={() => setShowMealBuilder(!showMealBuilder)}
          style={{
            background: '#BF5B4B',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '15px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(191, 91, 75, 0.3)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <span>{showMealBuilder ? '✕' : '+'}</span>
          {showMealBuilder ? 'Cancel' : 'Create Meal'}
        </button>
      </div>

      {/* Meal Builder */}
      {showMealBuilder && (
        <div style={{
          background: '#F0D0C1',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '30px',
          border: '2px solid #EEB182',
          boxShadow: '0 4px 15px rgba(139, 90, 60, 0.1)'
        }}>
          <MealBuilder 
            recipes={recipes}
            onMealCreated={addMeal}
          />
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar 
        filterMealType={filterMealType}
        setFilterMealType={setFilterMealType}
        filterTags={filterTags}
        setFilterTags={setFilterTags}
        mealTypes={mealTypes}
        title="Filter Meals"
      />

      {/* Meal Cards */}
      {filteredMeals.length > 0 ? (
        filteredMeals.map(meal => {
          const isExpanded = expandedMeal === meal.id;
          const ingredientsList = meal.ingredients ? meal.ingredients.split('\n').filter(ing => ing.trim()) : [];
          const instructionsList = meal.instructions ? meal.instructions.split('\n').filter(inst => inst.trim()) : [];
          
          return (
            <div
              key={meal.id}
              style={{
                background: 'white',
                borderRadius: '15px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(139, 90, 60, 0.1)',
                border: '1px solid #EEB182',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Meal Header - Clickable */}
              <div 
                onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  cursor: 'pointer',
                  borderBottom: isExpanded ? '1px solid #EEB182' : 'none'
                }}
              >
                {/* Meal Icon */}
                <div style={{
                  width: '120px',
                  height: '80px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #BF5B4B 0%, #CA8462 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: 'white'
                }}>
                  🍽️
                </div>

                {/* Meal Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    fontSize: '1.4rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    🍽️ {meal.title}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '10px'
                  }}>
                    {meal.nutrition?.servings && (
                      <span><strong>Servings:</strong> {meal.nutrition.servings}</span>
                    )}
                    {meal.nutrition?.calories && (
                      <span><strong>Calories:</strong> {meal.nutrition.calories}</span>
                    )}
                    <span><strong>Type:</strong> {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</span>
                    {meal.recipes && (
                      <span><strong>Recipes:</strong> {meal.recipes.length}</span>
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#BF5B4B',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      Multi-Recipe Meal
                    </span>
                    
                    {meal.tags?.familyApproved && (
                      <span style={{
                        background: '#22c55e',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        👨‍👩‍👧‍👦 Family Approved
                      </span>
                    )}
                    
                    {meal.tags?.mealPrep && (
                      <span style={{
                        background: '#8B5A3C',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        🥘 Meal Prep
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand Arrow */}
                <div style={{
                  fontSize: '1.5rem',
                  color: '#8B5A3C',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▼
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div style={{ padding: '25px' }}>
                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '25px',
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateMeal(meal.id, {
                          tags: { 
                            ...meal.tags, 
                            familyApproved: !meal.tags?.familyApproved 
                          }
                        });
                      }}
                      style={{
                        background: '#8B5A3C',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      🏷️ Edit Tags
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMeal(meal.id);
                      }}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* Meal Content Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '25px',
                    marginBottom: '20px'
                  }}>
                    {/* Combined Ingredients */}
                    <div>
                      <h4 style={{
                        margin: '0 0 15px 0',
                        color: '#8B5A3C',
                        fontSize: '1.2rem',
                        fontWeight: '600'
                      }}>
                        🛒 Combined Ingredients
                      </h4>
                      <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0
                      }}>
                        {ingredientsList.map((ingredient, index) => (
                          <li key={index} style={{
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              background: '#BF5B4B',
                              borderRadius: '50%',
                              marginTop: '6px',
                              flexShrink: 0
                            }}></span>
                            <span style={{
                              color: '#333',
                              lineHeight: '1.4'
                            }}>
                              {ingredient.trim()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Combined Instructions */}
                    <div>
                      <h4 style={{
                        margin: '0 0 15px 0',
                        color: '#8B5A3C',
                        fontSize: '1.2rem',
                        fontWeight: '600'
                      }}>
                        👨‍🍳 Combined Instructions
                      </h4>
                      <ol style={{
                        padding: '0 0 0 20px',
                        margin: 0
                      }}>
                        {instructionsList.map((instruction, index) => (
                          <li key={index} style={{
                            marginBottom: '12px',
                            color: '#333',
                            lineHeight: '1.5'
                          }}>
                            {instruction.trim()}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Combined Nutrition Info */}
                  {(meal.nutrition?.calories || meal.nutrition?.protein || meal.nutrition?.servings) && (
                    <div style={{
                      background: '#F0D0C1',
                      padding: '15px',
                      borderRadius: '10px',
                      border: '1px solid #EEB182'
                    }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#8B5A3C' }}>
                        🥗 Combined Nutrition {meal.nutrition?.servings && `(makes ${meal.nutrition.servings} servings)`}
                      </h4>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px', flexWrap: 'wrap' }}>
                        {meal.nutrition?.calories && (
                          <span style={{ color: '#333', fontWeight: '600' }}>
                            Calories: {meal.nutrition.calories}
                          </span>
                        )}
                        {meal.nutrition?.protein && (
                          <span style={{ color: '#333', fontWeight: '600' }}>
                            Protein: {meal.nutrition.protein}g
                          </span>
                        )}
                        {meal.nutrition?.carbs && (
                          <span style={{ color: '#333', fontWeight: '600' }}>
                            Carbs: {meal.nutrition.carbs}g
                          </span>
                        )}
                        {meal.nutrition?.fat && (
                          <span style={{ color: '#333', fontWeight: '600' }}>
                            Fat: {meal.nutrition.fat}g
                          </span>
                        )}
                        {meal.nutrition?.fiber && (
                          <span style={{ color: '#333', fontWeight: '600' }}>
                            Fiber: {meal.nutrition.fiber}g
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#8B5A3C'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍽️</div>
          <h3 style={{ margin: '0 0 10px 0', color: '#8B5A3C' }}>
            {meals.length > 0 ? 'No meals match your filters' : 'No meals found, queen'}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            {meals.length > 0 
              ? 'Try adjusting your filters!' 
              : 'Create your first meal by combining recipes! 💅✨'}
          </p>
        </div>
      )}
    </div>
  );
}

export default MealsView;