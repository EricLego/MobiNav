// src/hooks/useIndoorView.js (New or Refactored)
import { useState, useCallback } from 'react';
// Assume mapService.js exists and has fetchBuildingData
// import { fetchBuildingData } from '../services/mapService';

const defaultViewpoint = {
  center: { lat: 33.9386, lng: -84.5187 }, // Default campus center
  zoom: 16, // Default campus zoom
  tilt: 0,
  heading: 0,
};

const useIndoorView = () => {
  const [indoorViewActive, setIndoorViewActive] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [floorOptions, setFloorOptions] = useState([]);
  const [desiredMapViewpoint, setDesiredMapViewpoint] = useState(defaultViewpoint);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch data and activate the view
  const activateIndoorView = useCallback(async (buildingId) => {
    setIsLoading(true);
    setError(null);
    try {
      // const buildingData = await fetchBuildingData(buildingId); // Call service
      // --- Mock Data for Example ---
      const mockBuildingData = {
        id: buildingId,
        name: 'Engineering Tech Center (Q)',
        floors: [
          { number: 1, name: 'Ground Floor', mapImage: '/indoor-maps/q/1.png', viewpoint: { center: { lat: 33.9395, lng: -84.5190 }, zoom: 20, tilt: 45, heading: 0 } },
          { number: 2, name: 'Second Floor', mapImage: '/indoor-maps/q/2.png', viewpoint: { center: { lat: 33.9395, lng: -84.5190 }, zoom: 20, tilt: 45, heading: 0 } },
          // Add more floors
        ],
        // Default viewpoint if no floor is selected initially or floor has no specific viewpoint
        defaultViewpoint: { center: { lat: 33.9395, lng: -84.5190 }, zoom: 19, tilt: 0, heading: 0 }
      };
      const buildingData = mockBuildingData; // Use mock data
      // --- End Mock Data ---

      if (buildingData && buildingData.floors && buildingData.floors.length > 0) {
        setSelectedBuilding(buildingData);
        const initialFloor = buildingData.floors[0];
        setFloorOptions(buildingData.floors);
        setCurrentFloor(initialFloor.number);
        // Set the desired viewpoint based on the initial floor or building default
        setDesiredMapViewpoint(initialFloor.viewpoint || buildingData.defaultViewpoint || defaultViewpoint);
        setIndoorViewActive(true);
      } else {
        throw new Error("Building data or floors not found.");
      }
    } catch (err) {
      console.error("Error activating indoor view:", err);
      setError(err.message || "Could not load indoor view.");
      // Reset state on error
      setIndoorViewActive(false);
      setSelectedBuilding(null);
      setCurrentFloor(null);
      setDesiredMapViewpoint(defaultViewpoint); // Reset viewpoint
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies: fetchBuildingData if imported

  // Function to change the floor
  const changeFloor = useCallback((floorNumber) => {
    if (!selectedBuilding) return;
    const floorData = selectedBuilding.floors.find(f => f.number === floorNumber);
    if (floorData) {
      setCurrentFloor(floorNumber);
      // Update viewpoint based on the new floor or building default
      setDesiredMapViewpoint(floorData.viewpoint || selectedBuilding.defaultViewpoint || defaultViewpoint);
    }
  }, [selectedBuilding]);

  // Function to deactivate the view
  const deactivateIndoorView = useCallback(() => {
    setIndoorViewActive(false);
    setSelectedBuilding(null);
    setCurrentFloor(null);
    // Reset viewpoint to default campus view when closing
    setDesiredMapViewpoint(defaultViewpoint);
    setError(null);
  }, []);

  return {
    indoorViewActive,
    selectedBuilding,
    currentFloor,
    floorOptions,
    desiredMapViewpoint,
    isLoading,
    error,
    activateIndoorView,
    changeFloor,
    deactivateIndoorView,
  };
};

export default useIndoorView;
