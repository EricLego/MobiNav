// src/components/MapOverlays.js
import React, { useState, useContext } from 'react';
import { Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { MapContext } from '../contexts/MapContext'; // To potentially access map instance if needed

// --- Import contexts for data (These will be created later) ---
// import { RoutingContext } from '../contexts/RoutingContext';
// import { ObstacleContext } from '../contexts/ObstacleContext';
// import { EventContext } from '../contexts/EventContext';
// import { SearchContext } from '../contexts/SearchContext';

// --- Import hooks for data (Alternative if not using separate contexts) ---
// import useRouting from '../hooks/useRouting';
// import useObstacles from '../hooks/useObstacles';
// import useEvents from '../hooks/useEvents';
// import useSearch from '../hooks/useSearch';

// --- Placeholder Data (Remove when contexts/hooks are implemented) ---
const placeholderRoutingData = {
  startPoint: null, // { lat: 33.9390, lng: -84.5200, name: "Start" }
  endPoint: null,   // { lat: 33.9370, lng: -84.5170, name: "End" }
  currentRoute: [], // Array of { lat, lng } for polyline
};
const placeholderObstacles = [
  { id: 'obs1', lat: 33.9380, lng: -84.5190, name: "Construction", type: 'construction', status: 'Active' },
];
const placeholderEvents = [
   { id: 'evt1', lat: 33.9386, lng: -84.5187, name: "C-Day", description: "Capstone Day Event" },
];
const placeholderSearch = {
    selectedSearchResult: null // { lat: 33.9395, lng: -84.5195, name: "Searched Building" }
};
// --- End Placeholder Data ---


const MapOverlays = () => {
  const { isMapLoaded } = useContext(MapContext); // Check if map is ready

  // --- Consume Contexts (Uncomment when available) ---
  // const { startPoint, endPoint, currentRoute } = useContext(RoutingContext);
  // const { obstacles } = useContext(ObstacleContext); // Assuming obstacles is an array
  // const { currentEvents } = useContext(EventContext); // Assuming events is an array
  // const { selectedSearchResult } = useContext(SearchContext);

  // --- Use Placeholder Data (Remove later) ---
  const { startPoint, endPoint, currentRoute } = placeholderRoutingData;
  const obstacles = placeholderObstacles;
  const currentEvents = placeholderEvents;
  const { selectedSearchResult } = placeholderSearch;
  // --- End Placeholder Data Usage ---


  // State to manage which InfoWindow is open
  const [selectedMarker, setSelectedMarker] = useState(null); // Holds the data of the selected marker

  const handleMarkerClick = (markerData) => {
    setSelectedMarker(markerData);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  // Don't render overlays until the map instance is ready
  if (!isMapLoaded) {
    return null;
  }

  return (
    <>
      {/* Routing Markers */}
      {startPoint && (
        <Marker
          position={{ lat: startPoint.lat, lng: startPoint.lng }}
          label="A" // Or use a custom icon
          onClick={() => handleMarkerClick({ ...startPoint, type: 'start' })}
        />
      )}
      {endPoint && (
        <Marker
          position={{ lat: endPoint.lat, lng: endPoint.lng }}
          label="B" // Or use a custom icon
          onClick={() => handleMarkerClick({ ...endPoint, type: 'end' })}
        />
      )}

      {/* Route Polyline */}
      {currentRoute && currentRoute.length > 0 && (
        <Polyline
          path={currentRoute}
          options={{
            strokeColor: '#FFC629', // KSU Gold
            strokeOpacity: 0.8,
            strokeWeight: 6,
            geodesic: true,
          }}
        />
      )}

      {/* Obstacle Markers */}
      {obstacles.map((obstacle) => (
        <Marker
          key={obstacle.id}
          position={{ lat: obstacle.lat, lng: obstacle.lng }}
          // icon={{ url: '/icons/obstacle.png', scaledSize: new window.google.maps.Size(30, 30) }} // Example custom icon
          title={obstacle.name}
          onClick={() => handleMarkerClick({ ...obstacle, type: 'obstacle' })}
        />
      ))}

      {/* Event Markers */}
      {currentEvents.map((event) => (
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
            <h3>{selectedMarker.name}</h3>
            {selectedMarker.type === 'obstacle' && (
              <div className="obstacle-info">
                 <p>Type: {selectedMarker.type}</p>
                 <p className="status">Status: {selectedMarker.status}</p>
                 {/* Add more obstacle details */}
              </div>
            )}
             {selectedMarker.type === 'event' && (
              <div>
                 <p>{selectedMarker.description}</p>
                 {/* Add more event details */}
              </div>
            )}
            {selectedMarker.type === 'search' && (
              <div>
                 <p>{selectedMarker.formattedAddress || 'Location details'}</p>
                 {/* Add more search result details */}
              </div>
            )}
            {/* Add actions common to all or based on type */}
            <div className="info-actions">
              {/* Example: Buttons to set as start/end (connect to RoutingContext later) */}
              <button onClick={() => console.log('Set as Start:', selectedMarker)}>Set Start</button>
              <button onClick={() => console.log('Set as End:', selectedMarker)}>Set End</button>
              {/* Example: Button for indoor view (connect to IndoorViewContext later) */}
              {/* {selectedMarker.isBuilding && <button onClick={() => console.log('Indoor View:', selectedMarker)}>Indoor View</button>} */}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default MapOverlays;
