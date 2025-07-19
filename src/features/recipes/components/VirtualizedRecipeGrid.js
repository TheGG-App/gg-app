// src/features/recipes/components/VirtualizedRecipeGrid.js - Virtual scrolling for recipes
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import CompactSquareRecipeCard from './CompactSquareRecipeCard';
import OptimizedImage from '../../../shared/components/OptimizedImage';

function VirtualizedRecipeGrid({ 
  recipes, 
  onRecipeClick, 
  onRecipeUpdate,
  containerHeight = window.innerHeight - 200, // Account for header/navigation
  hasMore = false,
  loadMore = () => {},
  isLoading = false
}) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    columns: 1,
    columnWidth: 300,
    rowHeight: 420
  });
  
  const gridRef = useRef();
  const containerRef = useRef();

  // Calculate grid dimensions based on container width
  const calculateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
    const padding = 40; // Total horizontal padding
    const gap = 25; // Gap between items
    const minItemWidth = 300;
    
    // Calculate number of columns that fit
    const availableWidth = containerWidth - padding;
    const columns = Math.max(1, Math.floor((availableWidth + gap) / (minItemWidth + gap)));
    const columnWidth = (availableWidth - (gap * (columns - 1))) / columns;
    
    // Adjust row height based on column width to maintain aspect ratio
    const imageAspectRatio = 3/2;
    const contentHeight = 220; // Approximate height of content below image
    const imageHeight = columnWidth / imageAspectRatio;
    const rowHeight = imageHeight + contentHeight;
    
    setDimensions({
      width: containerWidth,
      columns,
      columnWidth,
      rowHeight
    });
  }, []);

  // Handle window resize
  useEffect(() => {
    calculateDimensions();
    
    const handleResize = () => {
      calculateDimensions();
      // Reset grid cache when dimensions change
      if (gridRef.current) {
        gridRef.current.resetAfterIndices({
          columnIndex: 0,
          rowIndex: 0
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateDimensions]);

  // Calculate total rows
  const rowCount = Math.ceil(recipes.length / dimensions.columns);
  const itemCount = hasMore ? recipes.length + 1 : recipes.length;

  // Check if item is loaded
  const isItemLoaded = (index) => !hasMore || index < recipes.length;

  // Load more items
  const loadMoreItems = isLoading ? () => {} : loadMore;

  // Get item data by index
  const getItemData = (rowIndex, columnIndex) => {
    const index = rowIndex * dimensions.columns + columnIndex;
    if (index >= recipes.length) return null;
    return recipes[index];
  };

  // Cell renderer
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const recipe = getItemData(rowIndex, columnIndex);
    
    if (!recipe) {
      // Empty cell or loading state
      if (hasMore && rowIndex === rowCount - 1 && columnIndex === 0) {
        return (
          <div style={style}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: '1rem',
              color: '#6b7280'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto 10px',
                  borderRadius: '50%',
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#06b6d4',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Loading more recipes...
              </div>
            </div>
          </div>
        );
      }
      return null;
    }

    // Calculate actual position with gap
    const gap = 25;
    const actualStyle = {
      ...style,
      left: style.left + (columnIndex * gap),
      top: style.top + (rowIndex * gap),
      width: dimensions.columnWidth,
      height: dimensions.rowHeight - gap,
      padding: 0
    };

    return (
      <div style={actualStyle}>
        <OptimizedRecipeCard
          recipe={recipe}
          onClick={onRecipeClick}
          onUpdate={onRecipeUpdate}
        />
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: containerHeight,
        position: 'relative'
      }}
    >
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered }) => (
          <Grid
            ref={gridRef}
            columnCount={dimensions.columns}
            columnWidth={() => dimensions.columnWidth + 25} // Add gap
            height={containerHeight}
            rowCount={rowCount}
            rowHeight={() => dimensions.rowHeight}
            width={dimensions.width}
            onItemsRendered={({
              visibleRowStartIndex,
              visibleRowStopIndex,
              visibleColumnStartIndex,
              visibleColumnStopIndex,
            }) => {
              // Convert grid coordinates to flat list indices
              const visibleStartIndex = visibleRowStartIndex * dimensions.columns + visibleColumnStartIndex;
              const visibleStopIndex = visibleRowStopIndex * dimensions.columns + visibleColumnStopIndex;
              
              onItemsRendered({
                visibleStartIndex,
                visibleStopIndex
              });
            }}
            overscanRowCount={2} // Render 2 extra rows outside viewport
            overscanColumnCount={1} // Render 1 extra column outside viewport
          >
            {Cell}
          </Grid>
        )}
      </InfiniteLoader>
    </div>
  );
}

// Optimized Recipe Card with image lazy loading
function OptimizedRecipeCard({ recipe, onClick, onUpdate }) {
  const [showTagMenu, setShowTagMenu] = useState(false);
  const { tags = {}, nutrition = {} } = recipe;

  // Import tag constants from utils
  const BASIC_TAGS = [
    { key: 'familyApproved', label: '👨‍👩‍👧‍👦 Family', color: '#8b4513' },
    { key: 'mealPrep', label: '📦 Prep', color: '#06b6d4' }
  ];

  const COOKING_METHODS = [
    { key: 'grill', label: '🔥 Grill' },
    { key: 'bake', label: '🥧 Bake' },
    { key: 'stove', label: '🍳 Stove' },
    { key: 'slowCooker', label: '🥘 Slow' },
    { key: 'microwave', label: '📡 Micro' }
  ];

  const activeTags = [
    ...BASIC_TAGS.filter(tag => tags[tag.key]).map(tag => ({ ...tag, type: 'basic' })),
    ...COOKING_METHODS.filter(method => tags[method.key]).map(method => ({ ...method, type: 'method' }))
  ];

  const handleClick = (e) => {
    if (!e.target.closest('.tag-menu-container')) {
      onClick(recipe);
    }
  };

  const handleTagClick = (e) => {
    e.stopPropagation();
    setShowTagMenu(!showTagMenu);
  };

  const updateTag = (key, value) => {
    onUpdate(recipe.id, { tags: { ...tags, [key]: value } });
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
      }}
    >
      {/* Optimized Image */}
      <OptimizedImage
        src={recipe.image}
        alt={recipe.title}
        aspectRatio="3:2"
        placeholder="🍽️"
        priority={false}
      />

      {/* Content */}
      <div style={{
        padding: '20px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Title */}
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1f2937',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {recipe.title}
        </h3>

        {/* Time and Servings */}
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '0.85rem',
          color: '#6b7280',
          marginBottom: '12px'
        }}>
          <span>⏱️ {recipe.cookTime || 'Unknown'}</span>
          <span>🍽️ {nutrition.servings || '?'} servings</span>
        </div>

        {/* Nutrition */}
        {(nutrition.calories || nutrition.protein) && (
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '12px',
            border: '2px solid #06b6d4',
            boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              {nutrition.calories && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {Math.round(nutrition.calories)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#1f2937', fontWeight: '600' }}>
                    calories
                  </div>
                </div>
              )}
              {nutrition.protein && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#06b6d4' }}>
                    {Math.round(nutrition.protein)}g
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#1f2937', fontWeight: '600' }}>
                    protein
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          flexWrap: 'wrap', 
          alignItems: 'center',
          marginTop: 'auto'
        }}>
          {activeTags.map((tag, index) => (
            <span key={`${tag.key}-${index}`} style={{
              background: tag.type === 'basic' ? tag.color : '#06b6d4',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {tag.label}
            </span>
          ))}
          
          <button
            className="tag-menu-container"
            onClick={handleTagClick}
            style={{
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: activeTags.length > 0 ? 'auto' : '0'
            }}
          >
            +
          </button>

          {/* Tag menu - simplified for performance */}
          {showTagMenu && (
            <div
              className="tag-menu-container"
              style={{
                position: 'absolute',
                bottom: '60px',
                right: '20px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                zIndex: 10,
                minWidth: '200px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px' }}>
                Quick Tags
              </div>
              {[...BASIC_TAGS, ...COOKING_METHODS].map(tag => (
                <label
                  key={tag.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 0',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tags[tag.key] || false}
                    onChange={(e) => updateTag(tag.key, e.target.checked)}
                    style={{ accentColor: '#06b6d4' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>{tag.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VirtualizedRecipeGrid;