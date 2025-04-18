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
  searchError: null,
  setSearchQuery: () => {},
  clearSearch: () => {},
  setSelectedSearchResult: () => {},
  setSearchProvider: () => {},
  setLocalResults: () => {},
  setGoogleResults: () => {},
  setIsLoadingSearch: () => {},
  setSearchError: () => {},
};

export const SearchContext = createContext(defaultSearchContextValue);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [localResults, setLocalResults] = useState([]);
  const [googleResults, setGoogleResults] = useState([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);
  const [searchProvider, setSearchProvider] = useState('local'); // Default to local
  const [searchError, setSearchError] = useState(null);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setLocalResults([]);
    setGoogleResults([]);
    setSelectedSearchResult(null);
    setIsLoadingSearch(false);
    setSearchError(null);
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
    searchError,
    setSearchQuery: handleSetSearchQuery,
    clearSearch,
    setSelectedSearchResult,
    setSearchProvider,
    setLocalResults,
    setGoogleResults,
    setIsLoadingSearch, // Include this one too, as useSearch uses it
    setSearchError,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
