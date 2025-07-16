// src/shared/utils/formatters.js or extractors.js

export function extractMainRecipeImage(htmlString) {
  if (typeof window === 'undefined' || !window.DOMParser) {
    // Node.js fallback: no DOMParser, skip extraction
    return null;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    // Try to grab main content first (common classes/ids)
    let main = doc.querySelector("main, .recipe, #recipe, .main, .content") || doc.body;
    let imgs = Array.from(main.querySelectorAll("img"));
    if (imgs.length === 0) imgs = Array.from(doc.querySelectorAll("img"));
    if (imgs.length === 0) return null;
    // Prefer images with width > 200px (for dish photos), fallback to first
    let bigImg = imgs.find(img => (img.width || 0) > 200) || imgs[0];
    return bigImg.src || null;
  } catch {
    return null;
  }
}
