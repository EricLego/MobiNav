// src/mobile/contexts/UserLocationContext.js
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import useGeolocation, { isUserOnCampus } from '../hooks/useGeolocation';

// Define the shape of the context data
const defaultUserLocationContextValue = {
  userCoords: null, // { lat, lng, accuracy, timestamp } | null
  isOnCampus: false,
  isLocating: true,
  locationError: null,
  isGeolocationSupported: true,
  triggerLocationFetch: () => {}, // Function to manually trigger a location update
};

// Create the Context
export const UserLocationContext = createContext(defaultUserLocationContextValue);

// Create the Provider Component
export const UserLocationProvider = ({ children }) => {
  // Use the geolocation hook internally
  const {
    coords: fetchedCoords,
    isLocating: locatingFromHook,
    locationError,
    isSupported,
    getLocation // Get the function to trigger location fetching
  } = useGeolocation(); // Use default options or pass custom ones

  const [isOnCampus, setIsOnCampus] = useState(defaultUserLocationContextValue.isOnCampus);

  // Effect to check if user is on campus whenever coordinates change
  useEffect(() => {
    if (fetchedCoords) {
      const onCampusStatus = isUserOnCampus(fetchedCoords);
      console.log(`User coordinates updated: ${fetchedCoords.lat}, ${fetchedCoords.lng}. On Campus: ${onCampusStatus}`);
      setIsOnCampus(onCampusStatus);
    } else {
        // Only reset to false if we are NOT currently trying to locate
        // and there isn't an error that might be temporary.
        // If locatingFromHook is true, wait for coords or error.
        if (!locatingFromHook) {
             setIsOnCampus(false);
        }
    }
  }, [fetchedCoords, locatingFromHook]); // Dependency: run only when fetchedCoords changes

  // --- Optional: Trigger initial location fetch on mount ---
  // useEffect(() => {
  //   console.log("Attempting initial location fetch...");
  //   getLocation();
  // }, [getLocation]); // Dependency: getLocation function from the hook
  // -------------------------------------------------------

  // Assemble the context value using useMemo for stability
  const value = useMemo(() => ({
    userCoords: fetchedCoords, // Expose the coordinates from the hook
    isOnCampus,
    isLocating: locatingFromHook,
    locationError,
    isGeolocationSupported: isSupported,
    triggerLocationFetch: getLocation // Expose the function to manually fetch
  }), [fetchedCoords, isOnCampus, locatingFromHook, locationError, isSupported, getLocation]);

  return (
    <UserLocationContext.Provider value={value}>
      {children}
    </UserLocationContext.Provider>
  );
};

// Custom hook for easy consumption
export const useUserLocation = () => {
  const context = useContext(UserLocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a UserLocationProvider');
  }
  return context;
};
