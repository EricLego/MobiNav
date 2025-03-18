import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, Polygon } from '@react-google-maps/api';
import { AccessibilityContext } from '../App';
import Header from './Header';
import Footer from './Footer';
import '../styles/InteractiveMap.css';

const InteractiveMap = () => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [route, setRoute] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [backendObstacles, setBackendObstacles] = useState([]);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState([]);
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [googleMapsError, setGoogleMapsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };
  
  const center = {
    lat: 33.9386, // KSU Marietta Campus (center point of the polygon)
    lng: -84.5187,
  };
  
  // KSU Marietta Campus boundary polygon
  const campusBoundary = [
    { lat: 33.940912, lng: -84.524504 }, // NW
    { lat: 33.941486, lng: -84.515582 }, // NE
    { lat: 33.935908, lng: -84.512786 }, // SE
    { lat: 33.935673, lng: -84.524473 }, // SW
    { lat: 33.940912, lng: -84.524504 }, // NW (close the polygon)
  ];

  const campusLocations = [
    { id: 1, name: 'Engineering Building', lat: 33.942, lng: -84.521, type: 'building', hasElevator: true },
    { id: 2, name: 'Student Center', lat: 33.939, lng: -84.518, type: 'building', hasElevator: true },
    { id: 3, name: 'Library', lat: 33.941, lng: -84.517, type: 'building', hasElevator: true },
    { id: 4, name: 'Parking Deck A', lat: 33.943, lng: -84.520, type: 'parking', hasElevator: true },
    { id: 5, name: 'Bus Stop', lat: 33.938, lng: -84.519, type: 'transportation' },
    // Add more campus locations as needed
  ];

  // Fetch obstacles from backend API
  useEffect(() => {
    const fetchObstacles = async () => {
      try {
        const response = await fetch('/api/obstacles');
        const data = await response.json();
        
        if (data.obstacles) {
          setBackendObstacles(data.obstacles);
        }
      } catch (error) {
        console.error("Failed to fetch obstacles:", error);
        // If API fails, use mock data as fallback
        const mockObstacles = [
          { id: 1, location: 'Engineering Building Elevator', latitude: 33.942, longitude: -84.521, obstacle_type: 'elevator', description: 'Out of Service', reported_at: '2025-03-15' },
          { id: 2, location: 'Path near Student Center', latitude: 33.940, longitude: -84.518, obstacle_type: 'construction', description: 'Under Construction', reported_at: '2025-03-16' },
        ];
        
        setBackendObstacles(mockObstacles);
      }
    };
    
    // Fetch accessibility features
    const fetchAccessibilityFeatures = async () => {
      try {
        const response = await fetch('/api/accessibility_features');
        const data = await response.json();
        
        if (data.features) {
          setAccessibilityFeatures(data.features);
        }
      } catch (error) {
        console.error("Failed to fetch accessibility features:", error);
      }
    };
    
    fetchObstacles();
    fetchAccessibilityFeatures();
  }, []);

  // Check for Google Maps API errors
  useEffect(() => {
    // Listen for Google Maps API errors
    const checkGoogleMapsError = () => {
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (script) {
        script.onerror = () => {
          console.error('Google Maps API failed to load');
          setGoogleMapsError(true);
        };
      }
    };
    
    // Check if API key is empty or very short (invalid)
    if (!apiKey || apiKey.length < 10) {
      setGoogleMapsError(true);
    } else {
      checkGoogleMapsError();
      
      // Also set a timeout to detect loading issues
      const timeout = setTimeout(() => {
        // If Google Maps is not loaded after 5 seconds, show the placeholder
        if (!window.google || !window.google.maps) {
          console.error('Google Maps API failed to load within timeout');
          setGoogleMapsError(true);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [apiKey]);

  // Function to handle map load
  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  // Function to handle marker click
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  // Function to handle location selection for route planning
  const handleStartPointSelect = (location) => {
    setStartPoint(location.name);
    setSelectedLocation(null);
  };

  const handleEndPointSelect = (location) => {
    setEndPoint(location.name);
    setSelectedLocation(null);
  };

  // Function to calculate route using backend API
  const calculateRoute = async () => {
    // Find selected locations
    const start = campusLocations.find(loc => loc.name === startPoint);
    const end = campusLocations.find(loc => loc.name === endPoint);
    
    if (!start || !end) {
      alert('Please select valid start and end points');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the backend API with wheelchair parameter
      const response = await fetch(
        `/api/get_route?start=${start.lat},${start.lng}&end=${end.lat},${end.lng}&wheelchair=${wheelchairMode}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Route API Error:', data.error);
        alert(`Error calculating route: ${data.error}`);
        return;
      }
      
      // Format the route data from the API (array of [lat, lng] tuples)
      // to the format expected by Google Maps (array of {lat, lng} objects)
      if (Array.isArray(data.route)) {
        const formattedRoute = data.route.map(point => {
          // Handle both formats: [lat, lng] array or {error: "..."} object
          if (Array.isArray(point)) {
            return { lat: point[0], lng: point[1] };
          }
          return null;
        }).filter(point => point !== null);
        
        setRoute(formattedRoute);
        
        // If we got a route, center the map on the starting point
        if (formattedRoute.length > 0 && map) {
          map.panTo(formattedRoute[0]);
          map.setZoom(17);
        }
      } else {
        console.error('Invalid route data format:', data.route);
        alert('Error: Received invalid route data from server');
      }
    } catch (error) {
      console.error('Failed to fetch route:', error);
      alert('Failed to calculate route. Please try again.');
      
      // Fallback to mock route for demo
      const mockRoute = [
        { lat: start.lat, lng: start.lng },
        { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 - 0.001 },
        { lat: end.lat, lng: end.lng }
      ];
      
      setRoute(mockRoute);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic would go here - filter locations, etc.
    console.log('Searching for:', searchQuery);
    
    const searchResults = campusLocations.filter(
      location => location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (searchResults.length > 0) {
      // Center the map on the first result
      if (map) {
        map.panTo({ lat: searchResults[0].lat, lng: searchResults[0].lng });
        map.setZoom(18);
      }
    }
  };

  // Function to toggle wheelchair mode
  const toggleWheelchairMode = () => {
    setWheelchairMode(!wheelchairMode);
    // If we already have a route, recalculate it with the new setting
    if (route.length > 0) {
      calculateRoute();
    }
  };

  const { accessibilitySettings } = useContext(AccessibilityContext);
  
  return (
    <div className={`page-container ${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
      <Header />
      <div className="interactive-map">
        <div className="map-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for campus locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        
        <div className="route-planner">
          <h3>Plan Your Route</h3>
          <div className="route-inputs">
            <select 
              value={startPoint} 
              onChange={(e) => setStartPoint(e.target.value)}
              className="route-select"
            >
              <option value="">Starting Point</option>
              {campusLocations.map(location => (
                <option key={location.id} value={location.name}>{location.name}</option>
              ))}
            </select>
            
            <select 
              value={endPoint} 
              onChange={(e) => setEndPoint(e.target.value)}
              className="route-select"
            >
              <option value="">Destination</option>
              {campusLocations.map(location => (
                <option key={location.id} value={location.name}>{location.name}</option>
              ))}
            </select>
          </div>
          
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
          
          <button 
            onClick={calculateRoute} 
            className="calculate-button"
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate Route'}
          </button>
        </div>
      </div>
      
      <div className="map-container">
        {googleMapsError ? (
          <div className="map-placeholder">
            <div className="map-placeholder-content">
              <h3>Interactive Campus Map</h3>
              <p>There was an error loading the Google Maps API. Please check your API key and try again.</p>
              <div className="mock-map">
                <div className="mock-location" style={{top: '30%', left: '40%'}}>Engineering Building</div>
                <div className="mock-location" style={{top: '50%', left: '60%'}}>Student Center</div>
                <div className="mock-location" style={{top: '40%', left: '70%'}}>Library</div>
                <div className="mock-location" style={{top: '20%', left: '45%'}}>Parking Deck A</div>
                <div className="mock-location" style={{top: '60%', left: '55%'}}>Bus Stop</div>
              </div>
            </div>
          </div>
        ) : (
          <LoadScript 
            googleMapsApiKey={apiKey} 
            onLoad={() => console.log('Google Maps API loaded')}
            onError={() => setGoogleMapsError(true)}
            libraries={['places']}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={16}
              onLoad={onMapLoad}
              options={{
                streetViewControl: false,
                fullscreenControl: true,
                mapTypeControl: true,
                zoomControl: true,
                restriction: {
                  latLngBounds: {
                    north: 33.943,
                    south: 33.934,
                    east: -84.511,
                    west: -84.526
                  },
                  strictBounds: true
                }
              }}
            >
              {/* Location Markers */}
              {campusLocations.map(location => (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleMarkerClick(location)}
                  // Default marker with customized color based on location type
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: location.type === 'building' ? '#3F51B5' : 
                               location.type === 'parking' ? '#FF9800' : '#03A9F4',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF'
                  }}
                />
              ))}
              
              {/* Accessibility Features */}
              {accessibilityFeatures.map(feature => (
                <Marker
                  key={`feature-${feature.id}`}
                  position={{ lat: feature.latitude, lng: feature.longitude }}
                  onClick={() => handleMarkerClick({
                    ...feature,
                    lat: feature.latitude,
                    lng: feature.longitude,
                    name: `${feature.feature_type}: ${feature.description}`
                  })}
                  // Accessibility feature markers with different shapes
                  icon={{
                    path: feature.feature_type === 'elevator' ? window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW :
                          feature.feature_type === 'ramp' ? window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW :
                          window.google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: '#9C27B0', // Purple for accessibility features
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF'
                  }}
                />
              ))}
              
              {/* Obstacles from backend API */}
              {backendObstacles.map(obstacle => (
                <Marker
                  key={`obstacle-${obstacle.id}`}
                  position={{ lat: obstacle.latitude, lng: obstacle.longitude }}
                  onClick={() => handleMarkerClick({
                    ...obstacle,
                    lat: obstacle.latitude,
                    lng: obstacle.longitude,
                    name: obstacle.description || `${obstacle.obstacle_type} obstacle`,
                    status: obstacle.obstacle_type === 'construction' ? 'Construction Area' : 
                           obstacle.obstacle_type === 'stairs' ? 'Stairs - No Ramp Available' :
                           obstacle.obstacle_type === 'steep' ? 'Steep Incline - Difficult Access' :
                           'Obstacle',
                    reportedAt: obstacle.reported_at
                  })}
                  // Obstacle markers with warning symbols
                  icon={{
                    path: window.google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
                    scale: 7,
                    fillColor: 
                      obstacle.obstacle_type === 'construction' ? '#FF5722' : // Orange-red for construction
                      obstacle.obstacle_type === 'stairs' ? '#F44336' :       // Red for stairs
                      obstacle.obstacle_type === 'steep' ? '#D32F2F' :        // Dark red for steep inclines
                      obstacle.obstacle_type === 'temporary' ? '#FFC107' :    // Amber for temporary
                      '#E91E63',                                              // Pink for other obstacles
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#FFFFFF'
                  }}
                />
              ))}
            
              {/* Info Window for Selected Location */}
              {selectedLocation && (
                <InfoWindow
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onCloseClick={() => setSelectedLocation(null)}
                >
                  <div className="info-window">
                    <h3>{selectedLocation.name || selectedLocation.location}</h3>
                    {selectedLocation.type === 'building' && (
                      <p>Elevator Available: {selectedLocation.hasElevator ? 'Yes' : 'No'}</p>
                    )}
                    {selectedLocation.status && (
                      <div className="obstacle-info">
                        <p className="status">{selectedLocation.status}</p>
                        <p className="reported">Reported: {selectedLocation.reportedAt}</p>
                      </div>
                    )}
                    <div className="info-actions">
                      <button onClick={() => handleStartPointSelect(selectedLocation)}>
                        Set as Start
                      </button>
                      <button onClick={() => handleEndPointSelect(selectedLocation)}>
                        Set as Destination
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
              
              {/* Route Polyline */}
              {route.length > 0 && (
                <>
                  <Polyline
                    path={route}
                    options={{
                      strokeColor: wheelchairMode ? '#4CAF50' : '#2196F3',
                      strokeOpacity: 0.8,
                      strokeWeight: 5
                    }}
                  />
                  {/* Add markers at start and end of route */}
                  <Marker
                    position={route[0]}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: '#4CAF50', // Green for start
                      fillOpacity: 1,
                      strokeWeight: 3,
                      strokeColor: '#FFFFFF'
                    }}
                  />
                  <Marker
                    position={route[route.length - 1]}
                    icon={{
                      path: window.google.maps.SymbolPath.STAR,
                      scale: 12,
                      fillColor: '#F44336', // Red for destination
                      fillOpacity: 1,
                      strokeWeight: 3,
                      strokeColor: '#FFFFFF'
                    }}
                  />
                </>
              )}
              
              {/* Campus Boundary Polygon */}
              <Polygon
                paths={campusBoundary}
                options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: '#FF0000',
                  fillOpacity: 0.1
                }}
              />
            </GoogleMap>
          </LoadScript>
        )}
      </div>
      
      <div className="map-legend">
        <h3>Map Legend</h3>
        <ul>
          <li><span className="legend-icon building"></span> Buildings</li>
          <li><span className="legend-icon parking"></span> Parking Areas</li>
          <li><span className="legend-icon accessibility"></span> Accessibility Features</li>
          <li><span className="legend-icon obstacle"></span> Reported Obstacles</li>
          <li><span className="legend-icon route"></span> Standard Route</li>
          <li><span className="legend-icon accessible-route"></span> Accessible Route</li>
        </ul>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default InteractiveMap;