import React, { useState, useEffect, useRef, useContext } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Polyline, Polygon } from '@react-google-maps/api';
import { AccessibilityContext } from '../App';
import BuildingAutocomplete from './BuildingAutocomplete';
import '../styles/InteractiveMap.css';
import RoutePointDisplay from './RoutePointDisplay';
import RoutePlanner from './RoutePlanner';

// Define libraries as a constant array to avoid unnecessary reloads
const libraries = ['places'];

const InteractiveMap = () => {
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const routeRef = useRef(null);
  const [campusBounds, setCampusBounds] = useState(null);
  const [mapOptions, setMapOptions] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [wheelchairMode, setWheelchairMode] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(false);
  
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };
  
  const center = {
    lat: 33.9386, // KSU Marietta Campus (center point of the polygon)
    lng: -84.5187,
  };
  


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
    mapRef.current = mapInstance;

    const campusBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(33.935673, -84.524504), // SW corner
      new window.google.maps.LatLng(33.941486, -84.512786)  // NE corner
    );

    setCampusBounds(campusBounds);

    setMapOptions({
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.BOTTOM_LEFT
      },
      zoomControl: true,
      mapId: 'bdd7d136cc4cd64c',
      restriction: {
        latLngBounds: campusBounds,
        strictBounds: true
      }
    });

    mapInstance.fitBounds(campusBounds);
    
  };

  // Function to handle marker click
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };


  // Function to calculate route using Google Maps Directions API
  const calculateRoute = () => {
    // Find selected locations
    
    const start = startPoint;
    const end = endPoint;
    console.log(start); console.log(end);
    if (!start || !end) {
      alert('Please select valid start and end points');
      return;
    }
    
    // Check if DirectionsService is available
    if (!window.google || !window.google.maps || !window.google.maps.DirectionsService) {
      console.error('Google Maps Directions API not available');
      
      // Fallback to mock route if API is not available
      const mockRoute = [
        { lat: start.lat, lng: start.lng },
        { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 - 0.001 },
        { lat: end.lat, lng: end.lng }
      ];
      
      setRoute(mockRoute);
      return;
    }
    
    // Create a DirectionsService instance
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    
    // Configure route options
    const routeOptions = {
      origin: { lat: start.lat, lng: start.lng },
      destination: { lat: end.lat, lng: end.lng },
      travelMode: window.google.maps.TravelMode.WALKING, // Default to walking for campus navigation
    };
    
    // Add wheelchair/accessibility mode if selected
    if (wheelchairMode) {
      // For wheelchair accessibility, we need to avoid stairs and steep slopes
      // Note: Wheelchair route planning is limited in standard Google Maps API
      // In production, you might want to use a specialized accessibility routing API
      routeOptions.avoidHighways = true;
      routeOptions.avoidFerries = true;
    }
    
    // Request directions
    directionsService.route(routeOptions)
    .then(result => {
      console.log(result);
      if (result.routes.length > 0) {
        directionsRenderer.setDirections(result);
        directionsRenderer.setPanel(document.getElementById('route-planner'));
        // Convert the directions result to a route path
        const routePath = [];
        const legs = result.routes[0].legs;
        
        legs.forEach(leg => {
          leg.steps.forEach(step => {
            // Each step has a path of LatLng points
            const path = step.path || [];
            path.forEach(point => {
              routePath.push({ lat: point.lat(), lng: point.lng() });
            });
          });
        });
        
        setRoute(routePath);
        
        // Optional: fit the map to the route bounds
        if (map && result.routes[0].bounds) {
          map.fitBounds(result.routes[0].bounds);
        }
      }
    })
    .catch(error => {
      console.error('Directions request failed:', error);
      alert('Could not calculate route between these points. Please try different locations.');
    });
  };

  const handlePlaceSelect = (place) => {
    if (place && place.location) {
      console.log("Place selected:", place);
      
      // Center the map on the selected place
      if (map) {
        if (place.viewport) {
          map.fitBounds(place.viewport);
        } else {
          map.setCenter(place.location);
          map.setZoom(18);
        }
      }
      
      // Create a location object from the place
      const newLocation = {
        name: place.displayName || 'Selected Location',
        lat: place.location.lat,
        lng: place.location.lng,
        formattedAddress: place.formattedAddress || '',
        type: 'search'
      };
      
      // Show the info window for this location
      setSelectedLocation(newLocation);

    }
  };

  const handleStartPointPlaceSelect = (place) => {
    if (place) {
      console.log("Start point selected:", place);
      
      // Set the place as the end point
      setStartPoint(place);
      
      // Optionally center the map
      if (map) {
        map.setCenter(place);
        map.setZoom(18);
      }


      if(searchRef.current){
        console.log(searchRef.current, "clearing search");
        searchRef.current.clear();
        setSelectedLocation(null);
      }else{
        console.log(searchRef.current, "search ref not found");
      }
    } else{
      console.log(place);
    }
  };

  const handleEndPointPlaceSelect = (place) => {
    if(place) {
      console.log("End point selected:", place);

      // Set the place as the end point
      setEndPoint(place);

      // Optionally center the map
      if (map) {
        map.setCenter(place);
        map.setZoom(18);
      }


      if(searchRef.current){
        console.log(searchRef.current, "clearing search");
        searchRef.current.clear();
        setSelectedLocation(null);
      }else{
        console.log(searchRef.current, "search ref not found");
      }
      
    }
  }

  const { accessibilitySettings } = useContext(AccessibilityContext);
  
  return (
    <div className={`page-container ${accessibilitySettings.highContrast ? 'high-contrast' : ''} ${accessibilitySettings.largeText ? 'large-text' : ''}`}>
      <div className="interactive-map">
        <div className="map-container-wrapper">
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
                libraries={libraries}
                onLoad={() => console.log('Google Maps API loaded')}
                onError={() => setGoogleMapsError(true)}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={16}
                  onLoad={onMapLoad}
                  options={mapOptions}
                >
                  
                  
                  {/* Info Window for Selected Location */}
                  {selectedLocation && (
                    <InfoWindow
                      position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                      onCloseClick={() => setSelectedLocation(null)}
                    >
                      <div className="info-window">
                        <h3>{selectedLocation.name || selectedLocation.location}</h3>
                        {selectedLocation.formattedAddress && (
                          <p>{selectedLocation.formattedAddress}</p>
                        )}
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
                          <button onClick={() => handleStartPointPlaceSelect(selectedLocation)}>
                            Set as Start
                          </button>
                          <button onClick={() => handleEndPointPlaceSelect(selectedLocation)}>
                            Set as Destination
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            )}
          </div>

          <RoutePlanner 
            startPoint={startPoint}
            setStartPoint={setStartPoint}
            endPoint={endPoint}
            setEndPoint={setEndPoint}
            wheelchairMode={wheelchairMode}
            setWheelchairMode={setWheelchairMode}
            mapRef={mapRef}
            handlePlaceSelect={handlePlaceSelect}
            handleStartPointPlaceSelect={handleStartPointPlaceSelect}
            handleEndPointPlaceSelect={handleEndPointPlaceSelect}
            calculateRoute={calculateRoute}
            campusBoundary={{
              north: 33.941486,
              south: 33.935673,
              east: -84.512786,
              west: -84.524504
            }}
          />

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
    </div>
  );
};

export default InteractiveMap;