// src/features/recipes/hooks/useRecipeLogic.js - Updated to return parsed recipe
import { useState, useMemo } from 'react';
import { parseRecipeFromUrl, parseRecipeFromText, scaleWithAI } from '../../../shared/utils/aiHelpers';
import { parseTimeToMinutes } from '../utils/recipeUtils';

export function useRecipeLogic(recipes, setRecipes, selectedMealType, openaiApiKey) {
  const [filterState, setFilterState] = useState({
    cookTime: 'all',
    tags: {
      familyApproved: false,
      mealPrep: false,
      grill: false,
      bake: false,
      stove: false,
      slowCooker: false,
      microwave: false
    }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isScaling, setIsScaling] = useState(false);

  // Filtered recipes based on meal type and filters
  const filteredRecipes = useMemo(() => {
    const mealTypeRecipes = selectedMealType === 'all' 
      ? recipes 
      : recipes.filter(recipe => recipe.mealType === selectedMealType);

    return mealTypeRecipes.filter(recipe => {
      // Tags filter
      const tagMatches = Object.keys(filterState.tags).filter(key => filterState.tags[key]);
      const tagMatch = tagMatches.length === 0 || tagMatches.some(tag => recipe.tags?.[tag]);
      
      // Cook time filter
      let cookTimeMatch = true;
      if (filterState.cookTime !== 'all' && recipe.cookTime) {
        const timeInMinutes = parseTimeToMinutes(recipe.cookTime);
        switch (filterState.cookTime) {
          case 'under15':
            cookTimeMatch = timeInMinutes <= 15;
            break;
          case 'under30':
            cookTimeMatch = timeInMinutes <= 30;
            break;
          case 'under60':
            cookTimeMatch = timeInMinutes <= 60;
            break;
          default:
            cookTimeMatch = true;
        }
      }
      
      // Search filter
      const searchMatch = !searchTerm || 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.toLowerCase().includes(searchTerm.toLowerCase());
      
      return tagMatch && cookTimeMatch && searchMatch;
    });
  }, [recipes, selectedMealType, filterState, searchTerm]);

  // Update filter function
  const updateFilter = (key, value) => {
    if (key === 'tags') {
      setFilterState(prev => ({
        ...prev,
        tags: value
      }));
    } else {
      setFilterState(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState({
      cookTime: 'all',
      tags: {
        familyApproved: false,
        mealPrep: false,
        grill: false,
        bake: false,
        stove: false,
        slowCooker: false,
        microwave: false
      }
    });
    setSearchTerm('');
  };

  // Import recipe functionality - UPDATED to return parsed recipe
  const handleImport = async (input) => {
    if (!input?.trim()) {
      throw new Error('Please enter a recipe URL or paste recipe text! 💅');
    }
    if (!openaiApiKey) {
      throw new Error('AI key needed for this magic! ✨');
    }

    setIsImporting(true);
    try {
      let parsedRecipe;
      if (input.startsWith('http')) {
        parsedRecipe = await parseRecipeFromUrl(input, openaiApiKey);
      } else {
        parsedRecipe = await parseRecipeFromText(input, openaiApiKey);
      }
      
      // Return the parsed recipe instead of automatically adding it
      return parsedRecipe;
    } catch (error) {
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  // Scale recipe functionality
  const handleScale = async (recipe, targetServings) => {
    setIsScaling(true);
    try {
      const scaledItem = await scaleWithAI(recipe, targetServings, openaiApiKey, false);
      
      const newScaledRecipe = {
        ...scaledItem,
        id: Date.now(),
        title: `${recipe.title} (${targetServings} servings)`
      };
      
      setRecipes([...recipes, newScaledRecipe]);
      alert('Scaled recipe created successfully! ✨');
    } catch (error) {
      alert('Error scaling recipe: ' + error.message);
    } finally {
      setIsScaling(false);
    }
  };

  // Tag editing functionality
  const handleTagEdit = (recipeId) => {
    // This would open a tag editing modal/interface
    console.log('Edit tags for recipe:', recipeId);
  };

  return {
    filteredRecipes,
    filterState,
    searchTerm,
    setSearchTerm,
    updateFilter,
    clearFilters,
    handleImport,
    handleScale,
    handleTagEdit,
    isImporting,
    isScaling
  };
}