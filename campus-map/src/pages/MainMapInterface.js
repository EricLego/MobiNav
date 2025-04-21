// src/pages/MainMapInterface.js
import React, { useState, useContext, useEffect } from 'react';
import GoogleMapCore from '../features/map/components/GoogleMapCore';
import SearchBar from '../features/search/components/SearchBar';
import ParkingMenu from '../features/parking/components/ParkingMenu';
import CategoryCarousel from '../features/map/components/CategoryCarousel';
import { UserLocationContext } from '../features/location/UserLocationContext';
import './MainMapInterface.css'; // Create this CSS file

// Placeholder components for secondary views (replace with actual imports later)
const ObstacleReportModal = ({ isOpen, onClose }) => isOpen ? <div className="modal-placeholder">Obstacle Report Modal <button onClick={onClose}>Close</button></div> : null;
const HowItWorksDrawer = ({ isOpen, onClose }) => isOpen ? <div className="drawer-placeholder">How It Works Drawer <button onClick={onClose}>Close</button></div> : null;
const EventDetailsModal = ({ isOpen, onClose, event }) => isOpen ? <div className="modal-placeholder">Event Details Modal <button onClick={onClose}>Close</button></div> : null;


const MainMapInterface = () => {
  // --- State for controlling UI elements ---
  const [isParkingMenuOpen, setIsParkingMenuOpen] = useState(false);
  const [isObstacleReportOpen, setIsObstacleReportOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isEventViewOpen, setIsEventViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // Example state for event view
  const [selectedCategory, setSelectedCategory] = useState('all'); // Default to 'all'


  // --- Contexts ---
  const { isOnCampus, isLocating, locationError } = useContext(UserLocationContext);

  // --- Effects ---
  // Automatically show parking menu when off-campus (similar to HomePage logic)
  useEffect(() => {
    if (!isOnCampus && !isLocating && !locationError) {
      console.log("User is off-campus, showing parking menu.");
      setIsParkingMenuOpen(true);
    } else {
      // Optionally hide if user location changes to on-campus later
      // setIsParkingMenuOpen(false);
    }
  }, [isOnCampus, isLocating, locationError]);

  // --- Event Handlers ---
  const openParkingMenu = () => setIsParkingMenuOpen(true);
  const closeParkingMenu = () => setIsParkingMenuOpen(false);
  const openObstacleReport = () => setIsObstacleReportOpen(true);
  const closeObstacleReport = () => setIsObstacleReportOpen(false);
  const openHowItWorks = () => setIsHowItWorksOpen(true);
  const closeHowItWorks = () => setIsHowItWorksOpen(false);
  const openEventView = (event) => {
      setSelectedEvent(event); // Set the event data if needed
      setIsEventViewOpen(true);
  };
  const closeEventView = () => setIsEventViewOpen(false);
  const handleCategorySelect = (categoryId) => {
    console.log("Selected Category:", categoryId);
    setSelectedCategory(categoryId);
    // TODO: Add logic here to filter markers based on categoryId
    // This might involve updating a context or passing the filter down to MapOverlays
  };

  // --- Render Logic ---
  return (
    <div className="map-view-container">

      {/* --- Top Bar Area --- */}
      <div className="map-header-area">
        <SearchBar />
        {/* Category Carousel: Rendered but hidden on mobile via CSS */}
        <CategoryCarousel
          className="category-carousel-web"
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* --- Main Content Area --- */}
      <div className="map-content-area">

        {/* Map Core takes up the main space */}
        <div className="map-core-wrapper">
          {/* Assuming MapProvider wraps this component higher up */}
          <GoogleMapCore />
        </div>

        {/* Parking Menu: Always rendered, CSS controls position/appearance */}
        <ParkingMenu
          isOpen={isParkingMenuOpen}
          onClose={closeParkingMenu}
          // className is handled internally by ParkingMenu based on isOpen now
        />

        {/* --- Containers for Modals/Drawers (Secondary Views) --- */}
        {/* Render modals/drawers conditionally or always and control via CSS classes */}

        {/* Example: Obstacle Report Modal */}
        {isObstacleReportOpen && (
          <div className={`modal-overlay ${isObstacleReportOpen ? 'open' : ''}`}>
            <ObstacleReportModal isOpen={isObstacleReportOpen} onClose={closeObstacleReport} />
          </div>
        )}

        {/* Example: How It Works Drawer */}
        {isHowItWorksOpen && (
          <div className={`drawer-container ${isHowItWorksOpen ? 'open' : ''}`}> {/* Adjust class based on desired style */}
            <HowItWorksDrawer isOpen={isHowItWorksOpen} onClose={closeHowItWorks} />
          </div>
        )}

        {/* Example: Event View Modal */}
        {isEventViewOpen && (
          <div className={`modal-overlay ${isEventViewOpen ? 'open' : ''}`}>
            <EventDetailsModal isOpen={isEventViewOpen} onClose={closeEventView} event={selectedEvent} />
          </div>
        )}

        {/* Add other modal/drawer containers here... */}

      </div>

      {/* --- Floating Action Buttons / Other Controls --- */}
      <div className="map-floating-controls">
         {/* Button to explicitly open Parking Menu if needed */}
         {!isParkingMenuOpen && (
            <button onClick={openParkingMenu} title="Show Parking Options">🅿️ Parking</button>
         )}
         <button onClick={openHowItWorks} title="How MobiNav Works">❓</button>
         <button onClick={openObstacleReport} title="Report an Obstacle">🚧</button>
         {/* Add button for Events, User Location, etc. */}
         {/* Example Event Trigger Button */}
         {/* <button onClick={() => openEventView({ id: 'cday', name: 'C-Day Expo' })} title="View Events">🎉 Events</button> */}
      </div>

    </div>
  );
};

export default MainMapInterface;
