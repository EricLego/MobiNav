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
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [googleMapsError, setGoogleMapsError] = useState(false);
  
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

  // Mock obstacles data - this would come from an API in production
  useEffect(() => {
    // Simulated API call to get obstacles
    const mockObstacles = [
      { id: 1, location: 'Engineering Building Elevator', lat: 33.942, lng: -84.521, type: 'elevator', status: 'Out of Service', reportedAt: '2025-03-15' },
      { id: 2, location: 'Path near Student Center', lat: 33.940, lng: -84.518, type: 'construction', status: 'Under Construction', reportedAt: '2025-03-16' },
      // Add more obstacles as needed
    ];
    
    setObstacles(mockObstacles);
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

  // Function to calculate route - this would call your backend API in production
  const calculateRoute = () => {
    // Find selected locations
    const start = campusLocations.find(loc => loc.name === startPoint);
    const end = campusLocations.find(loc => loc.name === endPoint);
    
    if (!start || !end) {
      alert('Please select valid start and end points');
      return;
    }
    
    // In a real app, you would call your backend API here
    // For now, create a simple mock route
    const mockRoute = [
      { lat: start.lat, lng: start.lng },
      { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 - 0.001 },
      { lat: end.lat, lng: end.lng }
    ];
    
    setRoute(mockRoute);
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
    // In a real app, you would recalculate routes here
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
          
          <button onClick={calculateRoute} className="calculate-button">
            Calculate Route
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
                
                {/* Mock obstacles removed as requested */}
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
            {/* Campus and Obstacle Markers removed as requested */}
            
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
              <Polyline
                path={route}
                options={{
                  strokeColor: wheelchairMode ? '#4CAF50' : '#2196F3',
                  strokeOpacity: 0.8,
                  strokeWeight: 5
                }}
              />
            )}
            
            {/* Campus Boundary Polygon - invisible but still restricts the map */}
          </GoogleMap>
        </LoadScript>
        )}
      </div>
      
      <div className="map-legend">
        <h3>Map Legend</h3>
        <ul>
          <li>Buildings</li>
          <li>Parking Areas</li>
          <li>Transportation</li>
          <li>Reported Obstacles</li>
          <li>Accessible Route</li>
        </ul>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default InteractiveMap;