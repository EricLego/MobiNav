// src/mobile/contexts/MapContext.js
import React, { createContext, useState, useRef, useCallback, useMemo } from 'react';

// Define the shape of the context data
const defaultContextValue = {
  mapRef: { current: null }, // Use a ref object structure
  isMapLoaded: false,
  // --- Viewpoint State ---
  viewpointCenter: null, // { lat, lng } | null
  viewpointZoom: null,   // number | null
  viewpointTilt: 0,      // number
  viewpointHeading: 0,   // number
  // --- Setters ---
  setViewpoint: (view) => {}, // Function to set all/part of the viewpoint
  setLoaded: (loaded) => {}, // Keep existing setter
};

export const MapContext = createContext(defaultContextValue);

export const MapProvider = ({ children }) => {
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // --- Viewpoint State ---
  const [viewpointCenter, setViewpointCenter] = useState(defaultContextValue.viewpointCenter);
  const [viewpointZoom, setViewpointZoom] = useState(defaultContextValue.viewpointZoom);
  const [viewpointTilt, setViewpointTilt] = useState(defaultContextValue.viewpointTilt);
  const [viewpointHeading, setViewpointHeading] = useState(defaultContextValue.viewpointHeading);

  // Function to update map loaded status
  const setLoaded = useCallback((loaded) => setIsMapLoaded(loaded), []);

  // --- Combined Setter for Viewpoint ---
  const setViewpoint = useCallback((view) => {
    // Allows setting individual properties or multiple at once
    if (view.center !== undefined) setViewpointCenter(view.center);
    if (view.zoom !== undefined) setViewpointZoom(view.zoom);
    if (view.tilt !== undefined) setViewpointTilt(view.tilt);
    if (view.heading !== undefined) setViewpointHeading(view.heading);
  }, []);

  // --- Context Value ---
  // Use useMemo to optimize context value stability
  const value = useMemo(() => ({
    mapRef,
    isMapLoaded,
    setLoaded,
    // Viewpoint state and setter
    viewpointCenter,
    viewpointZoom,
    viewpointTilt,
    viewpointHeading,
    setViewpoint,
  }), [
      isMapLoaded, setLoaded, // mapRef is stable
      viewpointCenter, viewpointZoom, viewpointTilt, viewpointHeading, setViewpoint
  ]);

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
