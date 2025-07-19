// src/features/meals/MealsView.js
import React, { useState, useEffect, useRef } from 'react';
import MealBuilder from './components/MealBuilder';
import FilterBar from '../../shared/components/FilterBar';
import { BASIC_TAGS } from '../recipes/utils/recipeUtils';
import { scaleWithAI } from '../../shared/utils/aiHelpers';
import styles from './MealsView.module.css';

function MealsView({ meals, setMeals, recipes, openaiApiKey }) {
  const [filterMealType, setFilterMealType] = useState('all');
  const [filterTags, setFilterTags] = useState({
    familyApproved: false,
    mealPrep: false
  });
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [expandedTagMenu, setExpandedTagMenu] = useState(null);
  const [isScaling, setIsScaling] = useState({});
  const menuRefs = useRef({});

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

  const scaleMeal = async (meal, targetServings) => {
    if (!targetServings || targetServings <= 0) {
      alert('Please enter a valid number of servings');
      return;
    }

    setIsScaling({ ...isScaling, [meal.id]: true });
    try {
      const scaled = await scaleWithAI(meal, targetServings, openaiApiKey, true, false);
      
      const newMeal = {
        ...scaled,
        id: Date.now(),
        title: `${meal.title} (${targetServings} servings)`,
        isMeal: true
      };
      
      setMeals([...meals, newMeal]);
      alert('Scaled meal saved! ✨');
    } catch (error) {
      alert('Error scaling meal: ' + error.message);
    } finally {
      setIsScaling({ ...isScaling, [meal.id]: false });
    }
  };

  const filteredMeals = meals.filter(meal => {
    const mealTypeMatch = filterMealType === 'all' || meal.mealType === filterMealType;
    const familyMatch = !filterTags.familyApproved || meal.tags?.familyApproved;
    const mealPrepMatch = !filterTags.mealPrep || meal.tags?.mealPrep;
    return mealTypeMatch && familyMatch && mealPrepMatch;
  });

  // Close tag menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedTagMenu && !event.target.closest('.tag-menu-container')) {
        setExpandedTagMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedTagMenu]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🍽️ Your Meals</h1>
        
        <div className={styles.mealCount}>
          {meals.length} {meals.length === 1 ? 'meal' : 'meals'}
        </div>
        
        <button
          onClick={() => setShowMealBuilder(true)}
          className="btn btn-primary"
        >
          + Create New Meal
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersContainer}>
        <FilterBar
          filterMealType={filterMealType}
          setFilterMealType={setFilterMealType}
          filterTags={filterTags}
          setFilterTags={setFilterTags}
          mealTypes={mealTypes}
          onClearFilters={() => {
            setFilterMealType('all');
            setFilterTags({ familyApproved: false, mealPrep: false });
          }}
          title="Filter Meals"
          compact={true}
        />
      </div>

      {/* Meal Builder Modal */}
      {showMealBuilder && (
        <MealBuilder
          recipes={recipes}
          onMealCreated={addMeal}
          onClose={() => setShowMealBuilder(false)}
        />
      )}

      {/* Meals List */}
      <div className={styles.mealsList}>
        {filteredMeals.length > 0 ? (
          filteredMeals.map(meal => {
            const isExpanded = expandedMeal === meal.id;
            const hasTagMenu = expandedTagMenu === meal.id;
            
            return (
              <div key={meal.id} className={styles.mealCard}>
                <div
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                  className={`${styles.mealHeader} ${isExpanded ? styles.expanded : ''}`}
                >
                  <div className={styles.mealIcon}>🍽️</div>

                  <div className={styles.mealInfo}>
                    <h3 className={styles.mealTitle}>🍽️ {meal.title}</h3>
                    
                    <div className={styles.mealMeta}>
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

                    <div className={styles.mealTags}>
                      <span className={styles.mealTag}>Multi-Recipe Meal</span>
                      
                      {meal.tags?.familyApproved && (
                        <span className={`${styles.mealTag} ${styles.familyApproved}`}>
                          ⭐ Family Approved
                        </span>
                      )}
                      
                      {meal.tags?.mealPrep && (
                        <span className={`${styles.mealTag} ${styles.mealPrep}`}>
                          📦 Meal Prep
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={styles.mealActions} onClick={(e) => e.stopPropagation()}>
                    <div className={`tag-menu-container ${styles.tagMenuContainer}`}>
                      <button
                        onClick={() => setExpandedTagMenu(hasTagMenu ? null : meal.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        🏷️ Tags
                      </button>
                      
                      {hasTagMenu && (
                        <div className={styles.tagMenu} ref={el => menuRefs.current[meal.id] = el}>
                          {BASIC_TAGS.map(tag => (
                            <label key={tag.key} className={styles.tagOption}>
                              <input
                                type="checkbox"
                                checked={meal.tags?.[tag.key] || false}
                                onChange={(e) => updateMeal(meal.id, {
                                  tags: { ...meal.tags, [tag.key]: e.target.checked }
                                })}
                                className={styles.tagCheckbox}
                              />
                              <span>{tag.icon} {tag.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="btn btn-danger btn-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className={styles.expandedContent}>
                    {/* Scale Section */}
                    <div className={styles.expandedSection}>
                      <h4 className={styles.sectionTitle}>🔢 Scale This Meal</h4>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="New servings"
                          min="1"
                          className="input"
                          style={{ width: '150px' }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              scaleMeal(meal, parseInt(e.target.value));
                              e.target.value = '';
                            }
                          }}
                          disabled={isScaling[meal.id]}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.target.previousSibling;
                            scaleMeal(meal, parseInt(input.value));
                            input.value = '';
                          }}
                          disabled={isScaling[meal.id] || !openaiApiKey}
                          className="btn btn-primary btn-sm"
                        >
                          {isScaling[meal.id] ? 'Scaling...' : 'Scale Meal'}
                        </button>
                      </div>
                      {!openaiApiKey && (
                        <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '5px' }}>
                          ⚠️ OpenAI API key required for scaling
                        </p>
                      )}
                    </div>

                    {/* Ingredients */}
                    <div className={styles.expandedSection}>
                      <h4 className={styles.sectionTitle}>🛒 Combined Ingredients</h4>
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        background: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #EEB182',
                        fontSize: '0.9rem'
                      }}>
                        {meal.ingredients}
                      </pre>
                    </div>

                    {/* Instructions */}
                    <div className={styles.expandedSection}>
                      <h4 className={styles.sectionTitle}>👩‍🍳 Combined Instructions</h4>
                      <pre style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        background: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        border: '1px solid #EEB182',
                        fontSize: '0.9rem'
                      }}>
                        {meal.instructions}
                      </pre>
                    </div>

                    {/* Nutrition */}
                    {meal.nutrition && Object.values(meal.nutrition).some(v => v) && (
                      <div className={styles.expandedSection}>
                        <div className={styles.nutritionBox}>
                          <h4 className={styles.nutritionTitle}>
                            🥗 Combined Nutrition {meal.nutrition?.servings && `(makes ${meal.nutrition.servings} servings)`}
                          </h4>
                          <div className={styles.nutritionValues}>
                            {meal.nutrition?.calories && (
                              <span className={styles.nutritionValue}>
                                Calories: {meal.nutrition.calories}
                              </span>
                            )}
                            {meal.nutrition?.protein && (
                              <span className={styles.nutritionValue}>
                                Protein: {meal.nutrition.protein}g
                              </span>
                            )}
                            {meal.nutrition?.carbs && (
                              <span className={styles.nutritionValue}>
                                Carbs: {meal.nutrition.carbs}g
                              </span>
                            )}
                            {meal.nutrition?.fat && (
                              <span className={styles.nutritionValue}>
                                Fat: {meal.nutrition.fat}g
                              </span>
                            )}
                            {meal.nutrition?.fiber && (
                              <span className={styles.nutritionValue}>
                                Fiber: {meal.nutrition.fiber}g
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🍽️</div>
            <h3 className={styles.emptyTitle}>
              {meals.length > 0 ? 'No meals match your filters' : 'No meals found, queen'}
            </h3>
            <p className={styles.emptyText}>
              {meals.length > 0 
                ? 'Try adjusting your filters!' 
                : 'Create your first meal by combining recipes! 💅✨'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MealsView;