// src/hooks/useSearch.js
import { useContext, useEffect, useCallback } from 'react';
import { SearchContext } from '../contexts/SearchContext';
// import { mapService } from '../services/mapService'; // Import service later
// import { googleMapsService } from '../services/googleMapsService'; // Import service later
// import useBuildings from './useBuildings'; // Hook to get local building list

// Debounce utility (simple version)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};


const useSearch = () => {
  const {
    searchQuery,
    searchProvider,
    setLocalResults, // Need setters from context
    setGoogleResults,
    setIsLoadingSearch,
  } = useContext(SearchContext);

  // --- Get local building data (Example using a hypothetical useBuildings hook) ---
  // const { buildings, isLoading: isLoadingBuildings } = useBuildings();
  const buildings = [ // Placeholder data
      { id: 'bldg_q', name: 'Engineering Technology Center (Q)', lat: 33.9395, lng: -84.5190, type: 'building' },
      { id: 'bldg_j', name: 'Joe Mack Wilson Student Center (J)', lat: 33.9380, lng: -84.5180, type: 'building' },
      { id: 'bldg_h', name: 'Design II (H)', lat: 33.9398, lng: -84.5198, type: 'building' },
  ];
  const isLoadingBuildings = false;
  // --- End Placeholder ---


  // The actual search logic function
  const performSearch = useCallback(async (query) => {
    if (!query) {
      setLocalResults([]);
      setGoogleResults([]);
      setIsLoadingSearch(false);
      return;
    }

    setIsLoadingSearch(true);
    console.log(`Executing search via hook for "${query}" using ${searchProvider}...`);

    try {
      if (searchProvider === 'local') {
        if (isLoadingBuildings) {
            console.log("Waiting for buildings to load...");
            // Optionally handle loading state better
            return;
        }
        // Filter local buildings
        const filtered = buildings.filter(b =>
          b.name.toLowerCase().includes(query.toLowerCase())
        );
        setLocalResults(filtered);
        setGoogleResults([]);
      } else {
        // Call Google Places Autocomplete service
        // const results = await googleMapsService.fetchAutocompleteSuggestions(query);
        const results = [ // Placeholder Google results
            { id: `gp_${query}_1`, name: `Google: ${query} Place 1`, lat: 33.9400, lng: -84.5200, type: 'google' },
            { id: `gp_${query}_2`, name: `Google: ${query} Place 2`, lat: 33.9375, lng: -84.5175, type: 'google' },
        ];
        setGoogleResults(results);
        setLocalResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setLocalResults([]);
      setGoogleResults([]);
      // Handle error state in context if needed
    } finally {
      setIsLoadingSearch(false);
    }
  }, [searchProvider, buildings, isLoadingBuildings, setLocalResults, setGoogleResults, setIsLoadingSearch]);

  // Debounced version of the search function
  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  // Effect to trigger search when query changes (debounced)
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // The hook itself doesn't need to return much if it just updates context
  // It primarily encapsulates the search side effect logic.
  // We could return the 'performSearch' function if needed elsewhere.
  return { performSearch };
};

export default useSearch;
