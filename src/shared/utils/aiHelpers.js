// src/shared/utils/aiHelpers.js - Fixed syntax error and updated with recipe title cleaning
import { extractLargestImage } from './imageExtractor';

// Function to clean recipe titles by removing buzz words
function cleanRecipeTitle(title) {
  if (!title || typeof title !== 'string') return title;
  
  // List of buzz words to remove (case insensitive)
  const buzzWords = [
    'recipe', 'recipes',
    'easy', 'simple', 'quick', 'fast', 'instant',
    'classic', 'traditional', 'authentic', 'original',
    'best', 'perfect', 'ultimate', 'amazing', 'delicious',
    'homemade', 'fresh', 'healthy', 'low-carb', 'keto',
    'vegan', 'vegetarian', 'gluten-free',
    'crispy', 'creamy', 'tender', 'fluffy', 'moist',
    'one-pot', 'sheet-pan', 'slow-cooker', 'instant-pot',
    'copycat', 'restaurant-style'
  ];
  
  // Split title into words
  let words = title.trim().split(/\s+/);
  
  // Remove buzz words (case insensitive)
  words = words.filter(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    return !buzzWords.includes(cleanWord);
  });
  
  // Join back together and clean up
  let cleanTitle = words.join(' ').trim();
  
  // Handle edge cases where title becomes empty or too short
  if (cleanTitle.length < 3 || !cleanTitle) {
    return title; // Return original if cleaning made it too short
  }
  
  return cleanTitle;
}

export async function parseRecipeFromUrl(url, apiKey) {
  // Try to fetch the actual page content with timeout
  let pageContent = '';
  let mainImageUrl = null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      pageContent = await response.text();
      mainImageUrl = extractLargestImage(pageContent, url);
    }
  } catch (error) {
    console.warn('Could not fetch page directly, using AI-only approach:', error);
  }

  // Build an image note for OpenAI
  const imageNote = mainImageUrl
    ? `Main Recipe Image found: ${mainImageUrl}`
    : 'No main image found - AI should generate or find an appropriate recipe image.';

  // AI call that ONLY extracts cook time, NO auto-assignment of cooking methods
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Extract complete recipe information from this URL and return it as a JSON object.

URL: ${url}
${pageContent ? `\nPage Content (first 6000 chars):\n${pageContent.substring(0, 6000)}` : '\nNo page content available - please create a reasonable template.'}
${imageNote}

// CRITICAL INSTRUCTIONS - ZERO AUTO-ASSIGNMENT:
1. NEVER auto-detect meal types - ALWAYS return "dinner" as default
2. NEVER auto-assign ANY tags - ALL tags must be false
3. User MUST manually assign ALL tags and meal types
4. ONLY detect cook time - nothing else
5. CLEAN the recipe title by removing buzz words like "Easy", "Classic", "Fast", "Recipe"

Return the data as a JSON object with this EXACT structure:

{
  "title": "Recipe Name",
  "ingredients": "ingredient 1\\ningredient 2\\ningredient 3",
  "instructions": "step 1\\nstep 2\\nstep 3", 
  "mealType": "dinner",
  "cookTime": "30 Minutes",
  "cookTimeAIGenerated": false,
  "sourceUrl": "${url}",
  "image": ${mainImageUrl ? `"${mainImageUrl}"` : "null"},
  "images": [],
  "nutrition": {
    "calories": "400",
    "protein": "25", 
    "carbs": "30",
    "fat": "15",
    "fiber": "5",
    "servings": "4"
  },
  "tags": {
    "familyApproved": false,
    "mealPrep": false,
    "grill": false,
    "bake": false,
    "stove": false,
    "slowCooker": false,
    "microwave": false
  }
}

CRITICAL INSTRUCTIONS - NO AUTO-ASSIGNMENT:
1. ALWAYS set ALL tags to false - DO NOT auto-assign any cooking method tags
2. familyApproved: ALWAYS false (user must manually assign)
3. mealPrep: ALWAYS false (user must manually assign)  
4. grill: ALWAYS false (user must manually assign)
5. bake: ALWAYS false (user must manually assign)
6. stove: ALWAYS false (user must manually assign)
7. slowCooker: ALWAYS false (user must manually assign)
8. microwave: ALWAYS false (user must manually assign)

TITLE CLEANING:
1. Remove buzz words like "Easy", "Classic", "Fast", "Recipe", "Best", "Perfect", "Ultimate", "Quick", "Simple"
2. Example: "Easy Goulash Recipe" becomes "Goulash"
3. Example: "Classic Meatloaf Recipe" becomes "Meatloaf"
4. Example: "Quick Chicken Teriyaki" becomes "Chicken Teriyaki"
5. Keep the essence of the dish name, remove marketing words

COOK TIME EXTRACTION (ONLY):
1. Look for actual cook time in the page content first (phrases like "Cook time:", "Total time:", "Prep + Cook:")
2. If found, format as: "15 Minutes", "30 Minutes", "1 Hour", "1 Hour 30 Minutes" and set cookTimeAIGenerated to false
3. If not found, estimate based on ingredients/instructions and set cookTimeAIGenerated to true
4. Format all times consistently (no "<" symbols, just exact times)

ENHANCED NUTRITION EXTRACTION:
1. Look for nutrition facts, nutrition information, or recipe cards
2. Extract ALL available nutrition data (calories, protein, carbs, fat, fiber, sodium, sugar, etc.)
3. If nutrition info is missing, make reasonable estimates based on ingredients
4. Always include servings information - look for "serves", "makes", "portions"
5. Ensure all nutrition values are realistic numbers

ENHANCED IMAGE HANDLING:
1. If no image was found in page extraction, search for recipe name + food on web
2. Or generate a food image URL that matches the recipe
3. Prefer high-quality food photography images

OTHER INSTRUCTIONS:
- Use \\n to separate lines in ingredients and instructions
- For mealType, choose from: breakfast, lunch, dinner, snack, dessert, drinks
- Return ONLY the JSON object, no other text`
      }],
      max_tokens: 2500,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.choices || result.choices.length === 0) {
    throw new Error('Invalid AI response');
  }

  const content = result.choices[0].message.content;

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response as JSON');
  }

  try {
    const parsedRecipe = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsedRecipe.title || !parsedRecipe.ingredients || !parsedRecipe.instructions) {
      throw new Error('Incomplete recipe data from AI');
    }

    // Clean the recipe title
    if (parsedRecipe.title) {
      parsedRecipe.title = cleanRecipeTitle(parsedRecipe.title);
    }

    // Ensure we have a cook time
    if (!parsedRecipe.cookTime) {
      parsedRecipe.cookTime = "30 Minutes";
      parsedRecipe.cookTimeAIGenerated = true;
    }

    // FORCE all tags to false to prevent auto-assignment
    parsedRecipe.tags = {
      familyApproved: false,
      mealPrep: false,
      grill: false,
      bake: false,
      stove: false,
      slowCooker: false,
      microwave: false
    };

    // Enhanced image logic
    if (!mainImageUrl && !parsedRecipe.image) {
      // Try to generate/find an image using AI or search
      parsedRecipe.image = await generateRecipeImage(parsedRecipe.title, apiKey);
    } else {
      parsedRecipe.image = mainImageUrl || parsedRecipe.image || null;
    }

    parsedRecipe.images = parsedRecipe.images || [];

    return parsedRecipe;
  } catch (error) {
    throw new Error('Failed to parse recipe JSON: ' + error.message);
  }
}

export async function parseRecipeFromText(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Extract complete recipe information from this text and return it as a JSON object.

Recipe Text:
${text}

Return the data as a JSON object with this EXACT structure:

{
  "title": "Recipe Name",
  "ingredients": "ingredient 1\\ningredient 2\\ningredient 3",
  "instructions": "step 1\\nstep 2\\nstep 3",
  "mealType": "dinner",
  "cookTime": "30 Minutes",
  "cookTimeAIGenerated": true,
  "sourceUrl": null,
  "image": null,
  "images": [],
  "nutrition": {
    "calories": "400",
    "protein": "25",
    "carbs": "30", 
    "fat": "15",
    "fiber": "5",
    "servings": "4"
  },
  "tags": {
    "familyApproved": false,
    "mealPrep": false,
    "grill": false,
    "bake": false,
    "stove": false,
    "slowCooker": false,
    "microwave": false
  }
}

TITLE CLEANING:
1. Remove buzz words like "Easy", "Classic", "Fast", "Recipe", "Best", "Perfect", "Ultimate", "Quick", "Simple"
2. Example: "Easy Goulash Recipe" becomes "Goulash"
3. Example: "Classic Meatloaf Recipe" becomes "Meatloaf"

CRITICAL - ALWAYS set ALL tags to false. NO AUTO-ASSIGNMENT of any tags.
Follow the same enhanced nutrition extraction as URL parsing.
Return ONLY the JSON object, no other text.`
      }],
      max_tokens: 2000,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response as JSON');
  }

  try {
    const parsedRecipe = JSON.parse(jsonMatch[0]);
    
    if (!parsedRecipe.title || !parsedRecipe.ingredients || !parsedRecipe.instructions) {
      throw new Error('Incomplete recipe data from AI');
    }

    // Clean the recipe title
    if (parsedRecipe.title) {
      parsedRecipe.title = cleanRecipeTitle(parsedRecipe.title);
    }

    if (!parsedRecipe.cookTime) {
      parsedRecipe.cookTime = "30 Minutes";
      parsedRecipe.cookTimeAIGenerated = true;
    }

    // FORCE all tags to false to prevent auto-assignment
    parsedRecipe.tags = {
      familyApproved: false,
      mealPrep: false,
      grill: false,
      bake: false,
      stove: false,
      slowCooker: false,
      microwave: false
    };

    // Try to get an image for text-based recipes too
    if (!parsedRecipe.image) {
      parsedRecipe.image = await generateRecipeImage(parsedRecipe.title, apiKey);
    }

    return parsedRecipe;
  } catch (error) {
    throw new Error('Failed to parse recipe JSON: ' + error.message);
  }
}

// New function to generate or find recipe images
async function generateRecipeImage(recipeTitle, apiKey) {
  try {
    // Option 1: Use a food image API or search
    const searchQuery = encodeURIComponent(recipeTitle + " food recipe");
    
    // For now, we'll use a simple fallback to a food placeholder
    // You could integrate with Unsplash API, Pexels API, or DALL-E here
    
    // Placeholder approach - use a consistent food image service
    const placeholderUrl = `https://source.unsplash.com/400x300/?${searchQuery}`;
    
    return placeholderUrl;
  } catch (error) {
    console.warn('Could not generate recipe image:', error);
    return null;
  }
}

// Enhanced scaling function with "Adjust" branding
export async function scaleWithAI(item, targetServings, apiKey, isMeal = false, saveScaled = false) {
  // Debug API key
  console.log('Scale API Key:', apiKey ? 'sk-...' + apiKey.slice(-4) : 'Not provided');
  
  // Validate API key
  if (!apiKey || !apiKey.trim()) {
    throw new Error('OpenAI API key is required');
  }
  
  const trimmedApiKey = apiKey.trim();
  if (!trimmedApiKey.startsWith('sk-')) {
    throw new Error('Invalid API key format. OpenAI API keys should start with "sk-"');
  }

  const currentServings = parseInt(item.nutrition?.servings) || 1;
  const scaleFactor = targetServings / currentServings;

  console.log('Scaling recipe:', item.title, 'from', currentServings, 'to', targetServings);

  // Truncate long content to avoid token limits
  const MAX_INGREDIENT_LENGTH = 2000;
  const MAX_INSTRUCTION_LENGTH = 2000;
  
  let truncatedIngredients = item.ingredients || '';
  let truncatedInstructions = item.instructions || '';
  
  // For meals with combined recipes, we need to be more aggressive with truncation
  if (isMeal && truncatedIngredients.length > MAX_INGREDIENT_LENGTH) {
    // Try to keep the first part of each recipe's ingredients
    const lines = truncatedIngredients.split('\n');
    let result = [];
    let currentLength = 0;
    
    for (const line of lines) {
      if (currentLength + line.length > MAX_INGREDIENT_LENGTH) break;
      result.push(line);
      currentLength += line.length + 1;
    }
    
    truncatedIngredients = result.join('\n') + '\n... (some ingredients truncated for processing)';
  } else if (truncatedIngredients.length > MAX_INGREDIENT_LENGTH) {
    truncatedIngredients = truncatedIngredients.substring(0, MAX_INGREDIENT_LENGTH) + '... (truncated)';
  }
  
  if (truncatedInstructions.length > MAX_INSTRUCTION_LENGTH) {
    truncatedInstructions = truncatedInstructions.substring(0, MAX_INSTRUCTION_LENGTH) + '... (truncated)';
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${trimmedApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Scale this ${isMeal ? 'meal' : 'recipe'} from ${currentServings} to ${targetServings} servings (${scaleFactor}x).

Title: ${item.title}
Ingredients: ${truncatedIngredients}
Instructions: ${truncatedInstructions}

IMPORTANT: Multiply ALL quantities by ${scaleFactor}.

Return ONLY scaled ingredients and instructions in this JSON format:
{
  "ingredients": "scaled ingredients here",
  "instructions": "scaled instructions here"
}`
        }],
        max_tokens: 1500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Handle specific error cases
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        const message = errorData?.error?.message || 'Bad request';
        if (message.includes('quota')) {
          throw new Error('OpenAI API quota exceeded. Please check your account.');
        } else if (message.includes('context length')) {
          // If still too long, fall back to simple scaling
          console.warn('Recipe too long for AI scaling, using simple multiplication');
          return createSimpleScaledRecipe(item, targetServings, scaleFactor);
        }
        throw new Error('Request error: ' + message);
      }
      
      const errorMessage = errorData?.error?.message || `OpenAI API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse adjustment response');
    }

    const scaledContent = JSON.parse(jsonMatch[0]);
    
    // Build the complete scaled recipe
    const adjustedRecipe = {
      ...item,
      id: saveScaled ? Date.now() : item.id,
      title: saveScaled ? `${item.title} (${targetServings} servings)` : item.title,
      ingredients: scaledContent.ingredients || item.ingredients,
      instructions: scaledContent.instructions || item.instructions,
      nutrition: {
        calories: Math.round((parseInt(item.nutrition?.calories) || 0) * scaleFactor).toString(),
        protein: Math.round((parseInt(item.nutrition?.protein) || 0) * scaleFactor).toString(),
        carbs: Math.round((parseInt(item.nutrition?.carbs) || 0) * scaleFactor).toString(),
        fat: Math.round((parseInt(item.nutrition?.fat) || 0) * scaleFactor).toString(),
        fiber: Math.round((parseInt(item.nutrition?.fiber) || 0) * scaleFactor).toString(),
        servings: targetServings.toString()
      },
      isScaledPreview: !saveScaled,
      originalId: saveScaled ? null : item.id
    };
    
    return adjustedRecipe;
  } catch (error) {
    // If AI fails, fall back to simple scaling
    if (error.message.includes('context length') || error.message.includes('too long')) {
      return createSimpleScaledRecipe(item, targetServings, scaleFactor);
    }
    throw error;
  }
}

// Fallback function for simple scaling when recipe is too long
function createSimpleScaledRecipe(item, targetServings, scaleFactor) {
  return {
    ...item,
    id: Date.now(),
    title: `${item.title} (${targetServings} servings)`,
    ingredients: `${item.ingredients}\n\n⚠️ Note: Please manually adjust quantities by ${scaleFactor}x`,
    instructions: item.instructions,
    nutrition: {
      calories: Math.round((parseInt(item.nutrition?.calories) || 0) * scaleFactor).toString(),
      protein: Math.round((parseInt(item.nutrition?.protein) || 0) * scaleFactor).toString(),
      carbs: Math.round((parseInt(item.nutrition?.carbs) || 0) * scaleFactor).toString(),
      fat: Math.round((parseInt(item.nutrition?.fat) || 0) * scaleFactor).toString(),
      fiber: Math.round((parseInt(item.nutrition?.fiber) || 0) * scaleFactor).toString(),
      servings: targetServings.toString()
    },
    isScaledPreview: false,
    originalId: null
  };
}