import { useState, useEffect, useCallback, useContext } from 'react';
// Assuming a service exists to fetch data
// import parkingService from '../../services/parkingService';
// Potentially interact with other contexts
// import { MapContext } from '../map/MapContext';
// import { RoutingContext } from '../routing/context/RoutingContext';
// import { UserLocationContext } from '../location/UserLocationContext';

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

  // Fetch initial data
  const fetchParkingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // const data = await parkingService.getParkingLots();
      // Placeholder data:
      const data = [
        { id: 'p1', name: 'East Deck', coords: { lat: 34.037, lng: -84.584 }, permits: ['Student', 'Visitor'], capacity: 500 },
        { id: 'p2', name: 'Central Deck', coords: { lat: 34.036, lng: -84.581 }, permits: ['Faculty/Staff'], capacity: 300 },
        // ... more lots
      ];
      setAllLots(data);
      setFilteredLots(data); // Show all initially
    } catch (err) {
      console.error("Failed to fetch parking data:", err);
      setError('Could not load parking information.');
      setAllLots([]);
      setFilteredLots([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParkingData();
  }, [fetchParkingData]);

  // Filter logic
  const filterByPermit = useCallback((permitType) => {
    if (!permitType || permitType === 'All') {
      setFilteredLots(allLots);
    } else {
      setFilteredLots(
        allLots.filter(lot => lot.permits.includes(permitType))
      );
    }
    setSelectedLot(null); // Reset selection when filter changes
  }, [allLots]);

  // Selection logic
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
    //   setDestination({ name: selectedLot.name, location: selectedLot.coords });
    // }
  }, [selectedLot /*, setDestination */]);


  return {
    parkingLots: filteredLots, // Component uses the filtered list
    selectedLot,
    isLoading,
    error,
    filterByPermit,
    selectLot,
    setLotAsDestination, // Expose action
    fetchParkingData, // Allow manual refresh
  };
};

export default useParking;
