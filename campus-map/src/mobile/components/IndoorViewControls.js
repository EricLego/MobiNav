// src/mobile/components/IndoorViewControls.js
import React, { useMemo } from 'react';
import { useIndoorView } from '../contexts/IndoorViewContext'; // Use the custom hook
// You'll likely need some basic styling
import '../styles/IndoorViewControls.css'; // Assuming you create this

const IndoorViewControls = () => {
  const {
    selectedBuildingId,
    currentFloorLevel, // Renamed from currentFloor
    availableFloors,
    isLoadingIndoorData,
    indoorDataError,
    setCurrentFloor, // Function to change floor level
    clearIndoorView, // Function to exit
  } = useIndoorView(); // Consume context via the hook

  // Don't render anything if no building is selected
  if (!selectedBuildingId) {
    return null;
  }

  // --- Removed useIndoorData() call ---
  // Data fetching is now handled within the IndoorViewProvider's effects

  // Ensure floors are sorted by level for reliable up/down navigation
  const sortedFloors = useMemo(() => {
    // Create a copy before sorting to avoid mutating the original context array
    return [...availableFloors].sort((a, b) => a.level - b.level);
  }, [availableFloors]);

  const currentFloorIndex = useMemo(() => {
    return sortedFloors.findIndex(floor => floor.level === currentFloorLevel);
  }, [sortedFloors, currentFloorLevel]);

  // Get the full data object for the current floor
  const currentFloorData = currentFloorIndex !== -1 ? sortedFloors[currentFloorIndex] : null;

  // Determine if navigation is possible
  const canGoDown = currentFloorIndex > 0;
  const canGoUp = currentFloorIndex < sortedFloors.length - 1 && currentFloorIndex !== -1;

  // Handlers for floor changes using the level
  const handleGoDown = () => {
    if (canGoDown) {
      const prevFloorLevel = sortedFloors[currentFloorIndex - 1].level;
      setCurrentFloor(prevFloorLevel); // Call context function with the level
    }
  };

  const handleGoUp = () => {
    if (canGoUp) {
      const nextFloorLevel = sortedFloors[currentFloorIndex + 1].level;
      setCurrentFloor(nextFloorLevel); // Call context function with the level
    }
  };


  return (
    // Consider adding a specific class for mobile styling if needed
    <div className="indoor-controls-container mobile-indoor-controls">
      {isLoadingIndoorData && <div className="loading-indicator">Loading Indoor Map...</div>}

      {indoorDataError && <div className="error-message">Error: {indoorDataError}</div>}

      {/* Only show controls if not loading, no error, and current floor data exists */}
      {!isLoadingIndoorData && !indoorDataError && currentFloorData && (
        <div className="floor-navigator">
          <button
            onClick={handleGoDown}
            disabled={!canGoDown}
            className="floor-button down-button"
            aria-label="Go down one floor" // Accessibility improvement
          >
            &darr; {/* Down Arrow HTML Entity */}
          </button>
          <span className="current-floor-display" aria-live="polite"> {/* Announce changes */}
            {/* Display name or level */}
            {currentFloorData.name || `Level ${currentFloorData.level}`}
          </span>
          <button
            onClick={handleGoUp}
            disabled={!canGoUp}
            className="floor-button up-button"
            aria-label="Go up one floor" // Accessibility improvement
          >
            &uarr; {/* Up Arrow HTML Entity */}
          </button>
        </div>
      )}

      {/* Always show close button if a building is selected */}
      <button onClick={clearIndoorView} className="close-button">
        Exit Indoor View
      </button>
    </div>
  );
};

export default IndoorViewControls;
