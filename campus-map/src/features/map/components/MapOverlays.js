// src/components/MapOverlays.js
import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { Marker, InfoWindow, Polyline, Data } from '@react-google-maps/api';

// --- Import contexts for data (These will be created later) ---
import { MapContext } from '../contexts/MapContext';
import { SearchContext } from '../../search/contexts/SearchContext';
import { RoutingContext } from '../../routing/context/RoutingContext';
import { useIndoorView } from '../../indoor/IndoorViewContext';
// import { EventContext } from '../contexts/EventContext';

// --- Import hooks for data (Alternative if not using separate contexts) ---
import useBuildings from '../../data/hooks/useBuildings';
import useObstacles from '../../obstacles/hooks/useObstacles';
import useRouting from '../../routing/hooks/useRouting';
import { useUserLocation } from '../../location/UserLocationContext';
import useEntrances  from '../../data/hooks/useEntrances';
import { getMapIcon } from '../../../components/icons/mapIcons';
// import useEvents from '../hooks/useEvents';
// import useSearch from '../hooks/useSearch';



const MapOverlays = () => {

    // --- Use hooks to fetch data ---
    const { buildings, isLoading: isLoadingBuildings, error: buildingsError } = useBuildings();
    const { obstacles, isLoading: isLoadingObstacles, error: obstaclesError } = useObstacles();
    const { entrances, isLoading: isLoadingEntrances, error: entrancesError } = useEntrances();
    const { startSelect, endSelect } = useRouting();
    const { selectedBuildingId, currentFloorGeoJSON, selectBuildingForIndoorView, currentFloorLevel } = useIndoorView();
    const { userCoords } = useUserLocation();


  // --- Consume Contexts (Uncomment when available) ---
    const { mapRef, isMapLoaded, selectedCategory } = useContext(MapContext); // Check if map is ready
    const { selectedSearchResult } = useContext(SearchContext);
    const { startPoint, endPoint, route, isLoadingRoute, routeError,
            selectingEntranceFor, selectedBuildingForEntrance,
            setStartPoint, setEndPoint, cancelEntranceSelection
     } = useContext(RoutingContext);
  // const { obstacles } = useContext(ObstacleContext); // Assuming obstacles is an array
  // const { currentEvents } = useContext(EventContext); // Assuming events is an array


  // State to manage which InfoWindow is open
  const [selectedMarker, setSelectedMarker] = useState(null); // Holds the data of the selected marker
  const [currentZoom, setCurrentZoom] = useState(null);


    // --- Filter Entrances for Selection ---
    const entrancesForSelectedBuilding = useMemo(() => {
      if (!selectingEntranceFor || !selectedBuildingForEntrance || !entrances) {
          return [];
      }
      return entrances.filter(e => e.building_id === selectedBuildingForEntrance.building_id);
  }, [selectingEntranceFor, selectedBuildingForEntrance, entrances]);



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

    // --- NEW: Handler for clicking an ENTRANCE marker ---
    const handleEntranceClick = (entranceData) => {
      if (selectingEntranceFor === 'start') {
          console.log("Setting START point to entrance:", entranceData);
          setStartPoint({ // Use the original setter from RoutingContext
              lat: entranceData.latitude,
              lng: entranceData.longitude,
              name: entranceData.name || `Entrance ${entranceData.entrance_id}`,
              type: 'entrance',
              id: entranceData.entrance_id,
          });
          // setStartPoint automatically calls cancelEntranceSelection now
      } else if (selectingEntranceFor === 'end') {
          console.log("Setting END point to entrance:", entranceData);
          setEndPoint({ // Use the original setter from RoutingContext
              lat: entranceData.latitude,
              lng: entranceData.longitude,
              name: entranceData.name || `Entrance ${entranceData.entrance_id}`,
              type: 'entrance',
              id: entranceData.entrance_id,
          });
          // setEndPoint automatically calls cancelEntranceSelection now
      } else {
          // If not in selection mode, just open the info window
           handleMarkerClick(entranceData, 'entrance');
      }
      // Close info window after selection? Optional.
      // handleInfoWindowClose();
  };

    // --- Callback to update zoom state when map zoom changes ---
    const handleZoomChanged = useCallback(() => {
      if (mapRef.current) {
          const newZoom = mapRef.current.getZoom();
          // console.log("Zoom changed:", newZoom); // For debugging
          setCurrentZoom(newZoom);
      }
  }, [mapRef]); // Dependency on mapRef

      // --- Effect to get initial zoom and attach listener ---
      useEffect(() => {
        if (isMapLoaded && mapRef.current) {
            // Get initial zoom
            setCurrentZoom(mapRef.current.getZoom());

            // Add listener for zoom changes
            const listener = mapRef.current.addListener('zoom_changed', handleZoomChanged);

            // Cleanup listener on component unmount
            return () => {
                listener?.remove();
            };
        }
    }, [isMapLoaded, mapRef, handleZoomChanged]); // Add dependencies

    // --- Effect to close InfoWindow and Cancel Entrance Selection on map click ---
    useEffect(() => {
      if (!mapRef.current) return;

      const handleMapClick = (event) => {
          // Check if click was on a marker (these often stop propagation)
          // A simple way is to check if the event has a `latLng` property directly
          if (event.latLng) {
               setSelectedMarker(null); // Close InfoWindow
               if (selectingEntranceFor) {
                  console.log("Map clicked, cancelling entrance selection.");
                  cancelEntranceSelection(); // Cancel selection mode
               }
          }
      };

      const clickListener = mapRef.current.addListener('click', handleMapClick);
      return () => clickListener?.remove();

  }, [mapRef, cancelEntranceSelection, selectingEntranceFor]); // Add dependencies

    // Effect to sync local selectedMarker with the global selectedSearchResult
    useEffect(() => {
        if (selectedSearchResult && selectedSearchResult.lat && selectedSearchResult.lng) {
        setSelectedMarker(selectedSearchResult);
        }
    
    }, [selectedSearchResult]); // Re-run only when the global search selection changes

    // --- NEW: Memoize Filtered Markers based on selectedCategory ---
    const filteredMarkers = useMemo(() => {
      const markers = {
          buildings: [],
          obstacles: [],
          // Add other types if needed
      };

      // Ensure data is loaded before filtering
      if (isLoadingBuildings || isLoadingObstacles || !buildings || !obstacles) {
          return markers;
      }

      // Filter Buildings
      markers.buildings = buildings.filter(b => {
          // Always show if 'all' or 'buildings' category is selected
          if (selectedCategory === 'all' || selectedCategory === 'buildings') return true;

          // Check based on building category property (case-insensitive)
          // Adjust 'b.category' based on your actual data structure
          const buildingCategory = b.category?.toLowerCase() || '';
          if (selectedCategory === 'parking' && buildingCategory.includes('parking')) return true;
          if (selectedCategory === 'dining' && buildingCategory.includes('dining')) return true;
          if (selectedCategory === 'services' && buildingCategory.includes('service')) return true;

          // Add more specific checks if needed

          return false; // Don't show if no category matches
      });

      // Filter Obstacles (Example: only show for 'all' category)
      if (selectedCategory === 'all') {
          markers.obstacles = obstacles;
      }
      // Example: If you add an 'obstacles' category in the carousel:
      // else if (selectedCategory === 'obstacles') {
      //     markers.obstacles = obstacles;
      // }

      console.log(`Filtered for '${selectedCategory}': ${markers.buildings.length} buildings, ${markers.obstacles.length} obstacles`); // Debug log
      return markers;

  }, [selectedCategory, buildings, obstacles, isLoadingBuildings, isLoadingObstacles]); // Add dependencies

  const googleMapsReady = useMemo(() => !!(window.google && window.google.maps), []);
  const canRenderMarkers = isMapLoaded && googleMapsReady && currentZoom !== null;

  if (!canRenderMarkers) {
      return null; // Or a loading indicator
  }
  

    // --- Loading / Error / Ready Checks ---
    if (!isMapLoaded) return null; // Added entranceIcon check
    if (isLoadingBuildings || isLoadingObstacles || isLoadingEntrances) console.log("Loading map data..."); // Added entrance loading
    if (buildingsError || obstaclesError || entrancesError) console.error("Data loading errors:", { buildingsError, obstaclesError, entrancesError }); // Added entrance error
    if (isLoadingRoute) console.log("Calculating route...");
    if (routeError) console.error("Route calculation error:", routeError);




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
                icon={getMapIcon('user')} // Use the custom icon
                title="Your Location"
                zIndex={2} // Optionally render above route/GeoJSON
                // Prevent InfoWindow from opening on click?
                // onClick={() => console.log("Clicked user location marker")}
            />
        )}

    
            {/* --- Conditional Marker Rendering --- */}

            {/* MODE 1: Selecting an Entrance */}
            {selectingEntranceFor && selectedBuildingForEntrance && (
                <>
                    {/* Optional: Highlight the selected building somehow? (e.g., different marker or overlay) */}
                    <Marker
                        key={`bldg-select-${selectedBuildingForEntrance.building_id}`}
                        position={{ lat: selectedBuildingForEntrance.lat, lng: selectedBuildingForEntrance.lng }}
                        icon={getMapIcon('building')} 
                        visible={currentZoom >= 16}
                        title={`Select an entrance for ${selectedBuildingForEntrance.name}`}
                        zIndex={5} 
                    />
                    {/* Render ONLY entrances for the selected building */}
                    {entrancesForSelectedBuilding.map((entrance) => (
                         (typeof entrance.latitude === 'number' && typeof entrance.longitude === 'number') && (
                            <Marker
                                key={`ent-${entrance.entrance_id}`}
                                position={{ lat: entrance.latitude, lng: entrance.longitude }}
                                icon={getMapIcon('entrance')}
                                visible={currentZoom >= 16}
                                title={entrance.name || `Entrance ${entrance.entrance_id}`}
                                onClick={() => handleEntranceClick(entrance)} // <<--- Use specific handler
                                zIndex={10} // Ensure entrances are clickable
                            />
                         )
                    ))}
                </>
            )}

            {/* MODE 2: Normal View (Not selecting entrance, Not in indoor view) */}
            {!selectingEntranceFor && !selectedBuildingId && (
                <>
                  {/* Building Markers (Use filtered list) */}
                  {filteredMarkers.buildings.map((building) => (
                      (typeof building.lat === 'number' && typeof building.lng === 'number') && (
                          <Marker
                              key={`bldg-${building.building_id}`}
                              position={{ lat: building.lat, lng: building.lng }}
                              icon={getMapIcon('building')}
                              visible={currentZoom >= 16}
                              title={building.name}
                              // Pass 'building' type to handler
                              onClick={() => handleMarkerClick(building, 'building')}
                          />
                      )
                  ))}

    
                  {/* Obstacle Markers (Using fetched data) */}
                  {filteredMarkers.obstacles.map((obstacle) => (
                      (typeof obstacle.lat === 'number' && typeof obstacle.lng === 'number') && (
                          <Marker
                              key={`obs-${obstacle.obstacle_id}`}
                              position={{ lat: obstacle.lat, lng: obstacle.lng }}
                              icon={getMapIcon('obstacle')}
                              visible={currentZoom >= 16}
                              title={obstacle.description || 'Obstacle'}
                              // Pass 'obstacle' type to handler
                              onClick={() => handleMarkerClick(obstacle, 'obstacle')}
                          />
                      )
                  ))}
                  {/* Event Markers */}
                  {/* {placeholderEvents.map((event) => (
                    <Marker
                      key={event.id}
                      position={{ lat: event.lat, lng: event.lng }}
                      // icon={{ url: '/icons/event.png', scaledSize: new window.google.maps.Size(30, 30) }} // Example custom icon
                      title={event.name}
                      onClick={() => handleMarkerClick({ ...event, type: 'event' })}
                    />
                  ))} */}
    
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
                                      startSelect(selectedMarker); // Update routing context
                                      handleInfoWindowClose(); // Close window after setting
                                  }}>Set Start</button>
                                  <button onClick={() => {
                                      console.log('Set as End:', selectedMarker);
                                      endSelect(selectedMarker); // Update routing context
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
