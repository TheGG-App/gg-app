// src/shared/components/FilterBar.js - No icons, just styled text
import React from 'react';
import { BASIC_TAGS, COOKING_METHODS } from '../../features/recipes/utils/recipeUtils';

function FilterBar({
  searchTerm,
  setSearchTerm,
  filterCookTime,
  setFilterCookTime,
  filterTags,
  setFilterTags,
  onClearFilters,
  title = "Filter & Search",
  compact = false,
  filterMealType,
  setFilterMealType,
  mealTypes
}) {

  const hasActiveFilters = (filterCookTime && filterCookTime !== 'all') || 
    (filterMealType && filterMealType !== 'all') ||
    Object.values(filterTags || {}).some(value => value);

  return (
    <div style={{
      background: 'white',
      borderRadius: '15px',
      padding: compact ? '15px' : '25px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
      border: '1px solid #f0f0f0'
    }}>
      {/* Compact header with search bar in same row */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{
          margin: 0,
          color: '#1f2937',
          fontSize: '1.1rem',
          fontWeight: '700',
          fontFamily: 'Georgia, serif',
          flexShrink: 0
        }}>
          {title}
        </h3>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            fontSize: '0.9rem',
            outline: 'none',
            background: 'white',
            fontFamily: 'Georgia, serif',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Filters in one row */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Meal Type Filter (if provided) */}
        {mealTypes && setFilterMealType && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              Type:
            </span>
            <select
              value={filterMealType || 'all'}
              onChange={(e) => setFilterMealType(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                fontSize: '0.8rem',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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

        {/* Cook Time Filter - Text only */}
        {setFilterCookTime && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.85rem',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              Time:
            </span>
            {[
              { key: 'under15', label: '<15m' },
              { key: 'under30', label: '<30m' },
              { key: 'under60', label: '<1h' }
            ].map(timeOption => (
              <button
                key={timeOption.key}
                onClick={() => {
                  setFilterCookTime(filterCookTime === timeOption.key ? 'all' : timeOption.key);
                }}
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: filterCookTime === timeOption.key 
                    ? '#06b6d4' 
                    : 'white',
                  border: `2px solid ${filterCookTime === timeOption.key ? '#06b6d4' : '#e5e7eb'}`,
                  color: filterCookTime === timeOption.key ? 'white' : '#06b6d4',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  transition: 'all 0.2s ease'
                }}
              >
                {timeOption.label}
              </button>
            ))}
          </div>
        )}

        {/* Tags - Text only with color coding */}
        {setFilterTags && (
          <>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Tags:
              </span>
              {BASIC_TAGS.map(tag => (
                <button
                  key={tag.key}
                  onClick={() => {
                    setFilterTags(prev => ({
                      ...prev,
                      [tag.key]: !prev[tag.key]
                    }));
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: filterTags[tag.key] 
                      ? '#06b6d4' 
                      : 'white',
                    border: `2px solid ${filterTags[tag.key] ? '#06b6d4' : '#e5e7eb'}`,
                    color: filterTags[tag.key] ? 'white' : '#06b6d4',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Cooking Methods - Text only */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Method:
              </span>
              {COOKING_METHODS.map(method => (
                <button
                  key={method.key}
                  onClick={() => {
                    setFilterTags(prev => ({
                      ...prev,
                      [method.key]: !prev[method.key]
                    }));
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: filterTags[method.key] 
                      ? '#06b6d4' 
                      : 'white',
                    border: `2px solid ${filterTags[method.key] ? '#06b6d4' : '#e5e7eb'}`,
                    color: filterTags[method.key] ? 'white' : '#06b6d4',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              fontFamily: 'Georgia, serif',
              transition: 'all 0.2s ease'
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;