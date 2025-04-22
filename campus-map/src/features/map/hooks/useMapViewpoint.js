// src/mobile/hooks/useMapViewpoint.js
import { useEffect, useContext, useState } from 'react';
import { MapContext } from '../contexts/MapContext'; // Get mapRef, isMapLoaded
import { UserLocationContext } from '../../location/UserLocationContext'; // Get user location status
import { IndoorViewContext } from '../../indoor/IndoorViewContext'; // Check if indoor view is active
import { SearchContext } from '../../search/contexts/SearchContext'; // Check if a search result is selected

// Import or define helpers and constants
import { defaultCenter } from '../components/GoogleMapCore';

// --- Define calculateDistance (or import if defined elsewhere) ---
const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return 0;
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
};

// --- Define calculateBearing ---
function calculateBearing(point1, point2) {
    const lat1 = point1.lat * Math.PI / 180;
    const lat2 = point2.lat * Math.PI / 180;
    const lon1 = point1.lng * Math.PI / 180;
    const lon2 = point2.lng * Math.PI / 180;
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
}


const useMapViewpoint = () => {
  // Consume necessary contexts
  const { mapRef, isMapLoaded } = useContext(MapContext);
  const { userCoords, isOnCampus, isLocating } = useContext(UserLocationContext);
  const { selectedBuildingId, currentFloorGeoJSON } = useContext(IndoorViewContext); // Need GeoJSON for potential indoor viewpoint
  const { selectedSearchResult } = useContext(SearchContext);

  // State for heading calculation
  const [previousCoords, setPreviousCoords] = useState(null);
  // Ref to prevent rapid updates if target hasn't changed significantly

  useEffect(() => {
    // Ensure map is ready
    if (!mapRef.current || !isMapLoaded) {
      return;
    }

    let targetCenter = null;
    let targetZoom = null;
    let targetTilt = 0;
    let targetHeading = 0;
    let calculatedHeading = null;
    let viewpointSource = 'default'; // For logging

    // Calculate heading if possible
    if (userCoords && previousCoords) {
        const distanceMoved = calculateDistance(previousCoords, userCoords);
        if (distanceMoved > 5) { // Threshold to prevent jitter
            calculatedHeading = calculateBearing(previousCoords, userCoords);
        }
    }

    // --- Determine Viewpoint based on Priority ---
    if (selectedBuildingId) {
        // 1. Indoor View Active
        viewpointSource = 'indoor';
        targetZoom = 21;
        targetTilt = 45;
        if (currentFloorGeoJSON?.properties?.viewpoint?.center) {
            targetCenter = currentFloorGeoJSON.properties.viewpoint.center;
            targetZoom = currentFloorGeoJSON.properties.viewpoint.zoom || targetZoom;
            targetTilt = currentFloorGeoJSON.properties.viewpoint.tilt || targetTilt;
            targetHeading = currentFloorGeoJSON.properties.viewpoint.heading || targetHeading;
        } else {
            // Fallback to building center (needs access to building data - maybe add to IndoorViewContext?)
            // For now, just log a warning or use a placeholder if no specific viewpoint
            console.warn("Indoor view active but no specific viewpoint found in GeoJSON.");
            // targetCenter = { lat: building.lat, lng: building.lng }; // Needs building data
            targetCenter = null; // Avoid moving if no data
        }
    } else if (selectedSearchResult && selectedSearchResult.lat && selectedSearchResult.lng) {
        // 2. Search Result Selected
        viewpointSource = 'search';
        targetCenter = { lat: selectedSearchResult.lat, lng: selectedSearchResult.lng };
        targetZoom = 18;
        targetTilt = 0;
        targetHeading = 0;
    } else if (isOnCampus === true && userCoords) {
        // 3. On Campus
        viewpointSource = 'on_campus_user';
        targetCenter = { lat: userCoords.lat, lng: userCoords.lng };
        targetZoom = 20;
        if (calculatedHeading !== null) {
            targetTilt = 25;
            targetHeading = calculatedHeading;
        } else {
            targetTilt = 10;
            targetHeading = 0;
        }
    } else if (isOnCampus === false && !isLocating) {
        // 4. Off Campus
        viewpointSource = 'off_campus_overview';
        targetCenter = defaultCenter;
        targetZoom = 15;
        targetTilt = 0;
        targetHeading = 0;
    } else {
        // 5. Default / Still Locating / No specific state
        viewpointSource = 'no_target';
        targetCenter = null; // Don't force map movement
        targetZoom = null;
    }

    // --- Apply the viewpoint to the map instance ---
    if (targetCenter && typeof targetCenter.lat === 'number' && typeof targetCenter.lng === 'number') {
        const currentView = {
            center: targetCenter,
            zoom: targetZoom,
            tilt: targetTilt,
            heading: targetHeading
        };

        // Optional: Check if the target is significantly different from the last applied one
        // to prevent excessive updates if the state flickers but the target remains the same.
        // This requires careful comparison logic.
        // if (JSON.stringify(currentView) !== JSON.stringify(lastAppliedViewpoint.current)) {

            console.log(`Updating map viewpoint (${viewpointSource}):`, currentView);

            mapRef.current.panTo(targetCenter);
            if (typeof targetZoom === 'number') mapRef.current.setZoom(targetZoom);
            if (typeof targetTilt === 'number') mapRef.current.setTilt(targetTilt);
            if (typeof targetHeading === 'number') mapRef.current.setHeading(targetHeading);

            // lastAppliedViewpoint.current = currentView; // Store the applied view
        // } else {
        //     console.log(`Skipping viewpoint update, target unchanged (${viewpointSource})`);
        // }

    } else {
        console.log(`No valid target center determined (${viewpointSource}), viewpoint not updated.`);
    }

    // Update previous coords for next calculation
    setPreviousCoords(userCoords);

  }, [
      // Dependencies: Re-run when any relevant state changes
      mapRef, isMapLoaded,
      userCoords, isOnCampus, isLocating,
      selectedBuildingId, currentFloorGeoJSON,
      selectedSearchResult,
      previousCoords // Include previousCoords if heading calc depends on it changing state
    ]);

  // This hook doesn't need to return anything as it acts directly on the map
};

export default useMapViewpoint;
