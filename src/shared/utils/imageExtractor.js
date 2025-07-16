// src/shared/utils/imageExtractor.js - Enhanced image extraction
export function extractLargestImage(htmlString, baseUrl) {
  if (typeof window === 'undefined' || !window.DOMParser) {
    return extractImageFromHTML(htmlString, baseUrl);
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    
    // Get all images from the page
    const images = Array.from(doc.querySelectorAll("img"));
    
    if (images.length === 0) {
      return extractImageFromHTML(htmlString, baseUrl);
    }

    // Filter and score images
    const candidateImages = images
      .map(img => ({
        src: resolveUrl(img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src'), baseUrl),
        width: parseInt(img.width) || parseInt(img.getAttribute('width')) || 0,
        height: parseInt(img.height) || parseInt(img.getAttribute('height')) || 0,
        alt: img.alt || '',
        className: img.className || '',
        parentClassName: img.parentElement ? img.parentElement.className : '',
        score: 0
      }))
      .filter(img => img.src && isValidImageUrl(img.src))
      .map(img => {
        // Calculate image score based on various factors
        let score = 0;
        
        // Size scoring (prefer larger images)
        const area = img.width * img.height;
        if (area > 50000) score += 50; // Large images
        else if (area > 20000) score += 30; // Medium images
        else if (area > 5000) score += 10; // Small images
        
        // Prefer images with food-related keywords
        const foodKeywords = ['recipe', 'food', 'dish', 'meal', 'cooking', 'kitchen', 'main', 'hero'];
        const imageText = (img.alt + ' ' + img.className + ' ' + img.parentClassName).toLowerCase();
        
        foodKeywords.forEach(keyword => {
          if (imageText.includes(keyword)) score += 20;
        });
        
        // Penalize common non-food images
        const skipKeywords = ['avatar', 'profile', 'logo', 'icon', 'button', 'ad', 'banner', 'social'];
        skipKeywords.forEach(keyword => {
          if (imageText.includes(keyword)) score -= 30;
        });
        
        // Prefer images in main content areas
        const contentKeywords = ['content', 'main', 'article', 'recipe-card', 'recipe-image'];
        contentKeywords.forEach(keyword => {
          if (img.parentClassName.includes(keyword)) score += 15;
        });
        
        // Prefer square or landscape images (typical for food photos)
        if (img.width > 0 && img.height > 0) {
          const ratio = img.width / img.height;
          if (ratio >= 0.8 && ratio <= 1.5) score += 10; // Good aspect ratio for food
        }
        
        img.score = score;
        return img;
      });

    // Sort by score and return the best image
    candidateImages.sort((a, b) => b.score - a.score);
    
    // Return the highest scoring image if it has a positive score
    if (candidateImages.length > 0 && candidateImages[0].score > 0) {
      return candidateImages[0].src;
    }
    
    // Fallback to largest image by area
    const largestImage = candidateImages
      .filter(img => img.width > 100 && img.height > 100) // Minimum size filter
      .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
    
    return largestImage ? largestImage.src : null;
    
  } catch (error) {
    console.warn('DOM parsing failed, using regex fallback:', error);
    return extractImageFromHTML(htmlString, baseUrl);
  }
}

// Fallback regex-based extraction for Node.js environments
function extractImageFromHTML(html, baseUrl) {
  if (!html) return null;
  
  // Try Open Graph image first
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch && ogMatch[1]) {
    return resolveUrl(ogMatch[1], baseUrl);
  }
  
  // Try Twitter card image
  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twitterMatch && twitterMatch[1]) {
    return resolveUrl(twitterMatch[1], baseUrl);
  }
  
  // Find all img tags and extract the largest one
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:width=["'](\d+)["'][^>]*)?(?:height=["'](\d+)["'][^>]*)?/gi;
  const images = [];
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    const width = parseInt(match[2]) || 0;
    const height = parseInt(match[3]) || 0;
    
    if (isValidImageUrl(src)) {
      images.push({
        src: resolveUrl(src, baseUrl),
        width,
        height,
        area: width * height
      });
    }
  }
  
  if (images.length === 0) return null;
  
  // Sort by area (largest first) and return the largest image
  images.sort((a, b) => b.area - a.area);
  return images[0].src;
}

// Helper function to resolve relative URLs
function resolveUrl(url, baseUrl) {
  if (!url) return null;
  
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Protocol-relative URL
  if (url.startsWith('//')) {
    const protocol = baseUrl.startsWith('https:') ? 'https:' : 'http:';
    return protocol + url;
  }
  
  // Relative URL
  if (baseUrl) {
    try {
      const base = new URL(baseUrl);
      return new URL(url, base).href;
    } catch (error) {
      console.warn('Failed to resolve URL:', url, 'with base:', baseUrl);
      return url;
    }
  }
  
  return url;
}

// Helper function to validate image URLs
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Check for valid image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i;
  if (imageExtensions.test(url)) return true;
  
  // Check for common image hosting domains
  const imageHosts = [
    'imgur.com',
    'cloudinary.com', 
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
    'images.unsplash.com',
    'cdn.',
    'assets.',
    'static.',
    'img.',
    'image.',
    'photo.'
  ];
  
  return imageHosts.some(host => url.includes(host));
}

// Export helper for external use
export { resolveUrl, isValidImageUrl };