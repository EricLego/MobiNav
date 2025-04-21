// src/mobile/hooks/useIndoorData.js
import { useEffect, useContext } from 'react';
import { IndoorViewContext } from './IndoorViewContext';
// Assume mapService will eventually have this function
import { fetchIndoorData } from '../../services/mapService';

export const useIndoorData = () => {
  const {
    selectedBuildingId,
    setIsLoadingIndoorData,
    setIndoorMapData,
    setAvailableFloors,
    setCurrentFloor,
    setIndoorDataError,
    clearIndoorView, // Use this if fetch fails for the selected building
  } = useContext(IndoorViewContext);

  useEffect(() => {
    // Only fetch if a building is selected
    if (!selectedBuildingId) {
      // Ensure data is cleared if building is deselected externally
      // (clearIndoorView handles this, but good for robustness)
      setIndoorMapData(null);
      setAvailableFloors([]);
      setCurrentFloor(null);
      setIndoorDataError(null);
      setIsLoadingIndoorData(false);
      return;
    }

    const loadData = async () => {
      setIsLoadingIndoorData(true);
      setIndoorMapData(null); // Clear previous data
      setAvailableFloors([]);
      setCurrentFloor(null);
      setIndoorDataError(null);

      try {
        console.log(`Fetching indoor data for building: ${selectedBuildingId}`);
        // --- Placeholder for actual API call ---
        // const data = await fetchIndoorData(selectedBuildingId);
        // --- Replace with actual fetch ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const data = { // Mock data structure
            buildingId: selectedBuildingId,
            floors: [
                { level: 0, name: 'Ground Floor', mapFeatures: { /* GeoJSON or other data */ } },
                { level: 1, name: 'First Floor', mapFeatures: { /* GeoJSON or other data */ } },
            ],
            defaultFloorLevel: 0, // Or maybe the API tells us the default
        };
        // --- End Placeholder ---

        if (!data || !data.floors || data.floors.length === 0) {
            throw new Error('No indoor data available for this building.');
        }

        const availableFloorsData = data.floors.map(f => ({ level: f.level, name: f.name }));
        const defaultFloor = data.floors.find(f => f.level === data.defaultFloorLevel) || data.floors[0];

        setAvailableFloors(availableFloorsData);
        setCurrentFloor(defaultFloor.level); // Set the default floor
        setIndoorMapData(data); // Store the whole structure for now, maybe refine later
        setIndoorDataError(null);

      } catch (error) {
        console.error("Failed to fetch indoor data:", error);
        setIndoorDataError(error.message || 'Failed to load indoor map.');
        // Optional: Clear selection if data fetch fails completely
        // clearIndoorView();
      } finally {
        setIsLoadingIndoorData(false);
      }
    };

    loadData();

    // Dependency array: Re-run effect if selectedBuildingId changes
  }, [selectedBuildingId, setIsLoadingIndoorData, setIndoorMapData, setAvailableFloors, setCurrentFloor, setIndoorDataError, clearIndoorView]);

  // This hook doesn't need to return anything, it just triggers effects
  // based on context changes.
};
