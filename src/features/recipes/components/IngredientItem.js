// src/features/recipes/components/IngredientItem.js
import React, { useState, useEffect } from 'react';
import ingredientIconService from '../../../services/ingredientIconService';
import styles from './IngredientItem.module.css';

function IngredientItem({ ingredient, openaiApiKey, userId }) {
  const [icon, setIcon] = useState('🥄');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchIcon() {
      // Don't fetch if no API key
      if (!openaiApiKey) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedIcon = await ingredientIconService.getIcon(
          ingredient,
          openaiApiKey,
          userId
        );
        
        if (!cancelled) {
          setIcon(fetchedIcon);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to get icon:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchIcon();

    return () => {
      cancelled = true;
    };
  }, [ingredient, openaiApiKey, userId]);

  return (
    <div className={styles.ingredient}>
      <span className={`${styles.icon} ${isLoading ? styles.loading : ''}`}>
        {icon}
      </span>
      <span className={styles.text}>{ingredient.trim()}</span>
    </div>
  );
}

export default IngredientItem;