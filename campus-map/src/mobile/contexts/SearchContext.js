// src/contexts/SearchContext.js
import React, { createContext, useState, useCallback } from 'react';

// Define the shape of the context data
const defaultSearchContextValue = {
  searchQuery: '',
  localResults: [],
  googleResults: [],
  isLoadingSearch: false,
  selectedSearchResult: null,
  searchProvider: 'local', // 'local' or 'google'
  setSearchQuery: () => {},
  executeSearch: async () => {}, // Placeholder for the search function
  clearSearch: () => {},
  setSelectedSearchResult: () => {},
  setSearchProvider: () => {},
};

export const SearchContext = createContext(defaultSearchContextValue);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localResults, setLocalResults] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [searchProvider, setSearchProvider] = useState('local'); // Default to local

  // --- Placeholder Search Logic (to be moved to useSearch hook later) ---
  const executeSearch = useCallback(async () => {
    if (!searchQuery) {
      setLocalResults([]);
      setGoogleResults([]);
      return;
    }
    setIsLoadingSearch(true);
    console.log(`Searching for "${searchQuery}" using ${searchProvider}...`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    if (searchProvider === 'local') {
      // Simulate filtering local buildings
      const buildings = [ // Replace with actual data source later
          { id: 'bldg_q', name: 'Engineering Technology Center (Q)', lat: 33.9395, lng: -84.5190, type: 'building' },
          { id: 'bldg_j', name: 'Joe Mack Wilson Student Center (J)', lat: 33.9380, lng: -84.5180, type: 'building' },
          { id: 'bldg_h', name: 'Design II (H)', lat: 33.9398, lng: -84.5198, type: 'building' },
      ];
      const filtered = buildings.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setLocalResults(filtered);
      setGoogleResults([]); // Clear other results
    } else {
      // Simulate Google Places results
      const googlePlaces = [
          { id: 'gp_1', name: `Google Result for ${searchQuery} 1`, lat: 33.9400, lng: -84.5200, type: 'google' },
          { id: 'gp_2', name: `Google Result for ${searchQuery} 2`, lat: 33.9375, lng: -84.5175, type: 'google' },
      ];
      setGoogleResults(googlePlaces);
      setLocalResults([]); // Clear other results
    }

    setIsLoadingSearch(false);
  }, [searchQuery, searchProvider]);
  // --- End Placeholder Search Logic ---

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setLocalResults([]);
    setGoogleResults([]);
    setSelectedSearchResult(null);
    setIsLoadingSearch(false);
  }, []);

  const handleSetSearchQuery = useCallback((query) => {
    setSearchQuery(query);
    // Optionally trigger search automatically or require explicit button press
    // executeSearch(); // Example: Trigger search on query change (debouncing recommended)
  }, []);


  const value = {
    searchQuery,
    localResults,
    googleResults,
    isLoadingSearch,
    selectedSearchResult,
    searchProvider,
    setSearchQuery: handleSetSearchQuery,
    executeSearch, // Provide the (placeholder) function
    clearSearch,
    setSelectedSearchResult,
    setSearchProvider,
    setLocalResults,
    setGoogleResults,
    setIsLoadingSearch, // Include this one too, as useSearch uses it
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
