// src/components/MapOverlays.js
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Marker, InfoWindow, Polyline } from '@react-google-maps/api';

// --- Import contexts for data (These will be created later) ---
import { MapContext } from '../contexts/MapContext';
import { SearchContext } from '../contexts/SearchContext';
// import { RoutingContext } from '../contexts/RoutingContext';
// import { EventContext } from '../contexts/EventContext';

// --- Import hooks for data (Alternative if not using separate contexts) ---
import useMapViewpoint from '../hooks/useMapViewpoint';
import useBuildings from '../hooks/useBuildings';
import useObstacles from '../hooks/useObstacles';
// import useRouting from '../hooks/useRouting';
// import useEvents from '../hooks/useEvents';
// import useSearch from '../hooks/useSearch';

const buildingIconProps = {
    path: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
    fillColor: '#0033a0',
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 1.1,
  };
  
  const obstacleIconProps = {
    path: "M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3s.58-1.3 1.3-1.3 1.3.58 1.3 1.3-.58 1.3-1.3 1.3zm0-4.3c-.72 0-1.3-.58-1.3-1.3V8c0-.72.58-1.3 1.3-1.3s1.3.58 1.3 1.3v3.7c0 .72-.58 1.3-1.3 1.3z",
    fillColor: '#DB4437',
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 1.0,
  };


const MapOverlays = () => {

    // --- Use hooks to fetch data (Uncomment when available) ---
    const { buildings, isLoading: isLoadingBuildings, error: buildingsError } = useBuildings();
    const { obstacles, isLoading: isLoadingObstacles, error: obstaclesError } = useObstacles();


  // --- Consume Contexts (Uncomment when available) ---
    const { mapRef, isMapLoaded } = useContext(MapContext); // Check if map is ready
    const { selectedSearchResult } = useContext(SearchContext);
  // const { startPoint, endPoint, currentRoute } = useContext(RoutingContext);
  // const { obstacles } = useContext(ObstacleContext); // Assuming obstacles is an array
  // const { currentEvents } = useContext(EventContext); // Assuming events is an array

// --- Placeholder Data (Uncomment these!) ---
const placeholderRoutingData = {
    startPoint: { lat: 33.9390, lng: -84.5200, name: "Start" },
    endPoint: { lat: 33.9370, lng: -84.5170, name: "End" },
    currentRoute: [], // Array of { lat, lng } for polyline
  };
  const placeholderEvents = [
     { id: 'evt1', type: 'event', lat: 33.9386, lng: -84.5187, name: "C-Day", description: "Capstone Day Event" },
  ];
  // --- End Placeholder Data ---


  // --- Create full icon objects *inside* the component using useMemo ---
  // This ensures window.google is available before creating the Point
  const buildingIcon = useMemo(() => {
    if (!window.google || !window.google.maps) return null; // Guard clause
    return {
      ...buildingIconProps,
      anchor: new window.google.maps.Point(12, 12)
    };
  }, []); // Empty dependency array means it runs once when component mounts (after script load)

  const obstacleIcon = useMemo(() => {
    if (!window.google || !window.google.maps) return null; // Guard clause
    return {
      ...obstacleIconProps,
      anchor: new window.google.maps.Point(12, 12)
    };
  }, []);
  // -----------------------------------------------------------------



  // State to manage which InfoWindow is open
  const [selectedMarker, setSelectedMarker] = useState(null); // Holds the data of the selected marker

  const handleMarkerClick = (markerData) => {
    if(typeof markerData.lat === 'number' && typeof markerData.lng === 'number') {
        // Ensure lat/lng are numbers before setting
        setSelectedMarker(markerData);
    } else {
        console.warn("Invalid coordinates for marker:", markerData);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  // --- Effect to close InfoWindow on map click ---
  useEffect(() => {
    // Check if map instance exists
    if (!mapRef.current) {
      return; // Exit if map is not ready
    }

    // Define the listener function
    const handleMapClickToClose = (event) => {
      // Check if the click was directly on the map (not on a marker which might stop propagation)
      // You might not strictly need this check if marker clicks behave as expected.
      // console.log("Map clicked", event);
      setSelectedMarker(null); // Close any open InfoWindow
    };

    // Add the event listener to the map instance
    const clickListener = mapRef.current.addListener('click', handleMapClickToClose);

    // Cleanup function: remove the listener when the component unmounts
    // or if mapRef.current changes (though it shouldn't change often)
    return () => {
      if (clickListener) {
        clickListener.remove();
      }
    };
  }, [mapRef.current]); // Dependency array includes mapRef.current
  // --- End Effect ---

    // Effect to sync local selectedMarker with the global selectedSearchResult
    useEffect(() => {
        // When a search result is selected globally (and has coordinates),
        // update the local state to show its InfoWindow.
        if (selectedSearchResult && selectedSearchResult.lat && selectedSearchResult.lng) {
        setSelectedMarker(selectedSearchResult);
        // The other effect that pans/zooms will also trigger
        }
        // If selectedSearchResult becomes null (e.g., search cleared),
        // this effect doesn't need to do anything, as the user might still
        // have an InfoWindow open from clicking a marker directly.
        // Closing is handled by handleInfoWindowClose or map click effect.
    
    }, [selectedSearchResult]); // Re-run only when the global search selection changes

    useMapViewpoint(mapRef, selectedMarker, 18); // Use the hook to pan/zoom to selected marker


  // Don't render overlays until the map instance is ready
  if (!isMapLoaded) {
    return null;
  }

  if (buildingsError || obstaclesError) {
    console.error("Data loading errors:", {buildingsError, obstaclesError });
  }

  return (
    <>
      {/* Routing Markers */}
      {placeholderRoutingData.startPoint && (
        <Marker
          position={{ lat: placeholderRoutingData.startPoint.lat, lng: placeholderRoutingData.startPoint.lng }}
          label="A" // Or use a custom icon
          onClick={() => handleMarkerClick({ ...placeholderRoutingData.startPoint, type: 'start' })}
        />
      )}
      {placeholderRoutingData.endPoint && (
        <Marker
          position={{ lat: placeholderRoutingData.endPoint.lat, lng: placeholderRoutingData.endPoint.lng }}
          label="B" // Or use a custom icon
          onClick={() => handleMarkerClick({ ...placeholderRoutingData.endPoint, type: 'end' })}
        />
      )}

      {/* Route Polyline */}
      {placeholderRoutingData.currentRoute && placeholderRoutingData.currentRoute.length > 0 && (
        <Polyline
          path={placeholderRoutingData.currentRoute}
          options={{
            strokeColor: '#FFC629', // KSU Gold
            strokeOpacity: 0.8,
            strokeWeight: 6,
            geodesic: true,
          }}
        />
      )}

      {/* Building Markers (Using fetched data) */}
      {buildings.map((building) => (
        // Check for valid coordinates before rendering
        (typeof building.lat === 'number' && typeof building.lng === 'number') && (
          <Marker
            key={`bldg-${building.building_id}`} // Use a unique key
            position={{ lat: building.lat, lng: building.lng }}
            icon={buildingIcon}
            title={building.name}
            onClick={() => handleMarkerClick(building)} // Pass the whole building object
          />
        )
      ))}

      {/* Obstacle Markers (Using fetched data) */}
      {obstacles.map((obstacle) => (
        // Check for valid coordinates before rendering
         (typeof obstacle.lat === 'number' && typeof obstacle.lng === 'number') && (
            <Marker
              key={`obs-${obstacle.obstacle_id}`} // Use a unique key
              position={{ lat: obstacle.lat, lng: obstacle.lng }}
              icon={obstacleIcon}
              title={obstacle.description || 'Obstacle'} // Use description for title
              onClick={() => handleMarkerClick(obstacle)} // Pass the whole obstacle object
            />
         )
      ))}
      {/* Event Markers */}
      {placeholderEvents.map((event) => (
        <Marker
          key={event.id}
          position={{ lat: event.lat, lng: event.lng }}
          // icon={{ url: '/icons/event.png', scaledSize: new window.google.maps.Size(30, 30) }} // Example custom icon
          title={event.name}
          onClick={() => handleMarkerClick({ ...event, type: 'event' })}
        />
      ))}

       {/* Selected Search Result Marker */}
       {selectedSearchResult && (
        <Marker
          position={{ lat: selectedSearchResult.lat, lng: selectedSearchResult.lng }}
          // Use a distinct icon/label for search result?
          title={selectedSearchResult.name}
          onClick={() => handleMarkerClick({ ...selectedSearchResult, type: 'search' })}
          // Maybe add animation?
          // animation={window.google.maps.Animation.DROP}
        />
      )}

      {/* Info Window */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={handleInfoWindowClose}
        >
          {/* Render content based on selectedMarker.type */}
          <div className="info-window">
            <h3>{selectedMarker.name || selectedMarker.description || 'Selected Location'}</h3>

            {/* Building Specific Info */}
            {selectedMarker.type === 'building' && (
              <div>
                <p>{selectedMarker.address} {selectedMarker.street}</p>
                {/* Add more building details */}
              </div>
            )}

            {/* Obstacle Specific Info */}
            {selectedMarker.type === 'obstacle' && (
              <div className="obstacle-info">
                 <p>Status: <span className="status">{selectedMarker.status}</span></p>
                 <p>Severity: {selectedMarker.severity_level}</p>
                 {selectedMarker.reported_at && <p className="reported">Reported: {new Date(selectedMarker.reported_at).toLocaleString()}</p>}
                 {/* Add more obstacle details */}
              </div>
            )}

            {/* Event Specific Info */}
             {selectedMarker.type === 'event' && (
              <div>
                 <p>{selectedMarker.description}</p>
                 {/* Add more event details */}
              </div>
            )}

            {/* Search Specific Info */}
            {selectedMarker.type === 'search' && (
              <div>
                 <p>{selectedMarker.formattedAddress || 'Location details'}</p>
                 {/* Add more search result details */}
              </div>
            )}
            
            {/* --- Actions --- */}
            <div className="info-actions">
              {/* Connect these buttons to context functions later */}
              <button onClick={() => console.log('Set as Start:', selectedMarker)}>Set Start</button>
              {selectedMarker.type === 'building' && ( // Only show for buildings
                 <button onClick={() => console.log('Indoor View:', selectedMarker)}>Indoor View</button>
              )}
              <button onClick={() => console.log('Set as End:', selectedMarker)}>Set End</button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default MapOverlays;
