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

  // State to store campus locations
  const [campusLocations, setCampusLocations] = useState([
    { id: 1, name: 'Engineering Building', lat: 33.942, lng: -84.521, type: 'building', hasElevator: true },
    { id: 2, name: 'Student Center', lat: 33.939, lng: -84.518, type: 'building', hasElevator: true },
    { id: 3, name: 'Library', lat: 33.941, lng: -84.517, type: 'building', hasElevator: true },
    { id: 4, name: 'Parking Deck A', lat: 33.943, lng: -84.520, type: 'parking', hasElevator: true },
    { id: 5, name: 'Bus Stop', lat: 33.938, lng: -84.519, type: 'transportation' }
  ]);

  // State for the new location form
  const [newLocation, setNewLocation] = useState({
    name: '',
    lat: '',
    lng: '',
    type: 'building',
    hasElevator: true
  });
  
  // State for map click mode (pin mode)
  const [isPinMode, setIsPinMode] = useState(false);
  
  // State for temporary marker when in pin mode
  const [tempMarker, setTempMarker] = useState(null);
  
  // State for the location form modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Function to add a new location
  const addNewLocation = (e) => {
    if (e) e.preventDefault();
    
    // Validate form
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Create new location object
    const location = {
      id: campusLocations.length > 0 ? Math.max(...campusLocations.map(l => l.id)) + 1 : 1,
      name: newLocation.name,
      lat: parseFloat(newLocation.lat),
      lng: parseFloat(newLocation.lng),
      type: newLocation.type,
      ...(newLocation.type === 'building' && { hasElevator: newLocation.hasElevator })
    };
    
    // Add to locations array
    setCampusLocations(prev => [...prev, location]);
    
    // Reset form
    setNewLocation({
      name: '',
      lat: '',
      lng: '',
      type: 'building',
      hasElevator: true
    });
    
    // Clear temporary marker
    setTempMarker(null);
    
    // Close modal if open
    setShowLocationModal(false);
    
    // Show confirmation message
    alert(`Location "${location.name}" added successfully!`);
    
    // If we were in pin mode, exit it
    if (isPinMode) {
      setIsPinMode(false);
    }
  };
  
  // Function to delete a location
  const deleteLocation = (id) => {
    // Confirm delete
    if (window.confirm('Are you sure you want to delete this location?')) {
      setCampusLocations(prev => prev.filter(location => location.id !== id));
      
      // If this location was set as start or end point, clear it
      if (startPoint && campusLocations.find(loc => loc.id === id && loc.name === startPoint)) {
        setStartPoint('');
      }
      
      if (endPoint && campusLocations.find(loc => loc.id === id && loc.name === endPoint)) {
        setEndPoint('');
      }
    }
  };
  
  // Function to load locations from a CSV file
  const loadLocationsFromCSV = (csvContent) => {
    // Split the CSV content by newlines
    const lines = csvContent.split('\n');
    
    // The first line should be the header
    const headers = lines[0].split(',');
    
    // Process remaining lines (skip the header)
    const newLocations = lines.slice(1).filter(line => line.trim() !== '').map((line, index) => {
      const values = line.split(',');
      const location = {};
      
      // Map values to properties based on headers
      headers.forEach((header, i) => {
        if (header === 'id') {
          location[header] = parseInt(values[i], 10);
        } else if (header === 'lat' || header === 'lng') {
          location[header] = parseFloat(values[i]);
        } else if (header === 'hasElevator') {
          location[header] = values[i].toLowerCase() === 'true';
        } else {
          location[header] = values[i];
        }
      });
      
      // Add ID if not provided in CSV
      if (!location.id) {
        location.id = index + 1;
      }
      
      return location;
    });
    
    setCampusLocations(newLocations);
  };

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        loadLocationsFromCSV(content);
      };
      reader.readAsText(file);
    }
  };

  // Function to export locations as CSV
  const exportLocationsAsCSV = () => {
    if (campusLocations.length === 0) return;
    
    // Get headers from the first location
    const headers = Object.keys(campusLocations[0]);
    
    // Create CSV content
    const csvContent = 
      headers.join(',') + '\n' + 
      campusLocations.map(loc => (
        headers.map(header => loc[header]).join(',')
      )).join('\n');
    
    // Create a downloadable link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campus_locations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle escape key to exit pin mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showLocationModal) {
          // If modal is open, close it
          setShowLocationModal(false);
          setTempMarker(null);
        } else if (isPinMode) {
          // Otherwise, exit pin mode if active
          setIsPinMode(false);
          setTempMarker(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinMode, showLocationModal]);
  
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
        if (typeof window.google === 'undefined') {
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
  
  // Function to handle map clicks when in pin mode
  const handleMapClick = (event) => {
    if (!isPinMode) return;
    
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Set the temporary marker
    setTempMarker({ lat, lng });
    
    // Pre-fill the new location form with coordinates
    setNewLocation(prev => ({
      ...prev,
      lat,
      lng
    }));
    
    // Open the location form modal
    setShowLocationModal(true);
  };
  
  // Function to toggle pin mode
  const togglePinMode = () => {
    setIsPinMode(!isPinMode);
    // Clear temporary marker when exiting pin mode
    if (isPinMode) {
      setTempMarker(null);
    }
  };
  
  // Function to cancel adding a new pin
  const cancelAddPin = () => {
    setShowLocationModal(false);
    setTempMarker(null);
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
      {/* Location Form Modal */}
      {showLocationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Location</h3>
            <p className="modal-coordinates">
              Coordinates: {tempMarker ? `${tempMarker.lat.toFixed(6)}, ${tempMarker.lng.toFixed(6)}` : ''}
            </p>
            
            <form onSubmit={addNewLocation}>
              <div className="form-group">
                <label htmlFor="modal-name">Location Name*</label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={newLocation.name}
                  onChange={handleInputChange}
                  placeholder="Enter location name"
                  required
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="modal-type">Type*</label>
                <select
                  id="modal-type"
                  name="type"
                  value={newLocation.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="building">Building</option>
                  <option value="parking">Parking</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>
              
              {newLocation.type === 'building' && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="hasElevator"
                      checked={newLocation.hasElevator}
                      onChange={handleInputChange}
                    />
                    Has Elevator Access
                  </label>
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" onClick={cancelAddPin} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="add-button">
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
        
        <div className="location-management">
          <h3>Manage Locations</h3>
          <div className="location-controls">
            <button 
              onClick={togglePinMode} 
              className={`pin-mode-button ${isPinMode ? 'active' : ''}`}
              title={isPinMode ? 'Exit Pin Mode' : 'Enter Pin Mode (Click on map to add locations)'}
            >
              {isPinMode ? 'Exit Pin Mode' : 'Pin Mode'}
            </button>
            
            <div className="file-input-container">
              <input
                type="file"
                id="csv-upload"
                accept=".csv"
                onChange={handleFileUpload}
                className="file-input"
              />
              <label htmlFor="csv-upload" className="file-input-label">
                Import Locations (CSV)
              </label>
            </div>
            <button 
              onClick={exportLocationsAsCSV} 
              className="export-button"
            >
              Export Locations (CSV)
            </button>
          </div>
          
          {isPinMode && (
            <div className="pin-mode-instructions">
              <p>
                <strong>Pin Mode Active:</strong> Click anywhere on the map to place a new location marker.
                Press ESC or click "Exit Pin Mode" to cancel.
              </p>
            </div>
          )}
          <p className="location-help">
            CSV format: id,name,lat,lng,type,hasElevator<br/>
            <a href="/sample_locations.csv" download className="sample-link">Download Sample CSV</a>
          </p>
          
          <div className="add-location-form">
            <h4>Add New Location</h4>
            <form onSubmit={addNewLocation}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location-name">Name*</label>
                  <input
                    type="text"
                    id="location-name"
                    name="name"
                    value={newLocation.name}
                    onChange={handleInputChange}
                    placeholder="Building Name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location-lat">Latitude*</label>
                  <input
                    type="number"
                    id="location-lat"
                    name="lat"
                    value={newLocation.lat}
                    onChange={handleInputChange}
                    step="0.0001"
                    placeholder="e.g. 33.9420"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location-lng">Longitude*</label>
                  <input
                    type="number"
                    id="location-lng"
                    name="lng"
                    value={newLocation.lng}
                    onChange={handleInputChange}
                    step="0.0001"
                    placeholder="e.g. -84.5210"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location-type">Type*</label>
                  <select
                    id="location-type"
                    name="type"
                    value={newLocation.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="building">Building</option>
                    <option value="parking">Parking</option>
                    <option value="transportation">Transportation</option>
                  </select>
                </div>
                
                {newLocation.type === 'building' && (
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="hasElevator"
                        checked={newLocation.hasElevator}
                        onChange={handleInputChange}
                      />
                      Has Elevator
                    </label>
                  </div>
                )}
              </div>
              
              <button type="submit" className="add-location-button">Add Location</button>
            </form>
          </div>
          
          {/* Location Table */}
          {campusLocations.length > 0 && (
            <div className="location-table-container">
              <h4>Current Locations ({campusLocations.length})</h4>
              <div className="location-table-wrapper">
                <table className="location-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Coordinates</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campusLocations.map(location => (
                      <tr key={location.id}>
                        <td>{location.name}</td>
                        <td>
                          {location.type === 'building' ? 'Building' : 
                           location.type === 'parking' ? 'Parking' : 'Transport'}
                          {location.type === 'building' && (
                            <span className="elevator-badge">
                              {location.hasElevator ? '♿' : ''}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="coordinates">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => deleteLocation(location.id)}
                            className="delete-button"
                            title="Delete location"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
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
      
      <div className={`map-container ${isPinMode ? 'pin-mode-active' : ''}`}>
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
              onClick={handleMapClick}
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
                },
                // Change cursor style when in pin mode
                cursor: isPinMode ? 'crosshair' : 'default'
              }}
            >
              {/* Location Markers */}
              {campusLocations.map(location => (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleMarkerClick(location)}
                  // Use simple label-based markers instead of custom icons
                  label={{
                    text: location.type === 'building' ? 'B' : 
                          location.type === 'parking' ? 'P' : 'T',
                    color: 'white',
                    fontWeight: 'bold'
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
                  label={feature.feature_type === 'elevator' ? 'E' : 
                         feature.feature_type === 'ramp' ? 'R' : 'A'}
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
                  label="!"
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
                    label={{
                      text: "S",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                  <Marker
                    position={route[route.length - 1]}
                    label={{
                      text: "D",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                </>
              )}
              
              {/* Show temporary marker when in pin mode */}
              {tempMarker && (
                <Marker
                  position={{ lat: tempMarker.lat, lng: tempMarker.lng }}
                  animation={2} // BOUNCE animation
                  label={{
                    text: "New",
                    color: "white",
                    fontWeight: "bold"
                  }}
                />
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