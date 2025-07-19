// src/services/ingredientIconService.js - AI-powered ingredient icon service
import { db } from '../config/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

class IngredientIconService {
  constructor() {
    this.collectionName = 'ingredientIcons';
    this.cache = new Map();
    this.pendingBatch = new Set();
    this.batchTimeout = null;
    this.batchDelay = 2000; // 2 seconds to collect ingredients
  }

  // Get icon for an ingredient (AI-powered with caching)
  async getIcon(ingredient, openaiApiKey, userId) {
    if (!ingredient || !openaiApiKey) return '🥄';
    
    const normalizedIngredient = this.normalizeIngredient(ingredient);
    
    // Check cache first
    if (this.cache.has(normalizedIngredient)) {
      return this.cache.get(normalizedIngredient);
    }

    // Check Firebase if user is logged in
    if (userId) {
      const firebaseIcon = await this.getFromFirebase(normalizedIngredient, userId);
      if (firebaseIcon) {
        this.cache.set(normalizedIngredient, firebaseIcon);
        return firebaseIcon;
      }
    }

    // Add to batch for AI processing
    this.pendingBatch.add(normalizedIngredient);
    this.scheduleBatchProcess(openaiApiKey, userId);
    
    // Return placeholder while processing
    return '🥄';
  }

  // Normalize ingredient for consistent caching
  normalizeIngredient(ingredient) {
    return ingredient.toLowerCase().trim()
      .replace(/\s+/g, ' ')
      .replace(/[0-9]+\s*(cups?|tbsp?|tsp?|lbs?|oz|g|kg|ml|l)\s*/gi, '')
      .replace(/^\d+[\s\/]*/, '')
      .replace(/,.*$/, '')
      .trim();
  }

  // Schedule batch processing
  scheduleBatchProcess(openaiApiKey, userId) {
    if (this.batchTimeout) return;
    
    this.batchTimeout = setTimeout(() => {
      this.processBatch(openaiApiKey, userId);
    }, this.batchDelay);
  }

  // Process a batch of ingredients with AI
  async processBatch(openaiApiKey, userId) {
    if (this.pendingBatch.size === 0) {
      this.batchTimeout = null;
      return;
    }

    const ingredients = Array.from(this.pendingBatch);
    this.pendingBatch.clear();
    this.batchTimeout = null;

    try {
      const prompt = `For each ingredient below, provide ONLY the most appropriate single emoji icon. 
Consider the main/primary ingredient, not modifiers or quantities.
Return ONLY a JSON object with ingredient names as keys and emoji as values.

Ingredients:
${ingredients.join('\n')}

Example format:
{"chicken breast": "🍗", "garlic": "🧄", "olive oil": "🫒"}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that assigns perfect emoji icons to cooking ingredients. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get icons from AI');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const icons = JSON.parse(content);
        
        // Update cache and Firebase
        for (const [ingredient, icon] of Object.entries(icons)) {
          this.cache.set(ingredient, icon);
          if (userId) {
            await this.saveToFirebase(ingredient, icon, userId);
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
    } catch (error) {
      console.error('Failed to process batch:', error);
    }
  }

  // Get icon from Firebase
  async getFromFirebase(ingredient, userId) {
    try {
      const iconDoc = doc(db, 'users', userId, this.collectionName, ingredient);
      const snapshot = await getDocs(iconDoc);
      if (snapshot.exists()) {
        return snapshot.data().icon;
      }
    } catch (error) {
      console.error('Failed to get icon from Firebase:', error);
    }
    return null;
  }

  // Save icon to Firebase
  async saveToFirebase(ingredient, icon, userId) {
    if (!userId || !ingredient || !icon) return;
    
    try {
      const iconDoc = doc(db, 'users', userId, this.collectionName, ingredient);
      await setDoc(iconDoc, {
        ingredient,
        icon,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save icon to Firebase:', error);
    }
  }

  // Get all custom icons from Firebase
  async getCustomIcons(userId) {
    if (!userId) return {};
    
    try {
      const iconsCollection = collection(db, 'users', userId, this.collectionName);
      const snapshot = await getDocs(iconsCollection);
      
      const customIcons = {};
      snapshot.forEach((doc) => {
        customIcons[doc.id] = doc.data().icon;
      });
      
      return customIcons;
    } catch (error) {
      console.error('Error fetching custom icons:', error);
      return {};
    }
  }

  // Delete custom icon mapping
  async deleteCustomIcon(userId, ingredient) {
    if (!userId || !ingredient) return false;
    
    try {
      const iconDoc = doc(db, 'users', userId, this.collectionName, ingredient);
      await deleteDoc(iconDoc);
      this.cache.delete(ingredient);
      return true;
    } catch (error) {
      console.error('Error deleting custom icon:', error);
      return false;
    }
  }

  // Clear local cache
  clearCache() {
    this.cache.clear();
    this.pendingBatch.clear();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  // Get statistics
  async getStats(userId) {
    const localIcons = this.cache.size;
    let firebaseIcons = 0;
    
    if (userId) {
      const customIcons = await this.getCustomIcons(userId);
      firebaseIcons = Object.keys(customIcons).length;
    }
    
    return {
      cacheSize: localIcons,
      localIcons,
      firebaseIcons
    };
  }

  // Export mappings
  async exportMappings(userId) {
    const mappings = {};
    
    // Add local cache
    for (const [ingredient, icon] of this.cache) {
      mappings[ingredient] = icon;
    }
    
    // Add Firebase icons
    if (userId) {
      const customIcons = await this.getCustomIcons(userId);
      Object.assign(mappings, customIcons);
    }
    
    return mappings;
  }
}

// Create singleton instance
const ingredientIconService = new IngredientIconService();

// Export the instance
export default ingredientIconService;