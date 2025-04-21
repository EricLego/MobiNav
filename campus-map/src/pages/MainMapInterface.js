// src/pages/MainMapInterface.js
import React, { useState, useContext, useEffect, useCallback } from 'react';
import GoogleMapCore from '../features/map/components/GoogleMapCore';
import SearchBar from '../features/search/components/SearchBar';
import ParkingMenu from '../features/parking/components/ParkingMenu';
import CategoryCarousel from '../features/map/components/CategoryCarousel';
import { UserLocationContext } from '../features/location/UserLocationContext';
import './MainMapInterface.css'; // Create this CSS file
import ObstacleReports from '../features/obstacles/components/ObstacleReports';
import ObstacleReportForm from '../features/obstacles/components/ObstacleReportForm';
import { submitObstacleReport } from '../services/mapService';

// Placeholder components for secondary views (replace with actual imports later)
const HowItWorksDrawer = ({ isOpen, onClose }) => isOpen ? <div className="drawer-placeholder">How It Works Drawer <button onClick={onClose}>Close</button></div> : null;
const EventDetailsModal = ({ isOpen, onClose, event }) => isOpen ? <div className="modal-placeholder">Event Details Modal <button onClick={onClose}>Close</button></div> : null;


const MainMapInterface = () => {
  // --- Standard UI State ---
  const [isParkingMenuOpen, setIsParkingMenuOpen] = useState(false);
  const [isObstacleReportOpen, setIsObstacleReportOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isEventViewOpen, setIsEventViewOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- Obstacle Reporting State ---
  const [isReportingMode, setIsReportingMode] = useState(false);
  const [reportLocationCoords, setReportLocationCoords] = useState(null); // { lat: number, lng: number } | null
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [reportingError, setReportingError] = useState(null); // For displaying submission errors


  // --- Contexts ---
  const { location: userLocation, isLocating, locationError: userLocationError, isOnCampus } = useContext(UserLocationContext);
  
  // --- Effects ---
  // Automatically show parking menu when off-campus (similar to HomePage logic)
  useEffect(() => {
    if (!isOnCampus && !isLocating && !userLocationError) {
      console.log("User is off-campus, showing parking menu.");
      setIsParkingMenuOpen(true);
    } else {
      // Optionally hide if user location changes to on-campus later
      // setIsParkingMenuOpen(false);
    }
  }, [isOnCampus, isLocating, userLocationError]);

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

  // --- Obstacle Reporting Handlers ---
  const handleStartReporting = useCallback(() => {
    closeObstacleReport(); // Close the list modal
    setIsReportingMode(true);
    setReportLocationCoords(null); // Reset location
    setIsReportFormOpen(false); // Ensure form is closed initially
    setReportingError(null); // Clear previous errors
    console.log("Entering obstacle reporting mode.");
  }, []);

  const cancelReportingMode = useCallback(() => {
    setIsReportingMode(false);
    setReportLocationCoords(null);
    setIsReportFormOpen(false);
    setReportingError(null);
    console.log("Exiting obstacle reporting mode.");
  }, []);

  const handleMapClickForMarker = useCallback((coords) => {
    if (isReportingMode) {
      console.log("Obstacle location selected via map click:", coords);
      setReportLocationCoords(coords);
      setIsReportFormOpen(true); // Automatically open form after map click
      setReportingError(null);
    }
  }, [isReportingMode]);

  const handleUseCurrentLocation = useCallback(() => {
    if (userLocation) {
      console.log("Obstacle location set to current user location:", userLocation);
      setReportLocationCoords({ lat: userLocation.latitude, lng: userLocation.longitude });
      setIsReportFormOpen(true); // Open form after selecting current location
      setReportingError(null);
    } else {
      // Handle case where location isn't available
      console.warn("Cannot use current location: Location not available.");
      setReportingError("Your current location is not available. Please enable location services or place a marker on the map.");
      // Maybe show a toast notification here
    }
  }, [userLocation]);

  const handleReportSubmit = useCallback(async (formData) => {
    console.log("Submitting obstacle report:", formData);
    setReportingError(null);
    try {
      // --- Replace with your actual API call ---
      const result = await submitObstacleReport(formData);
      console.log("Obstacle report submitted successfully:", result);

      // TODO: Add success feedback (e.g., toast notification)
      alert("Obstacle reported successfully!"); // Simple feedback for now

      // Optionally refetch the obstacle list
      // if (refetchObstacles) {
      //   refetchObstacles();
      // }

      cancelReportingMode(); // Exit reporting mode on success
    } catch (error) {
      console.error("Failed to submit obstacle report:", error);
      setReportingError(error.message || "An error occurred during submission.");
      // Keep the form open so the user can see the error and retry
      // Don't call cancelReportingMode() here
      throw error; // Re-throw so the form knows submission failed
    }
  }, [cancelReportingMode /*, refetchObstacles */]); // Add dependencies


  // --- Render Logic ---
  return (
    <div className={`map-view-container ${isReportingMode ? 'reporting-active' : ''}`}>

      {/* --- Caution Tape Border (Rendered when reporting) --- */}
      {isReportingMode && <div className="caution-border"></div>}


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
          <GoogleMapCore
            // --- Pass reporting props to map ---
            isMarkerPlacementActive={isReportingMode && !reportLocationCoords}
            onMapClickForMarker={handleMapClickForMarker}
          />
        </div>

        {/* Parking Menu: Always rendered, CSS controls position/appearance */}
        <ParkingMenu
          isOpen={isParkingMenuOpen}
          onClose={closeParkingMenu}
          // className is handled internally by ParkingMenu based on isOpen now
        />

        {/* --- Containers for Modals/Drawers (Secondary Views) --- */}
        {/* Render modals/drawers conditionally or always and control via CSS classes */}


          {/* Obstacle Report Modal */}
          {isObstacleReportOpen && !isReportingMode && (
            // Use the existing modal overlay structure
            <div className={`modal-overlay ${isObstacleReportOpen ? 'open' : ''}`}>
              {/* Render ObstacleReports inside the placeholder area */}
              <div className="modal-placeholder"> {/* Keep this wrapper for general modal styling */}
                 {/* Use the imported ObstacleReports component here */}
                 <ObstacleReports onClose={closeObstacleReport} onStartReporting={handleStartReporting}/>
              </div>
            </div>
          )}

        {/* Obstacle Report Form Modal */}
        {isReportingMode && isReportFormOpen && reportLocationCoords && (
          <div className="modal-overlay open"> {/* Form is always 'open' when state allows */}
             {/* Don't use modal-placeholder, let form style itself */}
             <ObstacleReportForm
                location={reportLocationCoords}
                onSubmit={handleReportSubmit}
                onCancel={() => setIsReportFormOpen(false)} // Just close form, stay in reporting mode
             />
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


      {/* --- Floating Action Buttons --- */}
      {!isReportingMode ? (
        // Standard Controls
        <div className="map-floating-controls">
          {!isParkingMenuOpen && (
            <button onClick={openParkingMenu} title="Show Parking Options">🅿️ Parking</button>
          )}
          <button onClick={openHowItWorks} title="How MobiNav Works">❓</button>
          <button onClick={openObstacleReport} title="View Obstacle Reports">🚧</button>
          {/* Add other standard buttons */}
        </div>
      ) : (
        // Reporting Controls
        <div className="reporting-controls">
           {reportingError && <div className="reporting-error-banner">{reportingError}</div>}
           {!reportLocationCoords && !isReportFormOpen && (
             <p className="reporting-prompt">Select obstacle location:</p>
           )}
           {!reportLocationCoords && ( // Only show location selection buttons if no location is set
             <>
                <button onClick={handleUseCurrentLocation} disabled={isLocating || !userLocation} title="Use your current location">📍 Current Location</button>
                <button title="Tap on the map to place a marker">👆 Place Marker</button>
             </>
           )}
           {/* Show Form button only if location is selected BUT form isn't open */}
           {reportLocationCoords && !isReportFormOpen && (
              <button onClick={() => setIsReportFormOpen(true)} title="Fill out obstacle details">📝 Open Form</button>
           )}
           {/* Always show Cancel */}
           <button onClick={cancelReportingMode} title="Cancel reporting" className="cancel-reporting-btn">❌ Cancel</button>
        </div>
      )}

    </div>
  );
};

export default MainMapInterface;
