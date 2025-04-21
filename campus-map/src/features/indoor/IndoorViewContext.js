// src/mobile/contexts/IndoorViewContext.js
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
// --- Import the service functions ---
import { fetchIndoorBuildingData, fetchFloorPlan } from '../../services/mapService'; // Adjust path if needed

// --- Define the shape of the context data ---
const defaultIndoorViewContextValue = {
  selectedBuildingId: null,
  currentFloorLevel: null,
  availableFloors: [], // Array of { level: number, name: string, isDefault?: boolean }
  currentFloorGeoJSON: null, // GeoJSON object for the current floor
  isLoadingIndoorData: false,
  indoorDataError: null,
  selectBuildingForIndoorView: (buildingId) => {},
  setCurrentFloor: (floorLevel) => {},
  clearIndoorView: () => {},
};

// --- Create the Context ---
export const IndoorViewContext = createContext(defaultIndoorViewContextValue);

// --- Create the Provider Component ---
export const IndoorViewProvider = ({ children }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [currentFloorLevel, setCurrentFloorLevel] = useState(null);
  const [availableFloors, setAvailableFloors] = useState([]);
  const [currentFloorGeoJSON, setCurrentFloorGeoJSON] = useState(null);
  const [isLoadingIndoorData, setIsLoadingIndoorData] = useState(false);
  const [indoorDataError, setIndoorDataError] = useState(null);

  // --- Function to clear all indoor view state ---
  const clearIndoorView = useCallback(() => {
    console.log("Clearing indoor view state.");
    setSelectedBuildingId(null);
    setCurrentFloorLevel(null);
    setAvailableFloors([]);
    setCurrentFloorGeoJSON(null);
    setIsLoadingIndoorData(false);
    setIndoorDataError(null);
  }, []); // No dependencies needed as it only uses setters

  // --- Effect 1: Fetch Building Details & Initial Floor ---
  useEffect(() => {
    // Only run if a building ID is newly selected
    if (!selectedBuildingId) {
      return; // Do nothing if no building is selected
    }

    let isMounted = true; // Flag to prevent state updates on unmounted component

    const loadBuildingDetails = async () => {
      console.log(`Effect 1: Fetching details for building ${selectedBuildingId}`);
      // Use functional updates for setters if preferred, or add setters to deps
      setIsLoadingIndoorData(true);
      setIndoorDataError(null);
      setAvailableFloors([]);
      setCurrentFloorLevel(null);
      setCurrentFloorGeoJSON(null);

      try {
        const buildingData = await fetchIndoorBuildingData(selectedBuildingId);
        console.log('Received building data:', buildingData);

        if (!isMounted) return; // Check if component is still mounted

        // Ensure floors data exists and is an array
        if (!buildingData || !Array.isArray(buildingData.floors) || buildingData.floors.length === 0) {
          throw new Error("No floor information available for this building.");
        }

        // Sort floors by level (important for UI controls)
        const sortedFloors = [...buildingData.floors].sort((a, b) => a.level - b.level);
        setAvailableFloors(sortedFloors);

        // Determine the initial floor (default or first)
        const initialFloor = sortedFloors.find(f => f.isDefault) || sortedFloors[0];
        if (initialFloor) {
          console.log('Setting initial floor level:', initialFloor.level);
          // Set the current floor level - this will trigger Effect 2
          setCurrentFloorLevel(initialFloor.level);
        } else {
          throw new Error("Could not determine an initial floor.");
        }
        // Loading state will be set to false in Effect 2 after floor plan loads

      } catch (error) {
        console.error("Error fetching indoor building data:", error);
        if (isMounted) {
            setIndoorDataError(error.message || 'Failed to load building details.');
            setIsLoadingIndoorData(false);
            setSelectedBuildingId(null); // Clear selection on error
        }
      }
    };

    loadBuildingDetails();

    return () => {
        isMounted = false; // Cleanup function to set flag on unmount
    };
    // Dependency: Run when selectedBuildingId changes.
    // Add setters if ESLint requires, or disable the rule for this line.
  }, [selectedBuildingId /*, setIsLoadingIndoorData, setIndoorDataError, setAvailableFloors, setCurrentFloorLevel, setCurrentFloorGeoJSON, setSelectedBuildingId */]);

  // --- Effect 2: Fetch Specific Floor Plan GeoJSON ---
  useEffect(() => {
    // Only run if we have a selected building AND a target floor level
    if (!selectedBuildingId || currentFloorLevel === null || currentFloorLevel === undefined) {
      // If floor level becomes null (e.g., during building change), clear GeoJSON
      if (!currentFloorLevel) {
          setCurrentFloorGeoJSON(null);
      }
      return;
    }

    let isMounted = true; // Flag to prevent state updates on unmounted component

    const loadFloorPlan = async () => {
      console.log(`Effect 2: Fetching floor plan for building ${selectedBuildingId}, level ${currentFloorLevel}`);
      setIsLoadingIndoorData(true); // Still loading while fetching floor plan
      setIndoorDataError(null);
      setCurrentFloorGeoJSON(null); // Clear previous floor plan

      try {
        const floorGeoJsonData = await fetchFloorPlan(selectedBuildingId, currentFloorLevel);
        console.log('Received floor plan GeoJSON for level:', currentFloorLevel, floorGeoJsonData);
        if (isMounted) {
            setCurrentFloorGeoJSON(floorGeoJsonData);
        }
      } catch (error) {
        console.error(`Error fetching floor plan for level ${currentFloorLevel}:`, error);
        if (isMounted) {
            setIndoorDataError(error.message || `Failed to load floor plan for level ${currentFloorLevel}.`);
            setCurrentFloorGeoJSON(null); // Ensure GeoJSON is null on error
        }
      } finally {
        // Only set loading to false if the component is still mounted
        if (isMounted) {
            setIsLoadingIndoorData(false); // Loading finished (success or error)
        }
      }
    };

    loadFloorPlan();

    return () => {
        isMounted = false; // Cleanup function
    };
    // Dependencies: Run when selectedBuildingId or currentFloorLevel changes
    // Add setters if ESLint requires, or disable the rule for this line.
  }, [selectedBuildingId, currentFloorLevel /*, setIsLoadingIndoorData, setIndoorDataError, setCurrentFloorGeoJSON */]);

  // --- Function exposed to start the indoor view process ---
  const selectBuildingForIndoorView = useCallback((buildingId) => {
    // Basic check to prevent unnecessary state updates if already selected
    if (buildingId === selectedBuildingId) {
        console.log(`Building ${buildingId} is already selected.`);
        return;
    }
    console.log(`Action: Selecting building ${buildingId}`);
    // Setting the state here will trigger Effect 1
    setSelectedBuildingId(buildingId);
  }, [selectedBuildingId]); // Dependency on selectedBuildingId

  // --- Function exposed to change the current floor ---
  const setCurrentFloor = useCallback((floorLevel) => {
    // Basic check to prevent unnecessary state updates
    if (floorLevel === currentFloorLevel) {
        console.log(`Already on floor level ${floorLevel}.`);
        return;
    }
    console.log(`Action: Setting current floor to ${floorLevel}`);
    // Setting the state here will trigger Effect 2
    setCurrentFloorLevel(floorLevel);
  }, [currentFloorLevel]); // Dependency on currentFloorLevel

  // --- Assemble the context value ---
  const value = {
    selectedBuildingId,
    currentFloorLevel,
    availableFloors,
    currentFloorGeoJSON,
    isLoadingIndoorData,
    indoorDataError,
    selectBuildingForIndoorView, // Function to initiate
    setCurrentFloor,             // Function to change floor
    clearIndoorView,             // Function to exit
  };

  // --- Provide the context value to children ---
  return (
    <IndoorViewContext.Provider value={value}>
      {children}
    </IndoorViewContext.Provider>
  );
};

// --- Custom Hook for easy consumption ---
export const useIndoorView = () => {
  const context = useContext(IndoorViewContext);
  if (context === undefined) {
    throw new Error('useIndoorView must be used within an IndoorViewProvider');
  }
  return context;
};
