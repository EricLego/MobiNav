// src/mobile/hooks/useRouting.js
import { useContext, useCallback, useEffect } from 'react';
import { RoutingContext } from '../context/RoutingContext';
import { fetchRoute } from '../../../services/mapService'; // Import the API call function
import { MapContext } from '../../map/contexts/MapContext';
// Import AccessibilityContext later when needed
// import { AccessibilityContext } from '../../App';

const useRouting = () => {
  const {
    startPoint,
    endPoint,
    route,
    setRoute,
    setIsLoadingRoute,
    setRouteError,
    setStartPoint, // Expose setters if needed directly
    setEndPoint,   // Expose setters if needed directly
    clearRoute,    // Expose clear function
    setSelectingEntranceFor,
    setSelectedBuildingForEntrance,
  } = useContext(RoutingContext);

  const { mapRef } = useContext(MapContext);

  // Get accessibility settings later
  // const { accessibilitySettings } = useContext(AccessibilityContext);
  const startSelect = useCallback((buildingMarker) => {
    if (!mapRef.current) {
        console.warn("Map not ready for panning.");
        return;
    }
    if (!buildingMarker || typeof buildingMarker.lat !== 'number' || typeof buildingMarker.lng !== 'number') {
        console.warn("Invalid building marker data for startSelect:", buildingMarker);
        return;
    }

    console.log("Initiating START entrance selection for:", buildingMarker.name);
    // 1. Pan map to the building
    mapRef.current.panTo({ lat: buildingMarker.lat, lng: buildingMarker.lng });
    // Optional: Zoom in closer?
    // mapRef.current.setZoom(18); // Adjust zoom level as needed

    // 2. Set the state to indicate we are selecting an ENTRANCE for the START point
    setSelectedBuildingForEntrance(buildingMarker); // Store the building info
    setSelectingEntranceFor('start'); // Set the mode

    // Clear any existing start point *without* triggering route calculation yet
    // Use the internal state setter directly if needed, or adjust context logic
    // For now, setting the mode implies the user needs to pick a new point.
    // If a start point already exists, setting selectingEntranceFor='start' should
    // signal that it will be replaced.

  }, [mapRef, setSelectingEntranceFor, setSelectedBuildingForEntrance]); // Add dependencies

  // --- NEW: endSelect Implementation ---
  const endSelect = useCallback((buildingMarker) => {
    if (!mapRef.current) {
        console.warn("Map not ready for panning.");
        return;
    }
     if (!buildingMarker || typeof buildingMarker.lat !== 'number' || typeof buildingMarker.lng !== 'number') {
        console.warn("Invalid building marker data for endSelect:", buildingMarker);
        return;
    }

    console.log("Initiating END entrance selection for:", buildingMarker.name);
    // 1. Pan map to the building
    mapRef.current.panTo({ lat: buildingMarker.lat, lng: buildingMarker.lng });
    // Optional: Zoom in closer?
    // mapRef.current.setZoom(18);

    // 2. Set the state to indicate we are selecting an ENTRANCE for the END point
    setSelectedBuildingForEntrance(buildingMarker); // Store the building info
    setSelectingEntranceFor('end'); // Set the mode

  }, [mapRef, setSelectingEntranceFor, setSelectedBuildingForEntrance]); // Add dependencies

  
  const executeRouteCalculation = useCallback(async () => {
    // Check added here as well for safety, though effect below should guard
    if (!startPoint || !startPoint.lat || !startPoint.lng ||
        !endPoint || !endPoint.lat || !endPoint.lng) {
      // Don't set error here, just prevent unnecessary calls
      return;
    }

    console.log("Attempting to calculate route...");
    setIsLoadingRoute(true);
    setRouteError(null);
    setRoute(null); // Clear previous route before fetching new one

    try {
      // --- Prepare accessibility parameters (Placeholder) ---
      const accessibilityParams = {
        // Example: Get from context later
        // avoidStairs: accessibilitySettings?.avoidStairs || false,
        // profile: accessibilitySettings?.avoidStairs ? 'foot-accessible' : 'foot' // Example logic
      };
      // ----------------------------------------------------

      console.log("Fetching route with params:", { startPoint, endPoint, accessibilityParams });

      const routeData = await fetchRoute(
        { lat: startPoint.lat, lng: startPoint.lng },
        { lat: endPoint.lat, lng: endPoint.lng },
        accessibilityParams // Pass accessibility preferences
      );

      console.log("Route data received:", routeData);
      // TODO: Process routeData if needed (e.g., decode polyline)
      setRoute(routeData); // Update context with the fetched route

    } catch (error) {
      console.error("Failed to calculate route:", error);
      setRouteError(error);
      setRoute(null);
    } finally {
      setIsLoadingRoute(false);
    }
    // Dependencies now include accessibilitySettings when added
  }, [startPoint, endPoint, /* accessibilitySettings, */ setIsLoadingRoute, setRouteError, setRoute]);

  // --- Effect to trigger calculation automatically ---
  useEffect(() => {
    // Check if both points are valid and we don't already have a route for these points
    if (startPoint && startPoint.lat && startPoint.lng &&
        endPoint && endPoint.lat && endPoint.lng &&
        !route // Only calculate if route is currently null
        ) {
      executeRouteCalculation();
    }
    // This effect runs whenever startPoint or endPoint changes
  }, [startPoint, endPoint, route, executeRouteCalculation]);
  // --- End Auto-trigger Effect ---

  // Return state and functions needed by components
  return {
    startPoint,
    endPoint,
    startSelect,
    endSelect, 
    calculateRoute: executeRouteCalculation, // Function to trigger calculation
    clearRoute,     // Function to clear points and route
    // Expose route, isLoadingRoute, routeError if components need them directly
    // route,
    // isLoadingRoute,
    // routeError,
  };
};

export default useRouting;
