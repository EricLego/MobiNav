// src/mobile/hooks/useMapViewpoint.js
import { useEffect, useContext } from 'react';
import { MapContext } from '../contexts/MapContext'; // Import the context

const useMapViewpoint = () => {
  // Consume the context to get mapRef and target viewpoint state
  const {
    mapRef,
    isMapLoaded, // Ensure map instance is ready
    viewpointCenter,
    viewpointZoom,
    viewpointTilt,
    viewpointHeading
  } = useContext(MapContext);

  useEffect(() => {
    // Check if map instance is loaded and we have a valid center
    if (mapRef.current && isMapLoaded && viewpointCenter &&
        typeof viewpointCenter.lat === 'number' &&
        typeof viewpointCenter.lng === 'number') {

      console.log("Updating map viewpoint via context hook:", {
          center: viewpointCenter,
          zoom: viewpointZoom,
          tilt: viewpointTilt,
          heading: viewpointHeading
      });

      // Pan to the target center
      mapRef.current.panTo({ lat: viewpointCenter.lat, lng: viewpointCenter.lng });

      // Set zoom, tilt, and heading if they are valid numbers
      if (typeof viewpointZoom === 'number') {
        mapRef.current.setZoom(viewpointZoom);
      }
      if (typeof viewpointTilt === 'number') {
        mapRef.current.setTilt(viewpointTilt);
      }
      if (typeof viewpointHeading === 'number') {
        mapRef.current.setHeading(viewpointHeading);
      }
    }
    // Dependencies: Run when any target viewpoint property or map load status changes
  }, [mapRef, isMapLoaded, viewpointCenter, viewpointZoom, viewpointTilt, viewpointHeading]);

  // This hook doesn't need to return anything
};

export default useMapViewpoint;
