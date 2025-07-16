// src/shared/utils/imageStrategy.js - Enhanced image handling with multiple fallbacks

/**
 * Advanced image finding strategy with multiple fallbacks
 * @param {string} recipeTitle - Recipe title for search
 * @param {string} html - HTML content from recipe page
 * @param {string} apiKey - OpenAI API key for DALL-E generation
 * @returns {Promise<string|null>} Best image URL found
 */
export async function findBestRecipeImage(recipeTitle, html, apiKey) {
  // Strategy 1: Extract from HTML content
  const extractedImage = extractImageFromHTML(html);
  if (extractedImage && await isImageAccessible(extractedImage)) {
    return extractedImage;
  }

  // Strategy 2: Use Unsplash with recipe-specific search
  const unsplashImage = getUnsplashImage(recipeTitle);
  if (await isImageAccessible(unsplashImage)) {
    return unsplashImage;
  }

  // Strategy 3: Use Pexels API (free tier)
  const pexelsImage = await getPexelsImage(recipeTitle);
  if (pexelsImage && await isImageAccessible(pexelsImage)) {
    return pexelsImage;
  }

  // Strategy 4: Generate with DALL-E (if API key provided)
  if (apiKey) {
    try {
      const dalleImage = await generateDALLEImage(recipeTitle, apiKey);
      if (dalleImage) return dalleImage;
    } catch (error) {
      console.warn('DALL-E generation failed:', error);
    }
  }

  // Strategy 5: Fallback to curated food images
  return getFallbackFoodImage(recipeTitle);
}

/**
 * Extract the best image from HTML content
 */
function extractImageFromHTML(html) {
  if (!html) return null;

  // Try Open Graph first
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch && ogMatch[1]) return ogMatch[1];

  // Try Twitter card
  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twitterMatch && twitterMatch[1]) return twitterMatch[1];

  // Look for recipe-specific image patterns
  const recipeImagePatterns = [
    /recipe-image[^>]+src=["']([^"']+)["']/i,
    /hero-image[^>]+src=["']([^"']+)["']/i,
    /main-image[^>]+src=["']([^"']+)["']/i,
    /food-image[^>]+src=["']([^"']+)["']/i
  ];

  for (const pattern of recipeImagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) return match[1];
  }

  // Fallback to largest image
  const allImages = [...html.matchAll(/<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))["'][^>]*>/gi)];
  if (allImages.length > 0) {
    // Prefer images with food-related alt text
    const foodImage = allImages.find(match => {
      const imgTag = match[0];
      return /alt=["'][^"']*(recipe|food|dish|meal|cooking)[^"']*["']/i.test(imgTag);
    });
    return foodImage ? foodImage[1] : allImages[0][1];
  }

  return null;
}

/**
 * Get Unsplash image with better search terms
 */
function getUnsplashImage(recipeTitle) {
  // Clean and enhance search terms
  const cleanTitle = recipeTitle
    .toLowerCase()
    .replace(/recipe|easy|quick|best|homemade/g, '')
    .replace(/[^\w\s]/g, '')
    .trim();
  
  const searchTerms = [
    `${cleanTitle} food`,
    `${cleanTitle} dish`,
    `${cleanTitle} recipe`,
    'food photography',
    'gourmet food'
  ];

  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
  const encodedTerm = encodeURIComponent(randomTerm);
  
  return `https://source.unsplash.com/600x400/?${encodedTerm}&auto=format&fit=crop`;
}

/**
 * Get image from Pexels API (free tier)
 */
async function getPexelsImage(recipeTitle) {
  try {
    // You can get a free API key from https://www.pexels.com/api/
    // For now, we'll use a public endpoint approach
    const cleanTitle = recipeTitle.replace(/[^\w\s]/g, '').trim();
    const searchTerm = `${cleanTitle} food`.substring(0, 50);
    
    // Note: This would require a Pexels API key in production
    // For demo purposes, we'll return null and fall back to other methods
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate image using DALL-E
 */
async function generateDALLEImage(recipeTitle, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `A professional, appetizing photo of ${recipeTitle}. High-quality food photography, well-lit, restaurant-style presentation, clean background.`,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.[0]?.url || null;
  } catch (error) {
    console.warn('DALL-E image generation failed:', error);
    return null;
  }
}

/**
 * Fallback to curated food images
 */
function getFallbackFoodImage(recipeTitle) {
  // Map recipe types to curated image URLs
  const foodTypeImages = {
    pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop',
    pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop',
    burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
    salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
    soup: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop',
    chicken: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop',
    fish: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&h=400&fit=crop',
    beef: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop',
    dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop',
    cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
    bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop'
  };

  const lowerTitle = recipeTitle.toLowerCase();
  
  // Find matching food type
  for (const [foodType, imageUrl] of Object.entries(foodTypeImages)) {
    if (lowerTitle.includes(foodType)) {
      return imageUrl;
    }
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=400&fit=crop';
}

/**
 * Check if image URL is accessible
 */
async function isImageAccessible(url) {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch (error) {
    return false;
  }
}

/**
 * Enhanced image extraction with validation
 */
export async function extractAndValidateImage(html, baseUrl) {
  const imageUrl = extractImageFromHTML(html);
  
  if (!imageUrl) return null;
  
  // Resolve relative URLs
  let resolvedUrl = imageUrl;
  if (baseUrl && !imageUrl.startsWith('http')) {
    try {
      resolvedUrl = new URL(imageUrl, baseUrl).href;
    } catch (error) {
      console.warn('Failed to resolve image URL:', imageUrl);
      return null;
    }
  }
  
  // Validate accessibility
  if (await isImageAccessible(resolvedUrl)) {
    return resolvedUrl;
  }
  
  return null;
}