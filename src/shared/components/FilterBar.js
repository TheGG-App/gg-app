// src/shared/components/FilterBar.js - Complete rewrite that actually works
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
  title = "Filter & Search"
}) {
  
  const handleTagToggle = (tagKey) => {
    setFilterTags(prev => ({
      ...prev,
      [tagKey]: !prev[tagKey]
    }));
  };

  const hasActiveFilters = filterCookTime !== 'all' || 
    Object.values(filterTags).some(value => value);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '25px',
      marginBottom: '25px',
      boxShadow: '0 4px 15px rgba(139, 90, 60, 0.1)',
      border: '2px solid #EEB182'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        color: '#8B5A3C',
        fontSize: '1.3rem',
        fontWeight: '700',
        fontFamily: 'Georgia, serif'
      }}>
        🔍 {title}
      </h3>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search recipes by name, ingredients, or instructions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '2px solid #8B5A3C',
            fontSize: '1rem',
            outline: 'none',
            background: 'white',
            fontFamily: 'Georgia, serif',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Cook Time Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: '#8B5A3C',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          Cook Time
        </label>
        <select
          value={filterCookTime}
          onChange={(e) => setFilterCookTime(e.target.value)}
          style={{
            width: '200px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '2px solid #8B5A3C',
            outline: 'none',
            background: 'white',
            fontFamily: 'Georgia, serif',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Cook Times</option>
          <option value="under15">Under 15 min</option>
          <option value="under30">Under 30 min</option>
          <option value="under60">Under 1 hour</option>
        </select>
      </div>

      {/* Basic Tags Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          color: '#8B5A3C',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          Basic Tags
        </label>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '15px'
        }}>
          {BASIC_TAGS.map(tag => (
            <button
              key={tag.key}
              onClick={() => handleTagToggle(tag.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '10px 15px',
                borderRadius: '12px',
                background: filterTags[tag.key] 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                  : 'rgba(139, 90, 60, 0.05)',
                border: `2px solid ${filterTags[tag.key] ? '#22c55e' : '#8B5A3C'}`,
                color: filterTags[tag.key] ? 'white' : '#8B5A3C',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: filterTags[tag.key] ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!filterTags[tag.key]) {
                  e.target.style.background = 'rgba(139, 90, 60, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!filterTags[tag.key]) {
                  e.target.style.background = 'rgba(139, 90, 60, 0.05)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{tag.icon}</span>
              <span>{tag.label}</span>
              {filterTags[tag.key] && <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Cooking Methods Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          color: '#BF5B4B',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          Cooking Methods
        </label>
        <div style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {COOKING_METHODS.map(method => (
            <button
              key={method.key}
              onClick={() => handleTagToggle(method.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '10px 15px',
                borderRadius: '12px',
                background: filterTags[method.key] 
                  ? 'linear-gradient(135deg, #BF5B4B 0%, #991b1b 100%)' 
                  : 'rgba(191, 91, 75, 0.05)',
                border: `2px solid ${filterTags[method.key] ? '#BF5B4B' : '#BF5B4B'}`,
                color: filterTags[method.key] ? 'white' : '#BF5B4B',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: filterTags[method.key] ? '0 4px 15px rgba(191, 91, 75, 0.3)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!filterTags[method.key]) {
                  e.target.style.background = 'rgba(191, 91, 75, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!filterTags[method.key]) {
                  e.target.style.background = 'rgba(191, 91, 75, 0.05)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{method.icon}</span>
              <span>{method.label}</span>
              {filterTags[method.key] && <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <button
            onClick={onClearFilters}
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              fontFamily: 'Georgia, serif',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #4b5563 0%, #374151 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)';
            }}
          >
            ✨ Clear All Filters
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: 'linear-gradient(135deg, rgba(139, 90, 60, 0.05) 0%, rgba(238, 177, 130, 0.1) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(139, 90, 60, 0.2)'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#8B5A3C', 
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Active Filters:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterCookTime !== 'all' && (
              <span style={{ 
                padding: '4px 8px',
                background: '#8B5A3C',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {filterCookTime === 'under15' ? 'Under 15 min' :
                 filterCookTime === 'under30' ? 'Under 30 min' :
                 filterCookTime === 'under60' ? 'Under 1 hour' : filterCookTime}
              </span>
            )}
            {BASIC_TAGS.filter(tag => filterTags[tag.key]).map(tag => (
              <span key={tag.key} style={{ 
                padding: '4px 8px',
                background: '#22c55e',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {tag.icon} {tag.label}
              </span>
            ))}
            {COOKING_METHODS.filter(method => filterTags[method.key]).map(method => (
              <span key={method.key} style={{ 
                padding: '4px 8px',
                background: '#BF5B4B',
                color: 'white',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {method.icon} {method.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;