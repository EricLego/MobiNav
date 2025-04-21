// RoutePointDisplay.js
import React from 'react';

const RoutePointDisplay = ({ label, point, onClear }) => {
  return (
    <div className="route-point-display">
      <div className="route-point-label">{label}</div>
      <div className="route-point-value">
        {point || <span className="placeholder">Not selected</span>}
        {point && (
          <button 
            className="clear-button" 
            onClick={onClear} 
            aria-label={`Clear ${label}`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default RoutePointDisplay;