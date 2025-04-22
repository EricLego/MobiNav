// src/features/routing/context/RoutingContext.js
import React, { createContext, useState, useCallback, useMemo } from 'react'; // Added useMemo

// Define the shape of the context data
const defaultRoutingContextValue = {
  startPoint: null, // { lat, lng, name, ... }
  endPoint: null,   // { lat, lng, name, ... }
  route: null,      // { geometry: [{lat, lng}, ...], instructions: [], warnings: [], summary: {} } or null
  isLoadingRoute: false,
  routeError: null,
  selectingEntranceFor: null, // null | 'start' | 'end' - NEW STATE
  selectedBuildingForEntrance: null, // null | BuildingObject - NEW STATE
  setStartPoint: () => {},
  setEndPoint: () => {},
  setRoute: () => {}, // Might be set internally by a hook
  setIsLoadingRoute: () => {},
  setRouteError: () => {},
  setSelectingEntranceFor: () => {}, // NEW Setter
  setSelectedBuildingForEntrance: () => {}, // NEW Setter
  clearRoute: () => {},
  cancelEntranceSelection: () => {}, // NEW Helper
};

export const RoutingContext = createContext(defaultRoutingContextValue);

export const RoutingProvider = ({ children }) => {
  const [startPoint, setStartPointState] = useState(null);
  const [endPoint, setEndPointState] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [selectingEntranceFor, setSelectingEntranceFor] = useState(null); // State for entrance selection mode
  const [selectedBuildingForEntrance, setSelectedBuildingForEntrance] = useState(null); // State for the target building

  const cancelEntranceSelection = useCallback(() => {
    setSelectingEntranceFor(null);
    setSelectedBuildingForEntrance(null);
  }, []);

  const clearRoute = useCallback(() => {
    setStartPointState(null);
    setEndPointState(null);
    setRoute(null);
    setIsLoadingRoute(false);
    setRouteError(null);
    cancelEntranceSelection(); // Also cancel entrance selection if route is cleared
  }, [cancelEntranceSelection]);

  // Renamed internal state setters to avoid conflict
  const handleSetStartPoint = useCallback((point) => {
    setStartPointState(point);
    setRoute(null); // Clear previous route when start changes
    setRouteError(null);
    cancelEntranceSelection(); // Exit entrance selection mode
  }, [cancelEntranceSelection]);

  const handleSetEndPoint = useCallback((point) => {
    setEndPointState(point);
    setRoute(null); // Clear previous route when end changes
    setRouteError(null);
    cancelEntranceSelection(); // Exit entrance selection mode
  }, [cancelEntranceSelection]);


  // Use useMemo to stabilize the context value
  const value = useMemo(() => ({
    startPoint,
    endPoint,
    route,
    isLoadingRoute,
    routeError,
    selectingEntranceFor,
    selectedBuildingForEntrance,
    setStartPoint: handleSetStartPoint,
    setEndPoint: handleSetEndPoint,
    setRoute, // Allow internal setting
    setIsLoadingRoute,
    setRouteError,
    setSelectingEntranceFor, // Expose setter
    setSelectedBuildingForEntrance, // Expose setter
    clearRoute,
    cancelEntranceSelection, // Expose cancel helper
  }), [
      startPoint, endPoint, route, isLoadingRoute, routeError,
      selectingEntranceFor, selectedBuildingForEntrance,
      handleSetStartPoint, handleSetEndPoint, clearRoute, cancelEntranceSelection
  ]); // Add dependencies

  return (
    <RoutingContext.Provider value={value}>{children}</RoutingContext.Provider>
  );
};
