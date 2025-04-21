// RoutePlanner.js
import React, { useState, useEffect } from 'react';
import RoutePointDisplay from './RoutePointDisplay';
import './RoutePlanner.css';
import SearchBar from '../../search/components/SearchBar';

const RoutePlanner = ({ 
  startPoint, 
  setStartPoint, 
  endPoint, 
  setEndPoint, 
  wheelchairMode, 
  setWheelchairMode, 
  mapRef, 
  handlePlaceSelect, 
  handleStartPointPlaceSelect, 
  handleEndPointPlaceSelect, 
  calculateRoute, 
  campusBoundary 
}) => {
  const [routeDetails, setRouteDetails] = useState(null);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  
  // Toggle wheelchair mode
  const toggleWheelchairMode = () => {
    setWheelchairMode(!wheelchairMode);
  };
  
  return (
    <div className="route-planner-overlay">
      {/* Search bar in top left */}
      <div className="search-overlay">
        <SearchBar>
          
        </SearchBar>
      </div>
      
      {/* Route display in top right */}
      <div className="route-display-overlay">
        <div className="route-points-container">
          <RoutePointDisplay 
            label="Starting Point" 
            point={startPoint ? startPoint.name || startPoint.displayName : 'Not selected'} 
            onClear={() => setStartPoint(null)} 
          />
          <RoutePointDisplay 
            label="Destination" 
            point={endPoint ? endPoint.name || endPoint.displayName : 'Not selected'} 
            onClear={() => setEndPoint(null)} 
          />
          
          <div className="route-options">
            <label className="wheelchair-toggle">
              <input 
                type="checkbox" 
                checked={wheelchairMode} 
                onChange={toggleWheelchairMode} 
              />
              Wheelchair-Accessible Only
            </label>
          </div>
        </div>
        
        {/* Route details pop-down */}
        {showRouteDetails && routeDetails && (
          <div className="route-details-popdown">
            <h4>Route Details</h4>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Distance</span>
                <span className="detail-value">{routeDetails.distance}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ETA</span>
                <span className="detail-value">{routeDetails.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Elevation Change</span>
                <span className="detail-value">{routeDetails.elevationChange}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Accessibility</span>
                <span className="detail-value">{routeDetails.accessibility}</span>
              </div>
            </div>
            <button className="directions-button">
              Get Step-by-Step Directions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutePlanner;