// src/mobile/contexts/RoutingContext.js
import React, { createContext, useState, useCallback } from 'react';

// Define the shape of the context data
const defaultRoutingContextValue = {
  startPoint: null, // { lat, lng, name, ... }
  endPoint: null,   // { lat, lng, name, ... }
  route: null,      // { geometry: [{lat, lng}, ...], instructions: [], warnings: [], summary: {} } or null
  isLoadingRoute: false,
  routeError: null,
  setStartPoint: () => {},
  setEndPoint: () => {},
  setRoute: () => {}, // Might be set internally by a hook
  setIsLoadingRoute: () => {},
  setRouteError: () => {},
  clearRoute: () => {},
};

export const RoutingContext = createContext(defaultRoutingContextValue);

export const RoutingProvider = ({ children }) => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const clearRoute = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
    setIsLoadingRoute(false);
    setRouteError(null);
  }, []);

  const handleSetStartPoint = useCallback((point) => {
    setStartPoint(point);
    setRoute(null); // Clear previous route when start changes
    setRouteError(null);
  }, []);

  const handleSetEndPoint = useCallback((point) => {
    setEndPoint(point);
    setRoute(null); // Clear previous route when end changes
    setRouteError(null);
  }, []);


  const value = {
    startPoint,
    endPoint,
    route,
    isLoadingRoute,
    routeError,
    setStartPoint: handleSetStartPoint,
    setEndPoint: handleSetEndPoint,
    setRoute, // Allow internal setting
    setIsLoadingRoute,
    setRouteError,
    clearRoute,
  };

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  );
};
