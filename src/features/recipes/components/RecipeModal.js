// src/features/recipes/components/RecipeModal.js
import React, { useState, useEffect } from 'react';
import { scaleWithAI } from '../../../shared/utils/aiHelpers';
import IngredientItem from './IngredientItem';
import { formatNutritionValue } from '../../../shared/utils/formatters';
import ingredientIconService from '../../../services/ingredientIconService';
import { auth } from '../../../config/firebase';
import styles from './RecipeModal.module.css';

function RecipeModal({ recipe, isOpen, onClose, onUpdate, onDelete, openaiApiKey, onSaveScaled }) {
  const [scaledRecipe, setScaledRecipe] = useState(null);
  const [targetServings, setTargetServings] = useState('');
  const [isScaling, setIsScaling] = useState(false);
  const [showScaleInput, setShowScaleInput] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [iconsPreloaded, setIconsPreloaded] = useState(false);

  const userId = auth.currentUser?.uid;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScaledRecipe(null);
      setTargetServings('');
      setShowScaleInput(false);
      setImageError(false);
      setIconsPreloaded(false);
    }
  }, [isOpen, recipe?.id]);

  // Preload icons when recipe opens
  useEffect(() => {
    if (isOpen && recipe && openaiApiKey && !iconsPreloaded) {
      ingredientIconService.preloadRecipeIcons(recipe, openaiApiKey, userId)
        .then(() => setIconsPreloaded(true))
        .catch(console.error);
    }
  }, [isOpen, recipe, openaiApiKey, userId, iconsPreloaded]);

  // Use scaled recipe if available, otherwise original
  const displayRecipe = scaledRecipe || recipe;
  const isShowingScaled = Boolean(scaledRecipe);

  if (!isOpen || !recipe) return null;

  const handleScale = async () => {
    const servings = parseInt(targetServings);
    if (!servings || servings <= 0) {
      alert('Please enter a valid number of servings');
      return;
    }

    setIsScaling(true);
    try {
      const scaled = await scaleWithAI(recipe, servings, openaiApiKey, false, false);
      setScaledRecipe(scaled);
      setShowScaleInput(false);
      setTargetServings('');
    } catch (error) {
      alert('Error adjusting recipe: ' + error.message);
    } finally {
      setIsScaling(false);
    }
  };

  const handleSaveScaled = () => {
    if (scaledRecipe && onSaveScaled) {
      const newRecipe = {
        ...scaledRecipe,
        id: Date.now(),
        title: `${recipe.title} (${scaledRecipe.nutrition.servings} servings)`,
        isScaledPreview: false,
        originalId: null
      };
      onSaveScaled(newRecipe);
      alert('Adjusted recipe saved! ✨');
    }
  };

  const handleResetScale = () => {
    setScaledRecipe(null);
    setShowScaleInput(false);
    setTargetServings('');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large. Please choose a file smaller than 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(recipe.id, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const nutritionItems = [
    { key: 'calories', label: 'Calories', unit: '' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
    { key: 'fiber', label: 'Fiber', unit: 'g' },
    { key: 'servings', label: 'Servings', unit: '' }
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          ×
        </button>

        {/* Recipe Image */}
        {displayRecipe.image && !imageError ? (
          <img
            src={displayRecipe.image}
            alt={displayRecipe.title}
            className={styles.recipeImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            🍽️
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* Scaled Recipe Note */}
          {isShowingScaled && (
            <div className={styles.scaledNote}>
              📊 Showing scaled version ({displayRecipe.nutrition.servings} servings)
              <button
                onClick={handleResetScale}
                className="btn btn-sm"
                style={{ marginLeft: '10px' }}
              >
                Show Original
              </button>
            </div>
          )}

          {/* Title */}
          <h2 className={styles.title}>{displayRecipe.title}</h2>

          {/* Metadata */}
          <div className={styles.metadata}>
            <span>⏱️ <strong>Cook Time:</strong> {displayRecipe.cookTime || 'Not specified'}</span>
            <span>🍽️ <strong>Type:</strong> {displayRecipe.mealType}</span>
            <span>📅 <strong>Added:</strong> {new Date(displayRecipe.id).toLocaleDateString()}</span>
          </div>

          {/* Scaling Section */}
          {!isShowingScaled && onSaveScaled && (
            <div className={styles.scaleSection}>
              <h3 className={styles.sectionTitle}>⚖️ Adjust Servings</h3>
              {!showScaleInput ? (
                <button
                  onClick={() => setShowScaleInput(true)}
                  className="btn btn-primary btn-sm"
                  disabled={!openaiApiKey}
                >
                  Scale Recipe
                </button>
              ) : (
                <div className={styles.scaleInput}>
                  <input
                    type="number"
                    value={targetServings}
                    onChange={(e) => setTargetServings(e.target.value)}
                    placeholder="New servings"
                    min="1"
                    className="input"
                    style={{ width: '150px' }}
                    disabled={isScaling}
                  />
                  <button
                    onClick={handleScale}
                    disabled={isScaling || !targetServings}
                    className="btn btn-primary btn-sm"
                  >
                    {isScaling ? 'Scaling...' : 'Scale'}
                  </button>
                  <button
                    onClick={() => {
                      setShowScaleInput(false);
                      setTargetServings('');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {!openaiApiKey && (
                <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '5px' }}>
                  ⚠️ OpenAI API key required for scaling
                </p>
              )}
            </div>
          )}

          {/* Nutrition */}
          {displayRecipe.nutrition && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📊 Nutrition Information</h3>
              <div className={styles.nutritionGrid}>
                {nutritionItems.map(item => (
                  displayRecipe.nutrition[item.key] && (
                    <div key={item.key} className={styles.nutritionItem}>
                      <div className={styles.nutritionLabel}>{item.label}</div>
                      <div className={styles.nutritionValue}>
                        {formatNutritionValue(displayRecipe.nutrition[item.key], item.unit)}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>🛒 Ingredients</h3>
            <div className={styles.ingredients}>
              {displayRecipe.ingredients.split('\n').map((ingredient, index) => (
                <IngredientItem 
                  key={index} 
                  ingredient={ingredient}
                  openaiApiKey={openaiApiKey}
                  userId={userId}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>👩‍🍳 Instructions</h3>
            <div className={styles.instructions}>
              {displayRecipe.instructions}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {isShowingScaled && onSaveScaled && (
              <button
                onClick={handleSaveScaled}
                className="btn btn-primary"
              >
                💾 Save This Version
              </button>
            )}
            
            {!isShowingScaled && (
              <>
                <label className="btn btn-secondary">
                  📷 Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this recipe?')) {
                      onDelete(recipe.id);
                      onClose();
                    }
                  }}
                  className="btn btn-danger"
                >
                  🗑️ Delete Recipe
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;