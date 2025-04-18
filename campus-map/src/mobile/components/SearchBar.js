// src/components/SearchBar.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import useSearch from '../hooks/useSearch'; // Import the hook to trigger search logic
import '../styles/SearchBar.css'; // Create this CSS file

const SearchBar = () => {
  const {
    searchQuery,
    localResults,
    googleResults,
    isLoadingSearch,
    selectedSearchResult,
    searchProvider,
    setSearchQuery,
    clearSearch,
    setSelectedSearchResult,
    setSearchProvider,
  } = useContext(SearchContext);

  // Initialize the useSearch hook to handle the search logic execution
  useSearch();

  const resultsContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
    if (event.target.value) {
        setIsResultsVisible(true); // Show results when typing
    } else {
        setIsResultsVisible(false); // Hide when empty
    }
  };

  const handleResultClick = (result) => {
    console.log("Selected:", result);
    setSelectedSearchResult(result);
    setSearchQuery(result.name); // Update input field to show selected name
    setIsResultsVisible(false); // Hide results after selection
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

      {isResultsVisible && (searchQuery || isLoadingSearch || results.length > 0) && (
        <div className="search-results">
          {isLoadingSearch && <div className="loading-indicator">Searching...</div>}
          {!isLoadingSearch && results.length === 0 && searchQuery && (
            <div className="no-results">No results found.</div>
          )}
          {!isLoadingSearch && results.length > 0 && (
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
