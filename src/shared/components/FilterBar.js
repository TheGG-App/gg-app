import React from 'react';

function FilterBar({ 
  filterMealType, 
  setFilterMealType, 
  filterTags, 
  setFilterTags, 
  mealTypes, 
  title = "Filter Recipes" 
}) {
  
  const handleTagFilter = (tagName, value) => {
    setFilterTags(prev => ({ ...prev, [tagName]: value }));
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(139, 69, 19, 0.1)',
      border: '1px solid rgba(255, 182, 193, 0.3)'
    }}>
      <h3 style={{ 
        margin: '0 0 15px 0', 
        color: 'var(--brown-dark)', 
        fontSize: '1.3rem',
        fontWeight: '700'
      }}>
        🔍 {title}
      </h3>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center', 
        flexWrap: 'wrap' 
      }}>
        {/* Meal Type Filter */}
        <select
          value={filterMealType}
          onChange={(e) => setFilterMealType(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '10px',
            border: '2px solid rgba(139, 69, 19, 0.3)',
            outline: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '600',
            color: 'var(--brown-dark)',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Types</option>
          {mealTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        
        {/* Family Approved Filter */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          background: filterTags.familyApproved ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
          border: filterTags.familyApproved ? '2px solid #22c55e' : '2px solid transparent',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="checkbox"
            checked={filterTags.familyApproved}
            onChange={(e) => handleTagFilter('familyApproved', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <span style={{ 
            color: 'var(--brown-dark)', 
            fontWeight: '600',
            fontSize: '14px'
          }}>
            👨‍👩‍👧‍👦 Family Approved Only
          </span>
        </label>
        
        {/* Meal Prep Filter */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          background: filterTags.mealPrep ? 'rgba(221, 160, 221, 0.1)' : 'transparent',
          border: filterTags.mealPrep ? '2px solid var(--plum)' : '2px solid transparent',
          transition: 'all 0.2s ease'
        }}>
          <input
            type="checkbox"
            checked={filterTags.mealPrep}
            onChange={(e) => handleTagFilter('mealPrep', e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <span style={{ 
            color: 'var(--brown-dark)', 
            fontWeight: '600',
            fontSize: '14px'
          }}>
            🥘 Meal Prep Only
          </span>
        </label>

        {/* Clear Filters Button */}
        {(filterMealType !== 'all' || filterTags.familyApproved || filterTags.mealPrep) && (
          <button
            onClick={() => {
              setFilterMealType('all');
              setFilterTags({ familyApproved: false, mealPrep: false });
            }}
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ✨ Clear Filters
          </button>
        )}
      </div>
      
      {/* Active Filters Display */}
      {(filterMealType !== 'all' || filterTags.familyApproved || filterTags.mealPrep) && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: 'linear-gradient(135deg, rgba(255, 182, 193, 0.1) 0%, rgba(221, 160, 221, 0.1) 100%)',
          borderRadius: '8px',
          border: '1px solid rgba(139, 69, 19, 0.1)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dark)', fontWeight: '600' }}>
            Active filters: 
            {filterMealType !== 'all' && (
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px',
                background: 'var(--brown-dark)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                {filterMealType}
              </span>
            )}
            {filterTags.familyApproved && (
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px',
                background: '#22c55e',
                color: 'white',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                Family Approved
              </span>
            )}
            {filterTags.mealPrep && (
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px',
                background: 'var(--plum)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '11px'
              }}>
                Meal Prep
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;