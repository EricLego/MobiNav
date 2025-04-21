// src/features/obstacles/contexts/ObstacleContext.js
import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
import useObstacles from '../hooks/useObstacles'; // Adjust path if needed

// --- Define the shape of the context data ---
const defaultObstacleContextValue = {
  // Data from useObstacles hook
  obstacles: [],
  isLoadingObstacles: true,
  obstacleError: null,
  // State managed by the context for UI controls
  filter: 'all', // 'all', 'pending', 'resolved' (matches ObstacleReports)
  sortBy: 'date', // 'date', 'severity', 'votes' (matches ObstacleReports)
  selectedObstacle: null, // For potential detail views
  // Actions (Setters)
  setFilter: () => {},
  setSortBy: () => {},
  setSelectedObstacle: () => {},
  // Potentially add actions later for reporting, updating, etc.
};

// --- Create the Context ---
export const ObstacleContext = createContext(defaultObstacleContextValue);

// --- Create the Provider Component ---
export const ObstacleProvider = ({ children }) => {
  // --- Get obstacle data from the dedicated hook ---
  const {
    obstacles: fetchedObstacles,
    isLoading: isLoadingObstacles,
    error: obstacleError
  } = useObstacles();

  // --- State for UI controls (filtering, sorting, selection) ---
  const [filter, setFilter] = useState(defaultObstacleContextValue.filter);
  const [sortBy, setSortBy] = useState(defaultObstacleContextValue.sortBy);
  const [selectedObstacle, setSelectedObstacle] = useState(defaultObstacleContextValue.selectedObstacle);

  // --- Memoized Actions ---
  const handleSetFilter = useCallback((newFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSetSortBy = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  const handleSetSelectedObstacle = useCallback((obstacle) => {
    setSelectedObstacle(obstacle);
  }, []);

  // --- Assemble the context value ---
  // Use useMemo to prevent unnecessary re-renders of consumers
  // if the context value object itself hasn't changed identity.
  const value = useMemo(() => ({
    // Data from hook
    obstacles: fetchedObstacles,
    isLoadingObstacles,
    obstacleError,
    // UI State
    filter,
    sortBy,
    selectedObstacle,
    // Actions
    setFilter: handleSetFilter,
    setSortBy: handleSetSortBy,
    setSelectedObstacle: handleSetSelectedObstacle,
  }), [
    fetchedObstacles,
    isLoadingObstacles,
    obstacleError,
    filter,
    sortBy,
    selectedObstacle,
    handleSetFilter,
    handleSetSortBy,
    handleSetSelectedObstacle
  ]);

  // --- Provide the context value to children ---
  return (
    <ObstacleContext.Provider value={value}>
      {children}
    </ObstacleContext.Provider>
  );
};

// --- Custom Hook for easy consumption ---
export const useObstacleContext = () => {
  const context = useContext(ObstacleContext);
  if (context === undefined) {
    throw new Error('useObstacleContext must be used within an ObstacleProvider');
  }
  return context;
};
