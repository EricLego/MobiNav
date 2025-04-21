// src/features/parking/hooks/useParking.js
import { useState, useEffect, useCallback } from 'react';
// Import the actual service
import { fetchParkingLots } from '../../../services/parkingService'; // Adjust path if needed
// Potentially interact with other contexts (keep commented for now)
// import { MapContext } from '../../map/contexts/MapContext';
// import { RoutingContext } from '../../routing/context/RoutingContext';
// import { UserLocationContext } from '../../location/UserLocationContext';

const useParking = () => {
  const [allLots, setAllLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example context usage (uncomment and adapt if needed)
  // const { focusMapOnCoords } = useContext(MapContext);
  // const { setDestination } = useContext(RoutingContext);
  // const { userLocation } = useContext(UserLocationContext);

  // Fetch initial data from the backend
  const fetchParkingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch from the service
      const data = await fetchParkingLots();

      // Map backend data structure to the structure expected by the hook/components
      const mappedData = data.map(lot => ({
        id: lot.lot_id, // Use lot_id from backend as id
        name: lot.name,
        coords: {
          lat: lot.latitude, // Map latitude to coords.lat
          lng: lot.longitude // Map longitude to coords.lng
        },
        permits: lot.permits || [], // Ensure permits is always an array
        capacity: lot.capacity,
        // Include other fields if needed
      }));

      setAllLots(mappedData);
      setFilteredLots(mappedData); // Show all initially
    } catch (err) {
      console.error("Failed to fetch parking data:", err);
      // Use the error message from the service if available
      setError(err.message || 'Could not load parking information.');
      setAllLots([]);
      setFilteredLots([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParkingData();
  }, [fetchParkingData]);

  // Filter logic (should work as is with the 'permits' array)
  const filterByPermit = useCallback((permitType) => {
    // Normalize permit types for comparison (optional but safer)
    const normalizedPermitType = permitType.toLowerCase();

    if (!permitType || normalizedPermitType === 'all') {
      setFilteredLots(allLots);
    } else {
      setFilteredLots(
        allLots.filter(lot =>
          // Check if any permit in the lot's array matches (case-insensitive)
          lot.permits.some(p => p.toLowerCase() === normalizedPermitType)
        )
      );
    }
    setSelectedLot(null); // Reset selection when filter changes
  }, [allLots]);

  // Selection logic (uses the mapped 'id' and 'coords')
  const selectLot = useCallback((lotId) => {
    const lot = allLots.find(l => l.id === lotId) || null;
    setSelectedLot(lot);

    // Example: Focus map on selected lot
    // if (lot && focusMapOnCoords) {
    //   focusMapOnCoords(lot.coords);
    // }
  }, [allLots /*, focusMapOnCoords */]);

  // Function to potentially set a lot as a routing destination
  const setLotAsDestination = useCallback(() => {
    // if (selectedLot && setDestination) {
    //   // Ensure you pass the correct structure expected by setDestination
    //   setDestination({ name: selectedLot.name, location: selectedLot.coords });
    // }
  }, [selectedLot /*, setDestination */]);


  return {
    parkingLots: filteredLots, // Component uses the filtered list
    selectedLot,
    isLoading,
    error,
    filterByPermit, // Pass the filtering function
    selectLot,
    setLotAsDestination, // Expose action
    fetchParkingData, // Allow manual refresh
  };
};

export default useParking;
