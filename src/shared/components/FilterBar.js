// src/shared/components/FilterBar.js
import React from 'react';
import { BASIC_TAGS } from '../../features/recipes/utils/recipeUtils';
import styles from './FilterBar.module.css';

const COOK_TIME_OPTIONS = [
  { value: 'all', label: 'Any Time' },
  { value: '30', label: 'Under 30 min' },
  { value: '60', label: 'Under 1 hour' },
  { value: '120', label: 'Under 2 hours' }
];

function FilterBar({
  searchTerm,
  setSearchTerm,
  filterCookTime = 'all',
  setFilterCookTime,
  filterTags = {},
  setFilterTags,
  onClearFilters,
  title = "Filter & Search",
  compact = false,
  filterMealType,
  setFilterMealType,
  mealTypes = []
}) {
  
  const hasActiveFilters = (
    (filterCookTime && filterCookTime !== 'all') ||
    (filterMealType && filterMealType !== 'all') ||
    Object.values(filterTags).some(value => value)
  );

  const handleTagChange = (tagKey, checked) => {
    setFilterTags(prev => ({
      ...prev,
      [tagKey]: checked
    }));
  };

  const handleClear = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Default clear behavior
      setSearchTerm('');
      setFilterCookTime?.('all');
      setFilterMealType?.('all');
      setFilterTags({});
    }
  };

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {/* Header with Search */}
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`input ${styles.searchInput}`}
        />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {/* Meal Type Filter */}
        {mealTypes.length > 0 && setFilterMealType && (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type:</span>
            <select
              value={filterMealType || 'all'}
              onChange={(e) => setFilterMealType(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Types</option>
              {mealTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Cook Time Filter */}
        {setFilterCookTime && (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Time:</span>
            <select
              value={filterCookTime}
              onChange={(e) => setFilterCookTime(e.target.value)}
              className={styles.select}
            >
              {COOK_TIME_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tag Filters */}
        <div className={styles.tagFilters}>
          {BASIC_TAGS.map(tag => (
            <label key={tag.key} className={styles.tagLabel}>
              <input
                type="checkbox"
                checked={filterTags[tag.key] || false}
                onChange={(e) => handleTagChange(tag.key, e.target.checked)}
                className={styles.checkbox}
              />
              <span>{tag.label} {tag.icon}</span>
            </label>
          ))}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className={`${styles.clearButton} ${styles.active}`}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;