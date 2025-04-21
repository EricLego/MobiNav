// src/components/GoogleMapCore.js
import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import useGoogleMapLoader from '../hooks/useGoogleMapLoader';
import useMapViewpoint from '../hooks/useMapViewpoint';
import { MapContext } from '../contexts/MapContext'; // Import the context
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
  isMarkerPlacementActive = false,
  onMapClickForMarker,

}) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: isScriptLoaded, loadError, handleLoadSuccess, handleLoadError } = useGoogleMapLoader(apiKey, libraries);

  const { mapRef, setLoaded } = useContext(MapContext);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false); // Track if map instance itself is ready
  const [mapOptions, setMapOptions] = useState(initialMapOptions);
  const clickListenerRef = useRef(null);

  useMapViewpoint();

  // Callback when the GoogleMap component itself is loaded
  const onMapLoad = useCallback((mapInstance) => {
    console.log('GoogleMap component instance loaded.');
    mapRef.current = mapInstance; // Store the instance in the ref
    setIsMapInstanceLoaded(true); // Mark map instance as loaded
    setLoaded(true);

    // Set default options once map is loaded (can be dynamic later)
    const campusBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(33.932673, -84.529504), // SW
      new window.google.maps.LatLng(33.946486, -84.512786)  // NE
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



  // --- Effect to handle map click listener and options for reporting ---
  useEffect(() => {
    // Ensure map instance is ready and google object is available
    if (!isMapInstanceLoaded || !mapRef.current || !window.google || !window.google.maps) {
      console.log("Map not ready for reporting listener/options setup.");
      return;
    }

    const map = mapRef.current;

    // --- Clean up previous listener ---
    if (clickListenerRef.current) {
      window.google.maps.event.removeListener(clickListenerRef.current);
      clickListenerRef.current = null;
      console.log("Previous map click listener removed.");
    }

    // --- Apply reporting mode settings ---
    if (isMarkerPlacementActive) {
      console.log("Adding map click listener and setting options for obstacle placement.");
      // Add new listener
      clickListenerRef.current = map.addListener('click', (e) => {
        if (onMapClickForMarker) {
          const coords = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          onMapClickForMarker(coords);
        }
      });

      // Update map options for reporting mode
      map.setOptions({
          draggableCursor: 'crosshair',
          clickableIcons: false // Disable clicking POIs
      });

    } else {
      console.log("Marker placement not active, ensuring default options.");
      // Reset map options to default when not in reporting mode
      map.setOptions({
          draggableCursor: null, // Reset cursor
          clickableIcons: true // Re-enable clicking POIs
      });
    }

    // --- Cleanup function for when effect re-runs or component unmounts ---
    return () => {
      if (clickListenerRef.current) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
        console.log("Map click listener removed on effect cleanup.");
      }
       // Reset options on cleanup as well, just in case
       if (mapRef.current) {
           mapRef.current.setOptions({
               draggableCursor: null,
               clickableIcons: true
           });
       }
    };
    // Depend on the activation state, the callback, and map readiness
  }, [isMarkerPlacementActive, onMapClickForMarker, isMapInstanceLoaded, mapRef]);



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
