// src/services/ingredientIconService.js
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

class IngredientIconService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.localStorageKey = 'ingredient-icons-v1';
    this.batchQueue = [];
    this.batchTimeout = null;
    this.loadLocalCache();
  }

  // Load cache from localStorage
  loadLocalCache() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to load icon cache:', error);
    }
  }

  // Save cache to localStorage
  saveLocalCache() {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save icon cache:', error);
    }
  }

  // Normalize ingredient for consistent caching
  normalizeIngredient(ingredient) {
    return ingredient
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s]/g, ''); // Remove special characters
  }

  // Get icon for ingredient
  async getIcon(ingredient, apiKey, userId = null) {
    const normalized = this.normalizeIngredient(ingredient);
    
    // Check cache first
    if (this.cache.has(normalized)) {
      return this.cache.get(normalized);
    }

    // Check if we're already fetching this ingredient
    if (this.pendingRequests.has(normalized)) {
      return this.pendingRequests.get(normalized);
    }

    // Check Firebase if user is logged in
    if (userId) {
      const firebaseIcon = await this.getFromFirebase(normalized, userId);
      if (firebaseIcon) {
        this.cache.set(normalized, firebaseIcon);
        this.saveLocalCache();
        return firebaseIcon;
      }
    }

    // Queue for batch processing
    const promise = this.queueForBatch(ingredient, normalized, apiKey, userId);
    this.pendingRequests.set(normalized, promise);
    
    try {
      const icon = await promise;
      this.pendingRequests.delete(normalized);
      return icon;
    } catch (error) {
      this.pendingRequests.delete(normalized);
      return '🥄'; // Default fallback
    }
  }

  // Queue ingredient for batch processing
  queueForBatch(ingredient, normalized, apiKey, userId) {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({
        ingredient,
        normalized,
        apiKey,
        userId,
        resolve,
        reject
      });

      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      // Process batch after 100ms or when we have 10 items
      if (this.batchQueue.length >= 10) {
        this.processBatch();
      } else {
        this.batchTimeout = setTimeout(() => this.processBatch(), 100);
      }
    });
  }

  // Process batch of ingredients
  async processBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, 10); // Take up to 10 items
    const apiKey = batch[0].apiKey;
    const userId = batch[0].userId;

    if (!apiKey) {
      batch.forEach(item => item.resolve('🥄'));
      return;
    }

    try {
      const ingredients = batch.map(item => item.ingredient);
      const icons = await this.batchGenerateIcons(ingredients, apiKey);
      
      // Process results
      batch.forEach((item, index) => {
        const icon = icons[index] || '🥄';
        this.cache.set(item.normalized, icon);
        
        // Save to Firebase if user is logged in
        if (userId) {
          this.saveToFirebase(item.normalized, icon, item.ingredient, userId);
        }
        
        item.resolve(icon);
      });

      this.saveLocalCache();
    } catch (error) {
      console.error('Batch icon generation failed:', error);
      batch.forEach(item => item.resolve('🥄'));
    }
  }

  // Batch generate icons using AI
  async batchGenerateIcons(ingredients, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [{
          role: 'system',
          content: `You are a food emoji expert. For each ingredient, respond with the single most appropriate food emoji.
          
Rules:
- Use specific food emojis when possible (🍗 for chicken, not 🥩)
- For herbs use 🌿, for spices use 🧂
- For liquids use appropriate containers (🫒 for oil, 🍯 for honey)
- If no perfect match exists, use the closest category
- Consider the ingredient's primary use in cooking
- Be consistent: similar ingredients should get similar emojis`
        }, {
          role: 'user',
          content: `Return ONLY a JSON array of emojis for these ingredients in the same order:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}

Example response: ["🍗", "🧈", "🧂", "🌿", "🧄"]`
        }],
        max_tokens: 200,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    try {
      const emojis = JSON.parse(content);
      return Array.isArray(emojis) ? emojis : [];
    } catch {
      // Try to extract emojis from the response
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const matches = content.match(emojiRegex) || [];
      return matches;
    }
  }

  // Get from Firebase
  async getFromFirebase(normalized, userId) {
    try {
      // First check user's personal mappings
      const userDoc = await getDoc(doc(db, 'users', userId, 'ingredientIcons', normalized));
      if (userDoc.exists()) {
        return userDoc.data().icon;
      }

      // Then check global mappings
      const globalDoc = await getDoc(doc(db, 'globalIngredientIcons', normalized));
      if (globalDoc.exists()) {
        return globalDoc.data().icon;
      }
    } catch (error) {
      console.error('Firebase fetch error:', error);
    }
    return null;
  }

  // Save to Firebase
  async saveToFirebase(normalized, icon, original, userId) {
    try {
      const data = {
        icon,
        original,
        normalized,
        createdAt: new Date().toISOString(),
        userId
      };

      // Save to user's collection
      await setDoc(
        doc(db, 'users', userId, 'ingredientIcons', normalized),
        data
      );

      // Also save to global collection for sharing
      await setDoc(
        doc(db, 'globalIngredientIcons', normalized),
        {
          ...data,
          useCount: 1,
          lastUsed: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  }

  // Bulk load icons for a recipe
  async preloadRecipeIcons(recipe, apiKey, userId) {
    if (!recipe.ingredients) return;

    const ingredients = recipe.ingredients
      .split('\n')
      .filter(line => line.trim().length > 0);

    // Check which ones we need to fetch
    const needed = ingredients.filter(ing => {
      const normalized = this.normalizeIngredient(ing);
      return !this.cache.has(normalized);
    });

    if (needed.length === 0) return;

    // Batch process all needed ingredients
    const promises = needed.map(ing => 
      this.getIcon(ing, apiKey, userId)
    );

    await Promise.all(promises);
  }

  // Get icon statistics
  async getStats(userId) {
    const stats = {
      cacheSize: this.cache.size,
      localIcons: this.cache.size,
      firebaseIcons: 0
    };

    if (userId) {
      try {
        const snapshot = await getDocs(
          collection(db, 'users', userId, 'ingredientIcons')
        );
        stats.firebaseIcons = snapshot.size;
      } catch (error) {
        console.error('Failed to get stats:', error);
      }
    }

    return stats;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    localStorage.removeItem(this.localStorageKey);
  }

  // Export user's mappings
  async exportMappings(userId) {
    const mappings = {};
    
    // Add local cache
    this.cache.forEach((icon, key) => {
      mappings[key] = icon;
    });

    // Add Firebase mappings if available
    if (userId) {
      try {
        const snapshot = await getDocs(
          collection(db, 'users', userId, 'ingredientIcons')
        );
        snapshot.forEach(doc => {
          mappings[doc.id] = doc.data().icon;
        });
      } catch (error) {
        console.error('Export error:', error);
      }
    }

    return mappings;
  }
}

// Create singleton instance
const ingredientIconService = new IngredientIconService();

export default ingredientIconService;