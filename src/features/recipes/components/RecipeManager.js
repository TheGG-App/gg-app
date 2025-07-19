// src/features/recipes/components/RecipeManager.js
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import VirtualizedRecipeGrid from './VirtualizedRecipeGrid';
import RecipeModal from './RecipeModal';

function RecipeManager() {
  const { user, isAdmin, isPrivileged } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openaiApiKey, setOpenaiApiKey] = useState(''); // Add if you use AI features

  // Subscribe to recipes collection
  useEffect(() => {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const recipesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(recipesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching recipes:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle recipe updates (privileged users only)
  const handleRecipeUpdate = async (recipeId, updates) => {
    if (!isPrivileged) {
      alert('You do not have permission to edit recipes.');
      return;
    }

    try {
      const recipeRef = doc(db, 'recipes', recipeId);
      await updateDoc(recipeRef, {
        ...updates,
        lastUpdatedBy: user.uid,
        lastUpdatedByEmail: user.email,
        lastUpdatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe. Please try again.');
    }
  };

  // Add new recipe (privileged users only)
  const handleAddRecipe = async () => {
    if (!isPrivileged) {
      alert('You do not have permission to add recipes.');
      return;
    }

    const newRecipe = {
      title: "New Recipe",
      image: "",
      cookTime: "30 mins",
      mealType: "Dinner",
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        servings: 4
      },
      tags: {},
      ingredients: "",
      instructions: "",
      createdBy: user.uid,
      createdByEmail: user.email,
      createdAt: new Date(),
      lastUpdatedAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'recipes'), newRecipe);
      console.log('Recipe created with ID:', docRef.id);
      // Open the new recipe for editing
      setSelectedRecipe({ id: docRef.id, ...newRecipe });
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please try again.');
    }
  };

  // Delete recipe (privileged users only)
  const handleDeleteRecipe = async (recipeId) => {
    if (!isPrivileged) {
      alert('You do not have permission to delete recipes.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  // Handle saving scaled recipes
  const handleSaveScaled = async (scaledRecipe) => {
    if (!isPrivileged) {
      alert('You do not have permission to save recipes.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'recipes'), {
        ...scaledRecipe,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: new Date(),
        lastUpdatedAt: new Date()
      });
      console.log('Scaled recipe saved with ID:', docRef.id);
    } catch (error) {
      console.error('Error saving scaled recipe:', error);
      alert('Failed to save scaled recipe. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with Add button for privileged users */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>
          {recipes.length} Recipes
          {!isPrivileged && <span style={{ fontSize: '0.8rem', color: '#6b7280', marginLeft: '10px' }}>
            (Read-Only Mode)
          </span>}
        </h2>
        
        {isPrivileged && (
          <button 
            onClick={handleAddRecipe}
            style={{
              padding: '10px 20px',
              background: '#06b6d4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            + Add Recipe
          </button>
        )}
      </div>

      {/* Recipe Grid */}
      <VirtualizedRecipeGrid
        recipes={recipes}
        onRecipeClick={setSelectedRecipe}
        onRecipeUpdate={isPrivileged ? handleRecipeUpdate : () => {}}
        containerHeight={window.innerHeight - 200}
      />

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onUpdate={isPrivileged ? handleRecipeUpdate : null}
          onDelete={isPrivileged ? handleDeleteRecipe : null}
          openaiApiKey={openaiApiKey}
          onSaveScaled={isPrivileged ? handleSaveScaled : null}
        />
      )}
    </div>
  );
}

export default RecipeManager;