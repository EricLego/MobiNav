// src/hooks/useSearch.js
import { useContext, useEffect, useCallback } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import { fetchGooglePlacesSuggestions } from '../../../services/mapService';
import useBuildings from '../../data/hooks/useBuildings';

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
    setSearchError,
  } = useContext(SearchContext);

  const { buildings, isLoading: isLoadingBuildings, error:buildingsError } = useBuildings();

  // Effect to handle errors from useBuildings loading impacting search
  useEffect(() => {
    if (buildingsError && searchProvider === 'local') {
        // If we are trying local search but buildings failed to load, set an error
        setSearchError('Failed to load building data for search.');
    }
    // Clear error if building data loads successfully later? Or handled by performSearch start?
  }, [buildingsError, searchProvider, setSearchError]);



  // The actual search logic function
  const performSearch = useCallback(async (query) => {
    setSearchError(null); // Clear any previous error
    if (!query) {
      setLocalResults([]);
      setGoogleResults([]);
      setIsLoadingSearch(false);
      return;
    }

    // Don't start search if required data is still loading
    if (searchProvider === 'local' && isLoadingBuildings) {
        console.log("Waiting for buildings to load...");
        setIsLoadingSearch(true); // Indicate loading state
        return; // Exit early
    }

    setIsLoadingSearch(true);
    console.log(`Executing search via hook for "${query}" using ${searchProvider}...`);

    try {
      if (searchProvider === 'local') {

        // Check again for building data error now that loading is done
        if (buildingsError) {
            throw new Error('Building data unavailable.');
        }

        // Filter local buildings
        const filtered = buildings.filter(b =>
          b.name.toLowerCase().includes(query.toLowerCase())
        );
        setLocalResults(filtered);
        setGoogleResults([]);
      } else {
        
        // --- Call Google Places Autocomplete Service ---
        // Define campus bounds (optional but recommended for biasing)
        const campusBoundsLiteral = {
            north: 33.941486,
            south: 33.935673,
            east: -84.512786,
            west: -84.524504
        };
        const results = await fetchGooglePlacesSuggestions(query, campusBoundsLiteral);
        // ---------------------------------------------
        setGoogleResults(results); // These are predictions, likely without lat/lng
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
  }, [searchProvider, buildings, isLoadingBuildings, buildingsError, setLocalResults, setGoogleResults, setIsLoadingSearch, setSearchError]);

  // Debounced version of the search function
  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  // Effect to trigger search when query changes (debounced)
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // This hook primarily manages side effects based on context changes
  return {}; // Doesn't need to return anything for SearchBar to use
};

export default useSearch;
