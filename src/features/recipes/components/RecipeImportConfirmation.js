// src/features/recipes/components/VirtualizedRecipeGrid.js - Refactored with CSS modules
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import styles from './VirtualizedRecipeGrid.module.css';

// Import the refactored OptimizedRecipeCard component (shown above)
import OptimizedRecipeCard from './OptimizedRecipeCard';

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
            <div className={styles.loadingCell}>
              <div className={styles.loadingContent}>
                <div className={styles.spinner} />
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
      className={styles.container}
      style={{ height: containerHeight }}
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

export default VirtualizedRecipeGrid;