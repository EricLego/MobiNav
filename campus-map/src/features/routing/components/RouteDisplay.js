// src/components/RouteDisplay.js
import React, { useContext } from 'react';
import { RoutingContext } from '../context/RoutingContext';
import './RouteDisplay.css'; // We'll create this CSS file next

// Helper function to format duration (seconds to minutes/hours)
const formatDuration = (seconds) => {
  if (seconds < 60) {
    return '< 1 min';
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr ${remainingMinutes} min`;
};

// Helper function to format distance (meters to feet/miles)
const formatDistance = (meters) => {
  const feet = Math.round(meters * 3.28084);
  if (feet < 528) { // Less than 0.1 miles
    return `${feet} ft`;
  }
  const miles = (meters / 1609.34).toFixed(1);
  return `${miles} mi`;
};

// Helper to get a simple icon based on maneuver type (optional but nice)
const getManeuverIcon = (type) => {
    // Basic examples, you can expand this with actual icons (e.g., font awesome, svgs)
    if (type.includes('left')) return '←';
    if (type.includes('right')) return '→';
    if (type.includes('straight') || type.includes('continue')) return '↑';
    if (type.includes('arrive')) return '📍';
    if (type.includes('depart')) return '🏁';
    return '•'; // Default dot
};


const RouteDisplay = () => {
  const { route, isLoadingRoute, routeError, clearRoute } = useContext(RoutingContext);

  if (isLoadingRoute) {
    return <div className="route-display loading">Calculating route...</div>;
  }

  if (routeError) {
    return (
      <div className="route-display error">
        <p>Error calculating route: {routeError.message || 'Unknown error'}</p>
        <button onClick={clearRoute} className="clear-route-button">Try Again</button>
      </div>
    );
  }

  // Only render if we have a valid route object with geometry and summary
  if (!route || !route.geometry || !route.summary) {
    return null; // Don't show anything if there's no route yet
  }

  const { instructions = [], summary = {} } = route; // Default to empty array/object

  return (
    <div className="route-display">
      <div className="route-summary">
        <h3>Route Summary</h3>
        {summary.duration && summary.distance ? (
          <p>
            Estimated time: <strong>{formatDuration(summary.duration)}</strong> <br />
            Distance: <strong>{formatDistance(summary.distance)}</strong>
          </p>
        ) : (
          <p>Summary information not available.</p>
        )}
         <button onClick={clearRoute} className="clear-route-button small">Clear Route</button>
      </div>

      {instructions.length > 0 ? (
        <div className="route-instructions">
          <h3>Directions</h3>
          <ol>
            {instructions.map((step, index) => (
              <li key={index}>
                <span className="maneuver-icon">{getManeuverIcon(step.maneuver)}</span>
                <span className="instruction-text">{step.instruction}</span>
                {step.distance > 0 && ( // Only show distance if it's greater than 0
                    <span className="step-distance">({formatDistance(step.distance)})</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
         <p>Turn-by-turn directions not available for this route.</p>
      )}
    </div>
  );
};

export default RouteDisplay;
