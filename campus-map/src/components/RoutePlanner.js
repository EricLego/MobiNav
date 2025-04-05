// RoutePlanner.js
import React, { useState, useEffect } from 'react';
import BuildingAutocomplete from './BuildingAutocomplete';
import RoutePointDisplay from './RoutePointDisplay';
import '../styles/RoutePlanner.css';

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
  
  // Calculate route details automatically when both points are selected
  useEffect(() => {
    if (startPoint && endPoint) {
      calculateRouteWithDetails();
    } else {
      setShowRouteDetails(false);
      setRouteDetails(null);
    }
  }, [startPoint, endPoint, wheelchairMode]);
  
  // Mock function to calculate route details - in production, this would use real data
  const calculateRouteWithDetails = () => {
    // Call the existing calculateRoute function
    calculateRoute();
    
    // Generate some mock route details
    const mockDetails = {
      distance: `${(Math.random() * 2 + 0.1).toFixed(1)} km`,
      duration: `${Math.floor(Math.random() * 20 + 5)} min`,
      elevationChange: `${Math.floor(Math.random() * 10)} m`,
      accessibility: wheelchairMode ? 'Fully accessible' : 'Standard route'
    };
    
    setRouteDetails(mockDetails);
    setShowRouteDetails(true);
  };
  
  return (
    <div className="route-planner-overlay">
      {/* Search bar in top left */}
      <div className="search-overlay">
        <BuildingAutocomplete 
          onPlaceSelect={handlePlaceSelect} 
          mapRef={mapRef} 
          restrictToCampus={true} 
          campusBoundary={campusBoundary} 
          placeholder="Search for a location..." 
        />
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