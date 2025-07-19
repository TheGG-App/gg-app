// src/features/recipes/components/RecipeFilters.js - Refactored with CSS modules
import React from 'react';
import { BASIC_TAGS, COOKING_METHODS } from '../utils/recipeUtils';
import styles from './RecipeFilters.module.css';

function RecipeFilters({
  searchTerm,
  setSearchTerm,
  filterCookTime,
  setFilterCookTime,
  filterTags,
  setFilterTags,
  onClearFilters
}) {
  const handleTagChange = (tagKey, checked) => {
    setFilterTags(prev => ({
      ...prev,
      [tagKey]: checked
    }));
  };

  const hasActiveFilters = filterCookTime !== 'all' || 
    Object.values(filterTags).some(value => value);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        🔍 Filter & Search
      </h3>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search recipes by name, ingredients, or instructions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Cook Time Filter */}
      <div className={styles.filterSection}>
        <label className={styles.filterLabel}>
          Cook Time
        </label>
        <select
          value={filterCookTime}
          onChange={(e) => setFilterCookTime(e.target.value)}
          className={styles.cookTimeSelect}
        >
          <option value="all">All Cook Times</option>
          <option value="under15">Under 15 min</option>
          <option value="under30">Under 30 min</option>
          <option value="under60">Under 1 hour</option>
        </select>
      </div>

      {/* Tags Filter */}
      <div className={styles.filterSection}>
        <label className={styles.filterLabel}>
          Basic Tags
        </label>
        <div className={styles.tagsGrid}>
          {BASIC_TAGS.map(tag => (
            <button
              key={tag.key}
              onClick={() => handleTagChange(tag.key, !filterTags[tag.key])}
              className={`${styles.tagButton} ${styles.basicTag} ${filterTags[tag.key] ? styles.active : ''}`}
            >
              <span className={styles.tagIcon}>{tag.icon}</span>
              <span className={styles.tagLabel}>{tag.label}</span>
              {filterTags[tag.key] && <span className={styles.tagCheck}>✓</span>}
            </button>
          ))}
        </div>

        <label className={`${styles.filterLabel} ${styles.sectionTitle}`}>
          Cooking Methods
        </label>
        <div className={styles.tagsGrid}>
          {COOKING_METHODS.map(method => (
            <button
              key={method.key}
              onClick={() => handleTagChange(method.key, !filterTags[method.key])}
              className={`${styles.tagButton} ${styles.cookingMethod} ${filterTags[method.key] ? styles.active : ''}`}
            >
              <span className={styles.tagIcon}>{method.icon}</span>
              <span className={styles.tagLabel}>{method.label}</span>
              {filterTags[method.key] && <span className={styles.tagCheck}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className={styles.clearButton}
        >
          ✨ Clear All Filters
        </button>
      )}
    </div>
  );
}

export default RecipeFilters;