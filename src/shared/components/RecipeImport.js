// src/shared/components/RecipeImport.js
import React, { useState } from 'react';
import { parseRecipeFromUrl, parseRecipeFromText } from '../utils/aiHelpers';

function RecipeImport({ setCurrentView, openaiApiKey, onRecipeParsed }) {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [isParsingUrl, setIsParsingUrl] = useState(false);
  const [isParsingText, setIsParsingText] = useState(false);

  const handleUrlParse = async () => {
    if (!recipeUrl.trim()) {
      alert('Please enter a recipe URL, babe! 💅');
      return;
    }

    if (!openaiApiKey) {
      alert('AI key needed for this magic! ✨');
      return;
    }

    setIsParsingUrl(true);
    try {
      const parsedRecipe = await parseRecipeFromUrl(recipeUrl, openaiApiKey);
      onRecipeParsed(parsedRecipe);
      setRecipeUrl('');
      alert('Recipe parsed successfully! ✨');
    } catch (error) {
      alert('Error parsing recipe: ' + error.message);
    } finally {
      setIsParsingUrl(false);
    }
  };

  const handleTextParse = async () => {
    if (!openaiApiKey) {
      alert('AI key needed for this magic! ✨');
      return;
    }

    const recipeText = window.prompt('Paste your recipe text here, gorgeous:');
    if (!recipeText?.trim()) return;

    setIsParsingText(true);
    try {
      const parsedRecipe = await parseRecipeFromText(recipeText, openaiApiKey);
      onRecipeParsed(parsedRecipe);
      alert('Recipe parsed successfully! ✨');
    } catch (error) {
      alert('Error parsing recipe text: ' + error.message);
    } finally {
      setIsParsingText(false);
    }
  };

  const isLoading = isParsingUrl || isParsingText;

  return (
    <div className="feature-card">
      {/* Back Button */}
      <button
        onClick={() => setCurrentView('home')}
        style={{
          background: 'rgba(139, 90, 60, 0.1)',
          border: '2px solid var(--brown-dark)',
          color: 'var(--brown-dark)',
          padding: '10px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.9rem',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'var(--brown-dark)';
          e.target.style.color = 'white';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(139, 90, 60, 0.1)';
          e.target.style.color = 'var(--brown-dark)';
        }}
      >
        ← Back to Home
      </button>

      <h2 className="feature-title">🤖 AI Recipe Import (Slay Queen!)</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
        {/* URL Method */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(221, 160, 221, 0.3) 100%)',
          borderRadius: '15px',
          padding: '25px',
          border: '2px solid rgba(139, 69, 19, 0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: 'var(--brown-dark)',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            🔗 From URL
          </h3>
          <p style={{ 
            margin: '0 0 20px 0', 
            color: 'var(--text-dark)', 
            fontSize: '1rem',
            lineHeight: '1.4'
          }}>
            Paste any recipe URL and watch the magic happen:
          </p>
          
          <input
            type="url"
            placeholder="https://recipe-url.com"
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid rgba(139, 69, 19, 0.3)',
              marginBottom: '20px',
              outline: 'none',
              background: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
          
          <button 
            onClick={handleUrlParse} 
            disabled={isLoading || !recipeUrl.trim() || !openaiApiKey}
            style={{
              width: '100%',
              background: isLoading || !recipeUrl.trim() || !openaiApiKey
                ? '#9ca3af' 
                : 'linear-gradient(135deg, var(--brown-dark) 0%, var(--brown-medium) 100%)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              cursor: isLoading || !recipeUrl.trim() || !openaiApiKey ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: isLoading || !recipeUrl.trim() || !openaiApiKey
                ? 'none' 
                : '0 4px 15px rgba(139, 69, 19, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isParsingUrl ? '🔄 Parsing Recipe...' : '✨ Parse Recipe'}
          </button>
        </div>

        {/* Text Method */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(221, 160, 221, 0.3) 0%, rgba(255, 182, 193, 0.3) 100%)',
          borderRadius: '15px',
          padding: '25px',
          border: '2px solid rgba(139, 69, 19, 0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: 'var(--brown-dark)',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            📝 From Text
          </h3>
          <p style={{ 
            margin: '0 0 20px 0', 
            color: 'var(--text-dark)', 
            fontSize: '1rem',
            lineHeight: '1.4'
          }}>
            Copy and paste recipe text directly:
          </p>
          
          <div style={{ 
            marginBottom: '20px', 
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              padding: '15px',
              borderRadius: '12px',
              border: '2px dashed rgba(139, 69, 19, 0.3)',
              background: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              color: 'var(--text-dark)',
              fontSize: '1rem',
              fontStyle: 'italic',
              width: '100%'
            }}>
              Click below to paste your recipe text ✨
            </div>
          </div>
          
          <button 
            onClick={handleTextParse}
            disabled={isLoading || !openaiApiKey}
            style={{
              width: '100%',
              background: isLoading || !openaiApiKey
                ? '#9ca3af' 
                : 'linear-gradient(135deg, var(--plum) 0%, var(--pink) 100%)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '12px',
              cursor: isLoading || !openaiApiKey ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              boxShadow: isLoading || !openaiApiKey
                ? 'none' 
                : '0 4px 15px rgba(221, 160, 221, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {isParsingText ? '🔄 Parsing Text...' : '💅 Parse from Text'}
          </button>
        </div>
      </div>

      {/* API Key Warning */}
      {!openaiApiKey && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.4) 0%, rgba(221, 160, 221, 0.4) 100%)',
          border: '2px solid rgba(139, 69, 19, 0.3)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--brown-dark)' }}>
            🔑 AI Setup Required
          </h4>
          <p style={{ margin: 0, color: 'var(--text-dark)' }}>
            Add your OpenAI API key to unlock the recipe parsing magic! ✨
          </p>
        </div>
      )}

      {/* Tips */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(221, 160, 221, 0.1) 100%)',
        borderRadius: '15px',
        padding: '20px',
        border: '1px solid rgba(139, 69, 19, 0.1)'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: 'var(--brown-dark)', fontSize: '1.1rem' }}>
          💡 Pro Tips:
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px', 
          color: 'var(--text-dark)', 
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          <li>Works best with popular recipe sites like AllRecipes, Food Network, BBC Good Food</li>
          <li>For text parsing, include the recipe title, ingredients, and instructions</li>
          <li>AI will estimate nutrition info if not provided in the original recipe</li>
          <li>Each parse costs ~$0.01-0.05 with your OpenAI API key</li>
          <li>Parsed recipes are automatically saved to your collection! 🎉</li>
        </ul>
      </div>
    </div>
  );
}

export default RecipeImport;