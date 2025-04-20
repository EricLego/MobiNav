// src/components/SearchBar.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import { MapContext } from '../contexts/MapContext';
import useSearch from '../hooks/useSearch'; // Import the hook to trigger search logic
import { fetchPlaceDetails } from '../services/mapService';
import '../styles/SearchBar.css'; // Create this CSS file

const SearchBar = () => {
  const {
    searchQuery,
    localResults,
    googleResults,
    isLoadingSearch,
    searchProvider,
    searchError,
    setSearchQuery,
    clearSearch,
    setSelectedSearchResult,
    setSearchProvider,
    setSearchError,
  } = useContext(SearchContext);
  const { mapRef } = useContext(MapContext);

  // Initialize the useSearch hook to handle the search logic execution
  useSearch();

  const resultsContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // <-- Declare state here

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value) {
        setIsResultsVisible(true); // Show results when typing
    } else {
        setIsResultsVisible(false); // Hide when empty
    }
  };

  const handleResultClick = async (result) => {
    setIsResultsVisible(false); // Hide results
    setSearchQuery(result.name); // Update input field visually

    // --- Clear previous selection immediately for better UX ---
    // This prevents the map trying to render the old selection while details load
    setSelectedSearchResult(null);
    // ---------------------------------------------------------

    if (result.type === 'google') {
      // It's a Google prediction, fetch full details
      if (!result.id) {
        console.error("Google prediction missing place_id:", result);
        setSearchError("Selected result is invalid.");
        return;
      }
      if (!mapRef.current) {
          console.error("Map instance not available for fetching place details.");
          setSearchError("Map not ready for details lookup.");
          return;
      }

      setIsLoadingDetails(true);
      setSearchError(null); // Clear previous errors
      try {
        // --- Fetch details ---
        const placeDetails = await fetchPlaceDetails(result.id, mapRef.current);
        console.log("Fetched Place Details:", placeDetails);

        // --- Update context ONLY AFTER details are fetched ---
        setSelectedSearchResult(placeDetails);

      } catch (error) {
        console.error("Failed to fetch place details:", error);
        setSearchError(error.message || "Failed to get location details.");
        setSelectedSearchResult(null); // Ensure selection is cleared on error
      } finally {
        setIsLoadingDetails(false);
      }
    } else {
      // It's a local result (building), update context directly
      console.log("Selected Local Result:", result);
      setSearchError(null); // Clear any previous errors
      setSelectedSearchResult(result); // Local results already have lat/lng
    }
  };


  const handleClear = () => {
    clearSearch();
    setIsResultsVisible(false);
    if (inputRef.current) {
        inputRef.current.focus(); // Keep focus on input after clearing
    }
  };

  const handleProviderToggle = () => {
    setSearchProvider(prev => prev === 'local' ? 'google' : 'local');
    // Optionally clear results or re-trigger search on provider change
    clearSearch(); // Clear previous results
  };

   // Close results if clicked outside
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsContainerRef.current && !resultsContainerRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsResultsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = searchProvider === 'local' ? localResults : googleResults;

  return (
    <div className="search-bar-container" ref={resultsContainerRef}>
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Search ${searchProvider === 'local' ? 'Campus Buildings' : 'Google Maps'}...`}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery && setIsResultsVisible(true)} // Show results on focus if there's a query
          className="search-input"
          aria-label="Search locations"
        />
        {/* Optional: Show details loading indicator */}
        {isLoadingDetails && <span className="details-loading"> L </span>}
        {searchQuery && (
          <button onClick={handleClear} className="clear-button" aria-label="Clear search">×</button>
        )}
         <button
            onClick={handleProviderToggle}
            className="provider-toggle-button"
            title={`Switch to ${searchProvider === 'local' ? 'Google' : 'Local'} Search`}
            aria-label={`Switch to ${searchProvider === 'local' ? 'Google' : 'Local'} Search`}
          >
            {searchProvider === 'local' ? '🏢' : '🌍'}
          </button>
      </div>

      {isResultsVisible && (isLoadingSearch || results.length > 0 || searchError) && (
        <div className="search-results">
          {isLoadingSearch && <div className="loading-indicator">Searching...</div>}
          {searchError && <div className="search-error">Error: {searchError}</div>}
          {!isLoadingSearch && !searchError && results.length === 0 && searchQuery && (
            <div className="no-results">No results found.</div>
          )}
          {!isLoadingSearch && !searchError && results.length > 0 && (
            <ul>
              {results.map((result) => (
                <li key={result.id} onClick={() => handleResultClick(result)}>
                  {result.name}
                  {/* Optionally add more details like address */}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
