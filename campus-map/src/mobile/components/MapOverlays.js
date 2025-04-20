// src/components/MapOverlays.js
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Marker, InfoWindow, Polyline, Data } from '@react-google-maps/api';

// --- Import contexts for data (These will be created later) ---
import { MapContext } from '../contexts/MapContext';
import { SearchContext } from '../contexts/SearchContext';
import { RoutingContext } from '../contexts/RoutingContext';
import { useIndoorView } from '../contexts/IndoorViewContext';
// import { EventContext } from '../contexts/EventContext';

// --- Import hooks for data (Alternative if not using separate contexts) ---
import useBuildings from '../hooks/useBuildings';
import useObstacles from '../hooks/useObstacles';
import useRouting from '../hooks/useRouting';
import { useUserLocation } from '../contexts/UserLocationContext';
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
    const { setStartPoint, setEndPoint } = useRouting();
    const { selectedBuildingId, currentFloorGeoJSON, selectBuildingForIndoorView, currentFloorLevel } = useIndoorView();
    const { userCoords } = useUserLocation();


  // --- Consume Contexts (Uncomment when available) ---
    const { mapRef, isMapLoaded } = useContext(MapContext); // Check if map is ready
    const { selectedSearchResult } = useContext(SearchContext);
    const { startPoint, endPoint, route, isLoadingRoute, routeError } = useContext(RoutingContext);
  // const { obstacles } = useContext(ObstacleContext); // Assuming obstacles is an array
  // const { currentEvents } = useContext(EventContext); // Assuming events is an array


  // State to manage which InfoWindow is open
  const [selectedMarker, setSelectedMarker] = useState(null); // Holds the data of the selected marker
  const [previousCoords, setPreviousCoords] = useState(null);

// --- Placeholder Data (Uncomment these!) ---

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

  // ... inside the component, define a user location icon (optional) ...
const userLocationIcon = useMemo(() => {
    if (!window.google || !window.google.maps) return null;
    return {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4', // Google Blue
        fillOpacity: 1,
        strokeColor: '#FFFFFF', // White outline
        strokeWeight: 2,
        scale: 8, // Adjust size as needed
    };
}, []);
  // -----------------------------------------------------------------

  const enterIndoorView = (marker) => {
        if (marker && marker.building_id){
            console.log(`Calling selectBuildingForIndoorView with ID: ${marker.building_id}`);
            selectBuildingForIndoorView(marker.building_id);
        }else {
            console.error("Cannot enter indoor view: Marker data is missing building_id.", marker);
        }
  };


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
  }, [mapRef]);
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



    // Don't render overlays until the map instance and icons are ready
    if (!isMapLoaded || !buildingIcon || !obstacleIcon) {
        return null;
    }

    // Handle loading/error states
    if (isLoadingBuildings || isLoadingObstacles) {
        console.log("Loading map data...");
        // Optionally return a loading indicator component
    }
    if (buildingsError || obstaclesError) {
        console.error("Data loading errors:", { buildingsError, obstaclesError });
        // Optionally return an error message component
    }
    if (isLoadingRoute) {
        console.log("Calculating route...");
        // Optionally show route loading indicator
    }
     if (routeError) {
        console.error("Route calculation error:", routeError);
        // Optionally show route error message
    }


    return (
        <>
          {/* --- Render GeoJSON Floor Plan if Indoor View is Active --- */}
          {selectedBuildingId && currentFloorGeoJSON && (
              <Data
                  // Ensure key changes when floor changes to force re-render
                  key={`floor-${selectedBuildingId}-${currentFloorLevel}`}
                  data={currentFloorGeoJSON}
                  // Optional: Add styling function if needed
                  style={(feature) => {
                    let fillColor = 'rgba(0, 0, 255, 0.3)'; // Semi-transparent blue fill
                    let strokeColor = '#0000FF'; // Blue outline
                    let strokeWeight = 1;
            
                    // Example: Style rooms differently
                    if (feature.getProperty('category') === 'room') {
                        fillColor = 'rgba(200, 200, 200, 0.5)'; // Light gray fill
                        strokeColor = '#555555'; // Darker gray outline
                    } else if (feature.getProperty('category') === 'elevator') {
                        fillColor = 'rgba(0, 255, 0, 0.6)'; // Green fill
                        strokeColor = '#008000'; // Dark green outline
                        strokeWeight = 2;
                    }
            
                    return ({
                        fillColor: fillColor,
                        strokeColor: strokeColor,
                        strokeWeight: strokeWeight,
                        clickable: false, // Optional: make features non-clickable
                        zIndex: 1 // Optional: Render below route/markers
                    });
                }}
              />
          )}
    
          {/* --- Routing Markers (Render regardless of indoor view?) --- */}
          {/* Use startPoint from RoutingContext */}
          {startPoint && startPoint.lat && startPoint.lng && (
              <Marker
                  key="start-point"
                  position={{ lat: startPoint.lat, lng: startPoint.lng }}
                  label="A" // Or use a custom icon
                  onClick={() => handleMarkerClick({ ...startPoint, type: 'start' })}
              />
          )}
          {/* Use endPoint from RoutingContext */}
          {endPoint && endPoint.lat && endPoint.lng && (
              <Marker
                  key="end-point"
                  position={{ lat: endPoint.lat, lng: endPoint.lng }}
                  label="B" // Or use a custom icon
                  onClick={() => handleMarkerClick({ ...endPoint, type: 'end' })}
              />
          )}
    
          {/* --- Route Polyline (Render regardless of indoor view?) --- */}
          {route && route.geometry && route.geometry.length > 0 && (
              <>
                  {console.log("Rendering Polyline with geometry:", route.geometry)}
                  <Polyline
                      path={route.geometry} // Assuming geometry is an array of {lat, lng}
                      options={{
                          strokeColor: '#FFC629', // KSU Gold
                          strokeOpacity: 0.8,
                          strokeWeight: 6,
                          geodesic: true,
                          zIndex: 1 // Ensure route is drawn above other map features if needed
                      }}
                  />
              </>
          )}


        {/* --- User Location Marker --- */}
        {userCoords && (
            <Marker
                key="user-location"
                position={{ lat: userCoords.lat, lng: userCoords.lng }}
                icon={userLocationIcon} // Use the custom icon
                title="Your Location"
                zIndex={2} // Optionally render above route/GeoJSON
                // Prevent InfoWindow from opening on click?
                // onClick={() => console.log("Clicked user location marker")}
            />
        )}

    
          {/* --- Render other markers ONLY if NOT in indoor view --- */}
          {!selectedBuildingId && (
              <>
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
    
                    {/* --- Selected Search Result Marker --- */}
                    {selectedSearchResult && selectedSearchResult.lat && selectedSearchResult.lng && (
                        <Marker
                            key="search-result-marker"
                            position={{ lat: selectedSearchResult.lat, lng: selectedSearchResult.lng }}
                            label={{ text: '📍', fontSize: '20px' }}
                            title={selectedSearchResult.name}
                            onClick={() => handleMarkerClick({ ...selectedSearchResult, type: 'search' })}
                            animation={window.google.maps.Animation.DROP}
                        />
                    )}
              </>
          )}
    
          {/* --- Info Window (Render regardless of indoor view, but content depends) --- */}
          {selectedMarker && selectedMarker.lat && selectedMarker.lng && ( // Added coordinate check
              <InfoWindow
                  position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                  onCloseClick={handleInfoWindowClose}
              >
                  <div className="info-window">
                      <h3>{selectedMarker.name || selectedMarker.description || 'Selected Location'}</h3>
                      {/* ... (Conditional rendering for different types remains the same) ... */}
    
                      {/* --- Actions --- */}
                      <div className="info-actions">
                          {/* Only show Set Start/End if NOT in indoor view */}
                          {!selectedBuildingId && (
                              <>
                                  <button onClick={() => {
                                      console.log('Set as Start:', selectedMarker);
                                      setStartPoint(selectedMarker); // Update routing context
                                      handleInfoWindowClose(); // Close window after setting
                                  }}>Set Start</button>
                                  <button onClick={() => {
                                      console.log('Set as End:', selectedMarker);
                                      setEndPoint(selectedMarker); // Update routing context
                                      handleInfoWindowClose(); // Close window after setting
                                  }}>Set End</button>
                              </>
                          )}
                          {/* Show Indoor View button only for buildings and when NOT already inside */}
                          {selectedMarker.type === 'building' && !selectedBuildingId && (
                              <button onClick={() => {
                                  enterIndoorView(selectedMarker);
                                  handleInfoWindowClose();
                              }}>Indoor View</button>
                          )}
                      </div>
                  </div>
              </InfoWindow>
          )}
        </>
      );
    };
    

export default MapOverlays;
