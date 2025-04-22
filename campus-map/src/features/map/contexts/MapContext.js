// src/mobile/contexts/MapContext.js
import React, { createContext, useState, useRef, useCallback, useMemo } from 'react';

// Define the shape of the context data
const defaultContextValue = {
  mapRef: { current: null }, // Use a ref object structure
  isMapLoaded: false,
  setLoaded: (loaded) => {},
  selectedCategory: 'all',
  setSelectedCategory: (category) => {},
};

export const MapContext = createContext(defaultContextValue);

export const MapProvider = ({ children }) => {
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Function to update map loaded status
  const setLoaded = useCallback((loaded) => setIsMapLoaded(loaded), []);

  // Function to update selected category (already stable due to useState)
  const handleSetSelectedCategory = useCallback((category) => {
    console.log("MapContext: Setting category to", category); // Add log for debugging
    setSelectedCategory(category);
  }, []);


  // --- Context Value ---
  // Use useMemo to optimize context value stability
  const value = useMemo(() => ({
    mapRef,
    isMapLoaded,
    setLoaded,
    selectedCategory,
    setSelectedCategory: handleSetSelectedCategory
  }), [isMapLoaded, setLoaded, selectedCategory, handleSetSelectedCategory]); // mapRef is stable

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
