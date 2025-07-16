// src/features/recipes/components/IngredientItem.js
import React, { useState, useEffect } from 'react';

function IngredientItem({ ingredient, openaiApiKey }) {
  const [icon, setIcon] = useState('🥄');

  useEffect(() => {
    const quickMatches = {
      // Proteins - raw meat focus
      'chicken breast': '🍗', 'chicken thigh': '🍗', 'chicken wing': '🍗', 'whole chicken': '🍗', 'chicken': '🍗',
      'ground beef': '🥩', 'beef steak': '🥩', 'beef roast': '🥩', 'beef brisket': '🥩', 'beef': '🥩',
      'pork chop': '🥩', 'pork shoulder': '🥩', 'pork tenderloin': '🥩', 'pork': '🥩', 'ham': '🥩',
      'bacon': '🥓', 'ground pork': '🥩',
      'salmon fillet': '🐟', 'tuna steak': '🐟', 'white fish': '🐟', 'fish': '🐟',
      'shrimp': '🦐', 'prawns': '🦐', 'crab': '🦀', 'lobster': '🦞',
      'eggs': '🥚', 'egg whites': '🥚', 'egg yolks': '🥚', 'egg': '🥚',
      
      // Vegetables
      'cherry tomatoes': '🍅', 'roma tomatoes': '🍅', 'tomato paste': '🍅', 'tomato': '🍅',
      'yellow onion': '🧅', 'red onion': '🧅', 'white onion': '🧅', 'green onion': '🧅', 'onion': '🧅',
      'garlic cloves': '🧄', 'minced garlic': '🧄', 'garlic': '🧄',
      'baby carrots': '🥕', 'carrot sticks': '🥕', 'carrot': '🥕',
      'russet potatoes': '🥔', 'baby potatoes': '🥔', 'potato': '🥔',
      'sweet potatoes': '🍠', 'sweet potato': '🍠',
      'bell pepper': '🌶️', 'pepper': '🌶️',
      
      // Herbs - fresh vs dried
      'fresh basil': '🌿', 'fresh parsley': '🌿', 'fresh cilantro': '🌿', 'fresh oregano': '🌿', 'fresh thyme': '🌿',
      'dried basil': '🧂', 'dried oregano': '🧂', 'dried thyme': '🧂', 'italian seasoning': '🧂',
      
      // Spices and seasonings
      'black pepper': '🧂', 'salt': '🧂', 'garlic powder': '🧂', 'onion powder': '🧂',
      'paprika': '🧂', 'cumin': '🧂', 'chili powder': '🧂', 'cayenne': '🧂',
      'ground cumin': '🧂', 'ground cinnamon': '🧂', 'cinnamon': '🧂',
      
      // Dairy
      'whole milk': '🥛', 'skim milk': '🥛', 'heavy cream': '🥛', 'milk': '🥛', 'cream': '🥛',
      'cheddar cheese': '🧀', 'mozzarella': '🧀', 'parmesan': '🧀', 'cheese': '🧀',
      'butter': '🧈', 'unsalted butter': '🧈',
      
      // Oils and dressings - bottles
      'olive oil': '🧴', 'vegetable oil': '🧴', 'coconut oil': '🧴', 'canola oil': '🧴', 'oil': '🧴',
      'ranch dressing': '🧴', 'italian dressing': '🧴', 'vinaigrette': '🧴', 'dressing': '🧴',
      'soy sauce': '🧴', 'hot sauce': '🧴', 'worcestershire': '🧴',
      
      // Grains and starches
      'white rice': '🍚', 'brown rice': '🍚', 'jasmine rice': '🍚', 'rice': '🍚',
      'pasta': '🍝', 'spaghetti': '🍝', 'penne': '🍝', 'linguine': '🍝',
      'bread': '🍞', 'sourdough': '🍞', 'whole wheat bread': '🍞',
      
      // Beans and legumes
      'black beans': '🫘', 'kidney beans': '🫘', 'beans': '🫘', 'chickpeas': '🫘', 'lentils': '🫘',
      
      // Canned goods
      'diced tomatoes': '🥫', 'tomato sauce': '🥫', 'crushed tomatoes': '🥫',
      'chicken broth': '🥫', 'beef broth': '🥫', 'broth': '🥫', 'stock': '🥫'
    };

    const lowerIngredient = ingredient.toLowerCase();

    // Check quick matches first
    for (const [key, emoji] of Object.entries(quickMatches)) {
      if (lowerIngredient.includes(key)) {
        setIcon(emoji);
        return;
      }
    }

    // Enhanced fallback categorization
    if (lowerIngredient.includes('chicken') || lowerIngredient.includes('poultry')) {
      setIcon('🍗');
    } else if (lowerIngredient.includes('beef') || lowerIngredient.includes('steak')) {
      setIcon('🥩');
    } else if (lowerIngredient.includes('pork') || lowerIngredient.includes('bacon') || lowerIngredient.includes('ham')) {
      setIcon('🥩');
    } else if (lowerIngredient.includes('fish') || lowerIngredient.includes('salmon') || lowerIngredient.includes('tuna')) {
      setIcon('🐟');
    } else if (lowerIngredient.includes('fresh') && (lowerIngredient.includes('basil') || lowerIngredient.includes('parsley') || lowerIngredient.includes('cilantro') || lowerIngredient.includes('herb'))) {
      setIcon('🌿');
    } else if ((lowerIngredient.includes('dried') || lowerIngredient.includes('seasoning') || lowerIngredient.includes('powder') || lowerIngredient.includes('spice')) && (lowerIngredient.includes('basil') || lowerIngredient.includes('oregano') || lowerIngredient.includes('herb'))) {
      setIcon('🧂');
    } else if (lowerIngredient.includes('pepper') || lowerIngredient.includes('salt') || lowerIngredient.includes('spice') || lowerIngredient.includes('powder') || lowerIngredient.includes('cumin') || lowerIngredient.includes('paprika')) {
      setIcon('🧂');
    } else if (lowerIngredient.includes('dressing') || lowerIngredient.includes('vinaigrette') || lowerIngredient.includes('ranch') || lowerIngredient.includes('sauce') || lowerIngredient.includes('oil')) {
      setIcon('🧴');
    }
  }, [ingredient]);

  return (
    <li style={{
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px'
    }}>
      <span style={{
        fontSize: '1.1rem',
        marginTop: '2px',
        flexShrink: 0
      }}>
        {icon}
      </span>
      <span style={{
        color: '#333',
        lineHeight: '1.4'
      }}>
        {ingredient.trim()}
      </span>
    </li>
  );
}

export default IngredientItem;