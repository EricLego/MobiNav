// src/components/ParkingMenu.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useUserLocation } from '../mobile/contexts/UserLocationContext';
import { MapContext } from '../mobile/contexts/MapContext';
// Import a parking hook later: import useParking from '../hooks/useParking';
import '../styles/ParkingMenu.css'; // We'll create this CSS file

// --- Mock Data (Replace with useParking hook later) ---
const mockParkingLots = [
  { id: 'p1', name: 'North Deck (P1)', type: 'Student', lat: 33.9390, lng: -84.5145 },
  { id: 'p2', name: 'West Deck (P20)', type: 'Student', lat: 33.9385, lng: -84.5230 },
  { id: 'p3', name: 'South Deck (P60)', type: 'Student', lat: 33.9358, lng: -84.5165 },
  { id: 'p4', name: 'Lot V2 (Near Rec Center)', type: 'Visitor', lat: 33.9370, lng: -84.5195 },
  { id: 'p5', name: 'Lot J (Near Wilson Center)', type: 'Visitor', lat: 33.9372, lng: -84.5170 },
  { id: 'p6', name: 'Lot E (Near Engineering)', type: 'Faculty', lat: 33.9405, lng: -84.5210 },
  { id: 'p7', name: 'Lot F (Central Campus)', type: 'Faculty', lat: 33.9380, lng: -84.5198 },
];
// ----------------------------------------------------

const ParkingMenu = ({ isOpen, onClose }) => { // Add onClose prop to allow closing
  const [filterType, setFilterType] = useState('all'); // 'all', 'student', 'visitor', 'faculty'
  const { userCoords } = useUserLocation();
  const { setViewpoint } = useContext(MapContext); // Get the function to set map view
  const menuRef = useRef();

  // --- Replace with data from useParking hook later ---
  const parkingLots = mockParkingLots;
  const isLoadingParking = false; // Simulate loading state
  const parkingError = null; // Simulate error state
  // ----------------------------------------------------

  const filteredLots = parkingLots.filter(lot => {
    if (filterType === 'all') return true;
    return lot.type.toLowerCase() === filterType;
  });

  const handleCenterMap = (lot) => {
    if (lot.lat && lot.lng) {
      console.log(`Centering map on: ${lot.name}`);
      setViewpoint({
        center: { lat: lot.lat, lng: lot.lng },
        zoom: 18, // Zoom closer to the parking lot
        tilt: 0,
        heading: 0,
      });
      // Optionally close the menu after centering
      // onClose();
    } else {
      console.warn("Parking lot missing coordinates:", lot);
    }
  };

  const handleNavigate = (lot) => {
    if (!userCoords) {
      alert("Could not get your current location to start navigation.");
      // TODO: Maybe trigger location fetch here?
      return;
    }
    if (!lot.lat || !lot.lng) {
      alert("Parking lot location is invalid.");
      return;
    }

    console.log(`Navigating to: ${lot.name}`);
    // Construct Google Maps Directions URL
    const origin = `${userCoords.lat},${userCoords.lng}`;
    const destination = `${lot.lat},${lot.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    // Open in a new tab
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');

    // TODO: Decide if we need to store navigation state internally
    // For now, just opens external maps.

    // Optionally close the menu after initiating navigation
    // onClose();
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


  return (
    // Use the new panel class and add 'open' class based on prop
    <div className={`parking-menu-panel ${isOpen ? 'open' : ''}`} ref={menuRef}>
      <div className="parking-menu-content">
        <div className="parking-menu-header">
          {/* Updated Title */}
          <h2>Off-Campus Parking</h2>
          <button onClick={onClose} className="close-parking-menu" aria-label="Close parking menu">×</button>
        </div>
        {/* Add Explanatory Text */}
        <p style={{ padding: '0 var(--space-md) var(--space-sm)', color: 'var(--ksu-gray-dark)', fontSize: '0.9rem', margin: 'var(--space-sm) 0 0 0' }}>
          Select a parking type below to see options on the map.
        </p>

        {/* --- Add Filter Buttons --- */}
        <div className="parking-filters">
          <button
            className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`filter-button ${filterType === 'student' ? 'active' : ''}`}
            onClick={() => setFilterType('student')}
          >
            Student
          </button>
          <button
            className={`filter-button ${filterType === 'visitor' ? 'active' : ''}`}
            onClick={() => setFilterType('visitor')}
          >
            Visitor
          </button>
          <button
            className={`filter-button ${filterType === 'faculty' ? 'active' : ''}`}
            onClick={() => setFilterType('faculty')}
          >
            Faculty/Staff
          </button>
        </div>
        {/* -------------------------- */}

        {/* --- Add List Rendering Logic --- */}
        <div className="parking-list">
          {isLoadingParking && <p>Loading parking lots...</p>}
          {parkingError && <p className="error-text">Error loading parking: {parkingError.message}</p>}
          {!isLoadingParking && !parkingError && filteredLots.length === 0 && (
            <p>No parking lots found for "{filterType}" type.</p>
          )}
          {!isLoadingParking && !parkingError && filteredLots.map(lot => (
            <div key={lot.id} className="parking-list-item">
              <div className="parking-item-info">
                <span className="parking-name">{lot.name}</span>
                <span className={`parking-type type-${lot.type.toLowerCase()}`}>{lot.type}</span>
              </div>
              <div className="parking-item-actions">
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
