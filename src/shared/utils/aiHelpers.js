// src/shared/utils/aiHelpers.js - Fixed to ONLY detect cook time, NO auto-assignment of method tags
import { extractLargestImage } from './imageExtractor';

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
  const currentServings = parseInt(item.nutrition?.servings) || 1;
  const scaleFactor = targetServings / currentServings;

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
        content: `Adjust this ${isMeal ? 'meal' : 'recipe'} from ${currentServings} servings to ${targetServings} servings.

Current ${isMeal ? 'Meal' : 'Recipe'}:
Title: ${item.title}
Ingredients: ${item.ingredients}
Instructions: ${item.instructions}
Current Nutrition: ${JSON.stringify(item.nutrition)}

Adjustment factor: ${scaleFactor}x

Return a JSON object with the EXACT same structure but with adjusted quantities:

{
  "title": "${saveScaled ? `${item.title} (${targetServings} servings)` : item.title}",
  "ingredients": "adjusted ingredient 1\\nadjusted ingredient 2",
  "instructions": "updated instruction 1\\nupdated instruction 2", 
  "mealType": "${item.mealType}",
  "cookTime": "${item.cookTime}",
  "cookTimeAIGenerated": ${item.cookTimeAIGenerated || false},
  "sourceUrl": ${item.sourceUrl ? `"${item.sourceUrl}"` : "null"},
  "image": ${item.image ? `"${item.image}"` : "null"},
  "images": [],
  "nutrition": {
    "calories": "adjusted_value",
    "protein": "adjusted_value",
    "carbs": "adjusted_value", 
    "fat": "adjusted_value",
    "fiber": "adjusted_value",
    "servings": "${targetServings}"
  },
  "tags": ${JSON.stringify(item.tags)},
  "isScaledPreview": ${!saveScaled},
  "originalId": ${saveScaled ? 'null' : item.id}
}

Adjust ALL ingredient quantities proportionally. Update cooking times in instructions if needed for larger/smaller batches.
Ensure all nutrition values are properly adjusted.
Return ONLY the JSON object.`
      }],
      max_tokens: 1500,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse adjustment response');
  }

  try {
    const adjustedRecipe = JSON.parse(jsonMatch[0]);
    
    // Add metadata for preview vs saved
    adjustedRecipe.isScaledPreview = !saveScaled;
    adjustedRecipe.originalId = saveScaled ? null : item.id;
    
    return adjustedRecipe;
  } catch (error) {
    throw new Error('Failed to parse adjusted recipe: ' + error.message);
  }
}