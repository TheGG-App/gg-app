// src/shared/utils/formatters.js - Fixed with clear exports

/**
 * Format nutrition values to avoid duplication (e.g., "60gg" becomes "60g")
 * @param {string|number} value - The nutrition value
 * @param {string} unit - The unit to append (e.g., 'g', 'mg')
 * @returns {string} Formatted value with unit
 */
function formatNutritionValue(value, unit) {
  if (!value) return '';
  
  // Convert to string and remove any existing units
  const numValue = value.toString().replace(/[^0-9.]/g, '');
  
  // Return formatted value with unit if we have a number
  return numValue ? `${numValue}${unit}` : '';
}

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format meal type for display
 * @param {string} mealType - The meal type
 * @returns {string} Formatted meal type
 */
function formatMealType(mealType) {
  return capitalize(mealType);
}

/**
 * Generate a short ID for new items
 * @returns {number} Timestamp-based ID
 */
function generateId() {
  return Date.now();
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Calculate total nutrition from multiple recipes
 * @param {Array} recipes - Array of recipe objects
 * @returns {Object} Combined nutrition totals
 */
function calculateCombinedNutrition(recipes) {
  return recipes.reduce((total, recipe) => {
    return {
      calories: (parseInt(total.calories) || 0) + (parseInt(recipe.nutrition?.calories) || 0),
      protein: (parseInt(total.protein) || 0) + (parseInt(recipe.nutrition?.protein) || 0),
      carbs: (parseInt(total.carbs) || 0) + (parseInt(recipe.nutrition?.carbs) || 0),
      fat: (parseInt(total.fat) || 0) + (parseInt(recipe.nutrition?.fat) || 0),
      fiber: (parseInt(total.fiber) || 0) + (parseInt(recipe.nutrition?.fiber) || 0),
      servings: Math.max(...recipes.map(r => parseInt(r.nutrition?.servings) || 1))
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servings: 1 });
}

/**
 * Validate recipe data
 * @param {Object} recipe - Recipe object to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateRecipe(recipe) {
  const errors = [];
  
  if (!recipe.title?.trim()) {
    errors.push('Recipe title is required');
  }
  
  if (!recipe.ingredients?.trim()) {
    errors.push('Ingredients are required');
  }
  
  if (!recipe.instructions?.trim()) {
    errors.push('Instructions are required');
  }
  
  if (!recipe.mealType) {
    errors.push('Meal type is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Clean and normalize recipe data
 * @param {Object} recipe - Raw recipe data
 * @returns {Object} Cleaned recipe data
 */
function normalizeRecipe(recipe) {
  return {
    title: recipe.title?.trim() || '',
    ingredients: recipe.ingredients?.trim() || '',
    instructions: recipe.instructions?.trim() || '',
    mealType: recipe.mealType || 'dinner',
    nutrition: {
      calories: recipe.nutrition?.calories?.toString() || '',
      protein: recipe.nutrition?.protein?.toString() || '',
      carbs: recipe.nutrition?.carbs?.toString() || '',
      fat: recipe.nutrition?.fat?.toString() || '',
      fiber: recipe.nutrition?.fiber?.toString() || '',
      servings: recipe.nutrition?.servings?.toString() || ''
    },
    tags: {
      familyApproved: Boolean(recipe.tags?.familyApproved),
      mealPrep: Boolean(recipe.tags?.mealPrep)
    }
  };
}

/**
 * Filter recipes based on criteria
 * @param {Array} recipes - Array of recipes to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered recipes
 */
function filterRecipes(recipes, filters) {
  return recipes.filter(recipe => {
    // Meal type filter
    const mealTypeMatch = !filters.mealType || 
      filters.mealType === 'all' || 
      recipe.mealType === filters.mealType;
    
    // Tags filter
    const familyMatch = !filters.familyApproved || recipe.tags?.familyApproved;
    const mealPrepMatch = !filters.mealPrep || recipe.tags?.mealPrep;
    
    // Search term filter
    const searchMatch = !filters.searchTerm || 
      recipe.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      recipe.ingredients.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      recipe.instructions.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return mealTypeMatch && familyMatch && mealPrepMatch && searchMatch;
  });
}

/**
 * Sort recipes by various criteria
 * @param {Array} recipes - Array of recipes to sort
 * @param {string} sortBy - Sort criteria ('title', 'mealType', 'date', 'calories')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted recipes
 */
function sortRecipes(recipes, sortBy = 'title', order = 'asc') {
  const sorted = [...recipes].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'mealType':
        aValue = a.mealType;
        bValue = b.mealType;
        break;
      case 'calories':
        aValue = parseInt(a.nutrition?.calories) || 0;
        bValue = parseInt(b.nutrition?.calories) || 0;
        break;
      case 'date':
        aValue = a.id || 0; // Using ID as date proxy
        bValue = b.id || 0;
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

/**
 * Export recipes to JSON format for backup
 * @param {Array} recipes - Recipes to export
 * @param {Array} meals - Meals to export
 * @returns {string} JSON string of data
 */
function exportData(recipes, meals) {
  const data = {
    recipes,
    meals,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Parse imported JSON data
 * @param {string} jsonString - JSON string to parse
 * @returns {Object} Parsed data with recipes and meals
 */
function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    return {
      recipes: Array.isArray(data.recipes) ? data.recipes : [],
      meals: Array.isArray(data.meals) ? data.meals : [],
      success: true
    };
  } catch (error) {
    return {
      recipes: [],
      meals: [],
      success: false,
      error: 'Invalid JSON format'
    };
  }
}

/**
 * Extract main recipe image from HTML (fallback method)
 * @param {string} html - HTML content to parse
 * @returns {string|null} Image URL found
 */
function extractMainRecipeImage(html) {
  if (!html) return null;
  
  // Try Open Graph first
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch && ogMatch[1]) return ogMatch[1];
  
  // Try Twitter card image
  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twitterMatch && twitterMatch[1]) return twitterMatch[1];
  
  // Try common image tags with food-related patterns
  const foodImageMatch = html.match(/<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))["'][^>]*(?:alt=["'][^"']*(?:recipe|food|dish|meal)[^"']*["']|class=["'][^"']*(?:recipe|food|hero|main)[^"']*["'])/i);
  if (foodImageMatch && foodImageMatch[1]) return foodImageMatch[1];
  
  // Fallback to any decent-sized image
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];
  
  return null;
}

/**
 * Extract largest/best image from HTML content (wrapper for imageExtractor)
 * @param {string} html - HTML content to parse
 * @param {string} baseUrl - Base URL for resolving relative paths
 * @returns {string|null} Best image URL found
 */
function extractLargestImage(html, baseUrl) {
  // Try the advanced extraction first (if available)
  try {
    // This will use the full imageExtractor.js logic if available
    return extractMainRecipeImage(html);
  } catch (error) {
    console.warn('Advanced image extraction failed, using fallback:', error);
    return extractMainRecipeImage(html);
  }
}

// Export all functions
export {
  formatNutritionValue,
  capitalize,
  formatMealType,
  generateId,
  truncateText,
  calculateCombinedNutrition,
  validateRecipe,
  normalizeRecipe,
  filterRecipes,
  sortRecipes,
  exportData,
  importData,
  extractMainRecipeImage,
  extractLargestImage
};