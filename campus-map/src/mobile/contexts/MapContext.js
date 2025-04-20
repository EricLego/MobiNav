// src/mobile/contexts/MapContext.js
import React, { createContext, useState, useRef, useCallback, useMemo } from 'react';

// Define the shape of the context data
const defaultContextValue = {
  mapRef: { current: null }, // Use a ref object structure
  isMapLoaded: false,
  setLoaded: (loaded) => {},
};

export const MapContext = createContext(defaultContextValue);

export const MapProvider = ({ children }) => {
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Function to update map loaded status
  const setLoaded = useCallback((loaded) => setIsMapLoaded(loaded), []);


  // --- Context Value ---
  // Use useMemo to optimize context value stability
  const value = useMemo(() => ({
    mapRef,
    isMapLoaded,
    setLoaded,
  }), [isMapLoaded, setLoaded]); // mapRef is stable

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
