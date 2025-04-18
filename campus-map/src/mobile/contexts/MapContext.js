// src/contexts/MapContext.js
import { createContext, useRef } from 'react';
import { useState } from 'react';

// Define the shape of the context data
const defaultContextValue = {
  mapRef: { current: null }, // Use a ref object structure
  isMapLoaded: false,
  fullscreen: false,
  mapOptions: {},
  // Add other map-related states or functions as needed later
  // e.g., setMapCenter: () => {},
};

export const MapContext = createContext(defaultContextValue);

// Optional: A Provider component to encapsulate the ref creation
// This isn't strictly necessary if the provider logic lives in GoogleMapCore,
// but can be useful for more complex contexts.
export const MapProvider = ({ children }) => {
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // Example state managed here

  // Function to update map loaded status (could be called from GoogleMapCore)
  const setLoaded = (loaded) => setIsMapLoaded(loaded);

  const value = {
    mapRef,
    isMapLoaded,
    setLoaded, // Expose function to update status
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

