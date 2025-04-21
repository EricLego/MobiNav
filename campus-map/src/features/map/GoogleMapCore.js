// src/components/GoogleMapCore.js
import React, { useState, useRef, useCallback, useMemo, useContext } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import useGoogleMapLoader from './useGoogleMapLoader';
import useMapViewpoint from './useMapViewpoint';
import { MapContext } from './MapContext'; // Import the context
import MapOverlays from './MapOverlays';

// Define libraries as a constant array
const libraries = ['places'];

// Default map settings (can be overridden by props)
export const defaultCenter = {
  lat: 33.9386, // KSU Marietta Campus
  lng: -84.5187,
};
const defaultZoom = 16;

const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
};

const GoogleMapCore = ({
  mapContainerStyle = defaultMapContainerStyle,
  center = defaultCenter,
  zoom = defaultZoom,
  mapOptions: initialMapOptions = {}, // Allow passing initial options
}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: isScriptLoaded, loadError, handleLoadSuccess, handleLoadError } = useGoogleMapLoader(apiKey, libraries);

  const { mapRef, setLoaded } = useContext(MapContext);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false); // Track if map instance itself is ready
  const [mapOptions, setMapOptions] = useState(initialMapOptions);

  useMapViewpoint();

  // Callback when the GoogleMap component itself is loaded
  const onMapLoad = useCallback((mapInstance) => {
    console.log('GoogleMap component instance loaded.');
    mapRef.current = mapInstance; // Store the instance in the ref
    setIsMapInstanceLoaded(true); // Mark map instance as loaded
    setLoaded(true);

    // Set default options once map is loaded (can be dynamic later)
    const campusBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(33.935673, -84.524504), // SW
      new window.google.maps.LatLng(33.941486, -84.512786)  // NE
    );
    setMapOptions(prevOptions => ({
      streetViewControl: false,
      fullscreenControl: false, // Remove fullscreen button
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: window.google.maps.ControlPosition.BOTTOM_LEFT // Position requires google object
      },
      zoomControl: true,
      mapId: 'bdd7d136cc4cd64c', // Your Map ID
      restriction: {
        latLngBounds: campusBounds,
        strictBounds: false, // Allows slight panning outside initially
      },
      gestureHandling: 'greedy', // Allows one-finger panning/zooming
      ...prevOptions, // Merge with any initial options passed via props
    }));


  }, [mapRef, setLoaded]); // No dependencies needed for this basic version

  // Callback if the map is unmounted
  const onUnmount = useCallback(() => {
    console.log('GoogleMap component unmounted.');
    mapRef.current = null;
    setIsMapInstanceLoaded(false);
    setLoaded(false);
  }, [mapRef, setLoaded]);

  // --- Render Logic ---
  if (loadError) {
    // Handle script loading error (e.g., invalid API key, network issue)
    return (
      <div style={mapContainerStyle} className="map-placeholder error">
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={handleLoadSuccess}
      onError={handleLoadError}
      loadingElement={<div style={mapContainerStyle} className="map-placeholder loading">Loading Maps Script...</div>}
    >
      {/* Only render GoogleMap component if the script is loaded */}
      {isScriptLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={mapOptions} // Pass the dynamic options state
          onLoad={onMapLoad}
          onUnmount={onUnmount}
          // Add other event handlers as needed (onClick, onBoundsChanged, etc.)
        >
          {/* Render children (like MapOverlays) only when map instance is ready */}
          {isMapInstanceLoaded && <MapOverlays />}
        </GoogleMap>
      ) : (
        // Render a placeholder while LoadScript is working but before isScriptLoaded is true
        // This might be brief if loadingElement is used effectively.
        <div style={mapContainerStyle} className="map-placeholder waiting">Waiting for script...</div>
      )}
    </LoadScript>
  );
};

export default GoogleMapCore;
