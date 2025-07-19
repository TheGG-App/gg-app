// src/shared/utils/mealTypes.js
export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅', desc: 'Start your day right' },
  { key: 'lunch', label: 'Lunch', icon: '🥗', desc: 'Midday favorites' },
  { key: 'dinner', label: 'Dinner', icon: '🍽️', desc: 'Evening delights' },
  { key: 'snack', label: 'Snacks', icon: '🍿', desc: 'Quick bites' },
  { key: 'dessert', label: 'Desserts', icon: '🍰', desc: 'Sweet treats' },
  { key: 'drinks', label: 'Drinks', icon: '🥤', desc: 'Refreshing beverages' }
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