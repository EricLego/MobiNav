// src/components/ParkingMenu.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useUserLocation } from '../../location/UserLocationContext';
import { MapContext } from '../../map/contexts/MapContext';
import useParking from '../hooks/useParking';
import './ParkingMenu.css'; // We'll create this CSS file
import { SearchContext } from '../../search/contexts/SearchContext';



const ParkingMenu = ({ isOpen, onClose }) => {
  // --- Use the hook ---
  const {
    parkingLots, // This is already filtered based on the hook's logic
    isLoading,   // Use isLoading from the hook
    error,       // Use error from the hook
    filterByPermit, // Get the filter function from the hook
  } = useParking();
  // --------------------

  // Keep a local state just for highlighting the active filter button
  const [activeFilter, setActiveFilter] = useState('all');

  const { userCoords } = useUserLocation();
  const { setSelectedSearchResult } = useContext(SearchContext);
  const menuRef = useRef();

  // --- Update filter button handler ---
  const handleFilterClick = (permitType) => {
    setActiveFilter(permitType.toLowerCase()); // Update local state for styling
    filterByPermit(permitType); // Call the hook's filter function
  };

  const handleCenterMap = (lot) => {
    // Use lot.coords.lat and lot.coords.lng from the mapped data
    if (lot.coords?.lat && lot.coords?.lng) {
      console.log(`Centering map on:`, lot);
      setSelectedSearchResult({
        id: lot.id,         // Keep ID if useful for context consumers
        name: lot.name,       // Keep name if useful
        lat: lot.coords.lat, // Direct lat property
        lng: lot.coords.lng, // Direct lng property
        type: 'parking',    // Add a type identifier (optional but good practice)
        // DO NOT include center, zoom, tilt, heading here
      });
      // onClose(); // Optional
    } else {
      console.warn("Parking lot missing coordinates:", lot);
    }
  };

  // --- Update handleNavigate to use coords from hook data ---
  const handleNavigate = (lot) => {
    if (!userCoords) {
      alert("Could not get your current location to start navigation.");
      return;
    }
    // Use lot.coords.lat and lot.coords.lng from the mapped data
    if (!lot.coords?.lat || !lot.coords?.lng) {
      alert("Parking lot location is invalid.");
      return;
    }

    console.log(`Navigating to: ${lot.name}`);
    const origin = `${userCoords.lat},${userCoords.lng}`;
    const destination = `${lot.coords.lat},${lot.coords.lng}`; // Use coords
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    // onClose(); // Optional
  };

  // --- Click outside to close ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose(); // Call the onClose prop passed from HomePage
      }
    };
    // Add listener only when the menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]); // Re-run when isOpen changes

  // --- Helper to determine CSS class from permits array ---
  const getPermitClass = (permits) => {
    const lowerCasePermits = permits.map(p => p.toLowerCase());
    if (lowerCasePermits.includes('student')) return 'type-student';
    if (lowerCasePermits.includes('visitor')) return 'type-visitor';
    if (lowerCasePermits.includes('faculty/staff') || lowerCasePermits.includes('faculty')) return 'type-faculty'; // Handle variations
    // Add more mappings if needed
    return ''; // Default or no specific class
  };
  // ------------------------------------------------------

  // --- Helper to display permit text ---
  const displayPermits = (permits) => {
    if (!permits || permits.length === 0) return 'Permit: N/A';
    // Simple join, or could be more sophisticated
    return `Permits: ${permits.join(', ')}`;
  };
  // -------------------------------------


  return (
    <div className={`parking-menu-panel ${isOpen ? 'open' : ''}`} ref={menuRef}>
      <div className="parking-menu-content">
        <div className="parking-menu-header">
          <h2>Off-Campus Parking</h2>
          <button onClick={onClose} className="close-parking-menu" aria-label="Close parking menu">×</button>
        </div>
        <p style={{ padding: '0 var(--space-md) var(--space-sm)', color: 'var(--ksu-gray-dark)', fontSize: '0.9rem', margin: 'var(--space-sm) 0 0 0' }}>
          Select a parking type below to see options on the map.
        </p>

        {/* --- Update Filter Buttons --- */}
        <div className="parking-filters">
          {/* Use handleFilterClick and activeFilter */}
          <button
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterClick('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${activeFilter === 'student' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Student')} // Pass the value expected by the hook
          >
            Student
          </button>
          <button
            className={`filter-button ${activeFilter === 'visitor' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Visitor')}
          >
            Visitor
          </button>
          <button
            // Handle variations like 'Faculty' or 'Faculty/Staff'
            className={`filter-button ${activeFilter === 'faculty/staff' || activeFilter === 'faculty' ? 'active' : ''}`}
            onClick={() => handleFilterClick('Faculty/Staff')} // Use a consistent value
          >
            Faculty/Staff
          </button>
        </div>
        {/* -------------------------- */}

        {/* --- Update List Rendering Logic --- */}
        <div className="parking-list">
          {/* Use isLoading and error from the hook */}
          {isLoading && <p>Loading parking lots...</p>}
          {error && <p className="error-text">Error loading parking: {error}</p>}
          {!isLoading && !error && parkingLots.length === 0 && (
            <p>No parking lots found for "{activeFilter}" type.</p>
          )}
          {/* Use parkingLots from the hook */}
          {!isLoading && !error && parkingLots.map(lot => (
            // Use lot.id (mapped from lot_id) for the key
            <div key={lot.id} className="parking-list-item">
              <div className="parking-item-info">
                <span className="parking-name">{lot.name}</span>
                {/* Apply CSS class based on permits and display permits text */}
                <span className={`parking-type ${getPermitClass(lot.permits)}`}>
                  {displayPermits(lot.permits)}
                </span>
                {/* Optionally display capacity */}
                {/* {lot.capacity && <span className="parking-capacity">Capacity: {lot.capacity}</span>} */}
              </div>
              <div className="parking-item-actions">
                {/* Pass the correct lot object to handlers */}
                <button onClick={() => handleCenterMap(lot)} title="Center map on this lot">
                  🎯 Center
                </button>
                <button onClick={() => handleNavigate(lot)} title="Navigate using external maps">
                  🚗 Navigate
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* ----------------------------- */}
      </div>
    </div>
  );
};

export default ParkingMenu;
