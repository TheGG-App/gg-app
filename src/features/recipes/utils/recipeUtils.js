// src/features/recipes/utils/recipeUtils.js
export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅', desc: 'Start your day right' },
  { key: 'lunch', label: 'Lunch', icon: '🥗', desc: 'Midday favorites' },
  { key: 'dinner', label: 'Dinner', icon: '🍽️', desc: 'Evening delights' },
  { key: 'snack', label: 'Snacks', icon: '🍿', desc: 'Quick bites' },
  { key: 'dessert', label: 'Desserts', icon: '🍰', desc: 'Sweet treats' },
  { key: 'drinks', label: 'Drinks', icon: '🥤', desc: 'Refreshing beverages' }
];

export const BASIC_TAGS = [
  { key: 'familyApproved', label: 'Family Approved', icon: '👨‍👩‍👧‍👦' },
  { key: 'mealPrep', label: 'Meal Prep', icon: '🥘' }
];

export const COOKING_METHODS = [
  { key: 'grill', label: 'Grill', icon: '🔥' },
  { key: 'bake', label: 'Bake', icon: '🔥' },
  { key: 'stove', label: 'Stove', icon: '🍳' },
  { key: 'slowCooker', label: 'Slow Cooker', icon: '🍲' },
  { key: 'microwave', label: 'Microwave', icon: '📡' }
];

export function getMealTypeInfo(selectedMealType) {
  const mealTypeMap = {
    breakfast: { icon: '🌅', label: 'Breakfast' },
    lunch: { icon: '🥗', label: 'Lunch' },
    dinner: { icon: '🍽️', label: 'Dinner' },
    snack: { icon: '🍿', label: 'Snacks' },
    dessert: { icon: '🍰', label: 'Desserts' },
    drinks: { icon: '🥤', label: 'Drinks' },
    all: { icon: '🍳', label: 'All Recipes' }
  };
  return mealTypeMap[selectedMealType] || mealTypeMap.all;
}

export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  try {
    const cleanTimeStr = timeStr.trim().toLowerCase();
    if (cleanTimeStr.includes('15 minutes')) return 15;
    if (cleanTimeStr.includes('30 minutes')) return 30;
    if (cleanTimeStr.includes('45 minutes')) return 45;
    if (cleanTimeStr.includes('1 hour') && !cleanTimeStr.includes('30')) return 60;
    
    const hours = cleanTimeStr.match(/(\d+)\s*hour/i);
    const minutes = cleanTimeStr.match(/(\d+)\s*min/i);
    
    const hourMinutes = hours ? parseInt(hours[1]) * 60 : 0;
    const mins = minutes ? parseInt(minutes[1]) : 0;
    
    return hourMinutes + mins;
  } catch (error) {
    return 0;
  }
}